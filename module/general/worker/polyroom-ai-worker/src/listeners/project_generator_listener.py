import base64
import json
import os
import time
import uuid
from typing import List

import confluent_kafka
import pika
import requests
from confluent_kafka import (Consumer, KafkaError, KafkaException,
                             TopicPartition)
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from pydantic import BaseModel, ValidationError
from src.config.env import (GENERAL_KAFKA_BOOTSTRAP_SERVERS,
                            GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS)
from src.config.minio_client import get_minio_client
from src.services.project_generator_service import \
    execute_polyroom_inference_project_generator


class ObjGenerationTaskEvent(BaseModel):
    projectId: int
    minioInputPaths: List[str]


conf = {
    'bootstrap.servers': GENERAL_KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'general-public-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False
}


def start_project_generator_listener():
    consumer = Consumer(conf)

    topic_name = "general-kafka-polyroom-project-generate-topic"
    partition_id = 0
    topic_partition = TopicPartition(
        topic_name, partition_id, confluent_kafka.OFFSET_BEGINNING)

    consumer.assign([topic_partition])

    print("🎧 [Kafka] Listening for tasks...", flush=True)

    try:
        # 4. Continuous polling loop
        while True:
            # Poll for new messages, waiting up to 1 second
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                continue

            if msg.error():
                # 1. Ignore "End of Partition" warnings (completely normal)
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue

                # 2. Handle the "Topic not ready yet" race condition gracefully
                elif msg.error().code() == KafkaError.UNKNOWN_TOPIC_OR_PART:
                    print(
                        f"⚠️ [Kafka] Topic metadata syncing, retrying... ({msg.error()})")
                    time.sleep(1)  # Wait 1 second and let it try again!
                    continue

                # 3. If it's a genuine fatal error, print it and break
                else:
                    print(f"❌ [Kafka] Consumer error: {msg.error()}")
                    break

            # 5. Process the message
            try:
                # Decode the raw bytes into a string, then parse the JSON
                raw_bytes = msg.value()
                json_string = base64.b64decode(raw_bytes).decode("utf-8")
                event_data = json.loads(json_string)

                print(f"✅Task Consumed: {event_data}\n")
                process_message(event=event_data, consumer=consumer)

            except json.JSONDecodeError:
                # Fallback if a message isn't valid JSON
                print(
                    f"⚠️ Received non-JSON message: {msg.value().decode('utf-8')}\n")

    except KeyboardInterrupt:
        print("\nShutting down consumer...")
    finally:
        # Close down consumer to commit final offsets and leave the group cleanly
        consumer.close()


def process_message(
    event: any,
    consumer: Consumer
) -> None:
    minio_client = get_minio_client()
    bucket_name: str = "3d-projects"
    project_id = None  # Scoped outside so the exception block can read it safely

    try:
        task = ObjGenerationTaskEvent(**event)
        project_id = task.projectId
        print(
            f"📦 [Kafka] Processing job for Project {project_id}", flush=True)
        processing_callback = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/status"
        processing_payload = {
            "status": "PROCESSING",
            "viewGlbUrl": None,
            "rawObjUrl": None
        }
        requests.patch(processing_callback, json=processing_payload, timeout=5)

        image_data_list = []

        # 2. Fetch ALL files from MinIO safely
        for path in task.minioInputPaths:
            response = minio_client.get_object(bucket_name, path)
            try:
                image_data_list.append(response.read())
            finally:
                # Guaranteed execution to close connection streams immediately
                response.close()
                response.release_conn()

        # 3. Run Inference Subprocess
        glb_stream, obj_stream = execute_polyroom_inference_project_generator(
            project_id, image_data_list)

        mesh_uuid = uuid.uuid4()

        # 4. Save generated mesh assets back to MinIO
        glb_path: str = f"outputs/{project_id}/{mesh_uuid}.glb"
        obj_path: str = f"outputs/{project_id}/{mesh_uuid}.obj"

        minio_client.put_object(
            bucket_name, glb_path, glb_stream, length=glb_stream.getbuffer(
            ).nbytes, content_type="model/gltf-binary"
        )
        minio_client.put_object(
            bucket_name, obj_path, obj_stream, length=obj_stream.getbuffer(
            ).nbytes, content_type="text/plain"
        )

        # 5. Success Webhook callback to Spring Boot
        callback_url: str = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/status"
        webhook_payload = {
            "status": "READY",
            "viewGlbUrl": f"/{bucket_name}/{glb_path}",
            "rawObjUrl": f"/{bucket_name}/{obj_path}"
        }

        print(
            f"🔗 [Webhook] Sending completion signal to obj-generate-service...", flush=True)
        res = requests.patch(callback_url, json=webhook_payload, timeout=10)

        if res.status_code == 200:
            print(
                f"✅ [Kafka] Successfully finalized Project {project_id}!", flush=True)
            consumer.commit()
        else:
            print(
                f"⚠️ [Webhook] obj-generate-service returned status {res.status_code}. Requeuing task.", flush=True)

            raise RuntimeError(
                f"obj-generate-service callback failed with status {res.status_code}")

    except Exception as e:
        print(f"❌ [Kafka] Pipeline failure encountered: {e}", flush=True)

        # If we successfully determined the project ID before the crash, update the state to FAILED
        if project_id is not None:
            try:
                callback_url = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/status"
                fail_payload = {
                    "status": "FAILED",
                    "viewGlbUrl": None,
                    "rawObjUrl": None
                }
                print(
                    f"🔗 [Webhook] Sending FAILURE signal to obj-generate-service for Project {project_id}...", flush=True)
                requests.patch(callback_url, json=fail_payload, timeout=5)
                consumer.commit()
            except Exception as webhook_err:
                print(
                    f"⚠️ [Webhook] Failed to dispatch error fallback to obj-generate-service: {webhook_err}", flush=True)
