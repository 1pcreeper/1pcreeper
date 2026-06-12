import json
import os
from typing import List

import pika
import requests
from env import (GENERAL_HUNYUAN_AI_WORKER_QUEUE_FROM_NAME,
                 GENERAL_HUNYUAN_AI_WORKER_QUEUE_TO_EXCHANGE,
                 GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS,
                 GENERAL_RABBITMQ_HOST, GENERAL_RABBITMQ_PORT)
from hunyuan import execute_hunyuan_inference
from minio_client import get_minio_client
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from pydantic import BaseModel, ValidationError


class ObjGenerationTaskEvent(BaseModel):
    projectId: int
    minioInputPaths: List[str]


def start_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=GENERAL_RABBITMQ_HOST, port=GENERAL_RABBITMQ_PORT,
            heartbeat=3600,
            blocked_connection_timeout=3600
        )
    )
    channel = connection.channel()

    exchange_name = GENERAL_HUNYUAN_AI_WORKER_QUEUE_TO_EXCHANGE
    channel.exchange_declare(exchange=exchange_name,
                             exchange_type='topic', durable=True)

    queue_name = GENERAL_HUNYUAN_AI_WORKER_QUEUE_FROM_NAME
    channel.queue_declare(queue=queue_name, durable=True)

    channel.queue_bind(exchange=exchange_name,
                       queue=queue_name, routing_key='#')

    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue=queue_name, on_message_callback=process_message)

    print("🎧 [RabbitMQ] Bound to obj-generation-queue Exchange. Listening for tasks...", flush=True)
    channel.start_consuming()


def process_message(
    ch: BlockingChannel,
    method: Basic.Deliver,
    properties: BasicProperties,
    body: bytes
) -> None:
    minio_client = get_minio_client()
    bucket_name: str = "3d-projects"
    project_id = None  # Scoped outside so the exception block can read it safely

    try:
        # 1. Parse JSON Payload
        payload = json.loads(body.decode('utf-8'))
        task = ObjGenerationTaskEvent(**payload)
        project_id = task.projectId
        print(
            f"📦 [RabbitMQ] Processing job for Project {project_id}", flush=True)
        processing_callback = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/complete"
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
        glb_stream, obj_stream = execute_hunyuan_inference(
            project_id, image_data_list)

        # 4. Save generated mesh assets back to MinIO
        glb_path: str = f"outputs/{project_id}/scene.glb"
        obj_path: str = f"outputs/{project_id}/scene.obj"

        minio_client.put_object(
            bucket_name, glb_path, glb_stream, length=glb_stream.getbuffer(
            ).nbytes, content_type="model/gltf-binary"
        )
        minio_client.put_object(
            bucket_name, obj_path, obj_stream, length=obj_stream.getbuffer(
            ).nbytes, content_type="text/plain"
        )

        # 5. Success Webhook callback to Spring Boot
        callback_url: str = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/complete"
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
                f"✅ [RabbitMQ] Successfully finalized Project {project_id}!", flush=True)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            print(
                f"⚠️ [Webhook] obj-generate-service returned status {res.status_code}. Requeuing task.", flush=True)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            raise RuntimeError(
                f"obj-generate-service callback failed with status {res.status_code}")

    except Exception as e:
        print(f"❌ [RabbitMQ] Pipeline failure encountered: {e}", flush=True)

        # If we successfully determined the project ID before the crash, update the state to FAILED
        if project_id is not None:
            try:
                callback_url = f"http://{GENERAL_OBJ_GENERATE_SERVICE_IP_ADDRESS}/internal/projects/{project_id}/complete"
                fail_payload = {
                    "status": "FAILED",
                    "viewGlbUrl": None,
                    "rawObjUrl": None
                }
                print(
                    f"🔗 [Webhook] Sending FAILURE signal to obj-generate-service for Project {project_id}...", flush=True)
                requests.patch(callback_url, json=fail_payload, timeout=5)
            except Exception as webhook_err:
                print(
                    f"⚠️ [Webhook] Failed to dispatch error fallback to obj-generate-service: {webhook_err}", flush=True)

        # CRITICAL POISON PILL PROTECTION:
        # Acknowledge the message so it leaves the queue. If you requeue a code crash or bad data,
        # the queue loops forever, running inference and overheating your GPU infinitely!
        ch.basic_ack(delivery_tag=method.delivery_tag)
