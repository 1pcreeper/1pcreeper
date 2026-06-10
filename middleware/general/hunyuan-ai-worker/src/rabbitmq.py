import json

import pika
import requests
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from pydantic import BaseModel, ValidationError
from src.hunyuan import execute_hunyuan_inference
from src.minio_client import get_minio_client


class ObjGenerationTaskEvent(BaseModel):
    projectId: int
    minioInputPath: str  # e.g., "inputs/project_123_ref.jpg"
    fileName: str


def start_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('localhost', port=30002)
    )
    channel = connection.channel()

    exchange_name = 'obj-generation-queue'
    channel.exchange_declare(exchange=exchange_name,
                             exchange_type='topic', durable=True)

    queue_name = 'hunyuan-worker-queue'
    channel.queue_declare(queue=queue_name, durable=True)

    channel.queue_bind(exchange=exchange_name,
                       queue=queue_name, routing_key='#')

    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue=queue_name, on_message_callback=process_message)

    print("🎧 [RabbitMQ] Bound to obj-generation-queue Exchange. Listening for tasks...")
    channel.start_consuming()


def process_message(
    ch: BlockingChannel,
    method: Basic.Deliver,
    properties: BasicProperties,
    body: bytes
) -> None:
    # Instantiate your clients
    minio_client = get_minio_client()
    bucket_name: str = "3d-projects"

    try:
        payload = json.loads(body.decode('utf-8'))
        task = ObjGenerationTaskEvent(**payload)
        print(f"📦 [RabbitMQ] Processing job for Project {task.projectId}")

        # 1. Fetch file from MinIO storage
        response = minio_client.get_object(bucket_name, task.minioInputPath)
        image_data: bytes = response.read()
        response.close()
        response.release_conn()

        # 2. Execute the inference engine
        glb_stream, obj_stream = execute_hunyuan_inference(
            task.projectId, image_data)

        # 3. Save generated mesh assets back to MinIO
        glb_path: str = f"outputs/{task.projectId}/scene.glb"
        obj_path: str = f"outputs/{task.projectId}/scene.obj"

        minio_client.put_object(
            bucket_name, glb_path, glb_stream, length=glb_stream.getbuffer(
            ).nbytes, content_type="model/gltf-binary"
        )
        minio_client.put_object(
            bucket_name, obj_path, obj_stream, length=obj_stream.getbuffer(
            ).nbytes, content_type="text/plain"
        )

        # 4. Webhook callback to Spring Boot running locally on host machine
        # Adjust endpoint to match your exact Java controller structure
        callback_url: str = f"http://localhost:10001/internal/projects/{task.projectId}/complete"
        webhook_payload = {
            "status": "READY",
            "viewGlbUrl": f"/{bucket_name}/{glb_path}",
            "rawObjUrl": f"/{bucket_name}/{obj_path}"
        }

        print(f"🔗 [Webhook] Sending completion signal to Spring Boot...")
        res = requests.patch(callback_url, json=webhook_payload, timeout=10)

        if res.status_code == 200:
            print(
                f"✅ [RabbitMQ] Successfully finalized Project {task.projectId}!")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            print(
                f"⚠️ [Webhook] Spring Boot returned status {res.status_code}. Requeuing task.")
            print(f"Response content: {res.text}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    except Exception as e:
        print(f"❌ [RabbitMQ] Pipeline failure: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
