import threading
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI
from src.config.env import GENERAL_KAFKA_BOOTSTRAP_SERVERS
from src.listeners.project_generator_listener import \
    start_project_generator_listener
from src.utils.kafka_admin import create_topic_if_not_exists


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("⚡ [FastAPI] Booting up background workers...", flush=True)

    create_topic_if_not_exists(
        broker=GENERAL_KAFKA_BOOTSTRAP_SERVERS,
        topic_name="general-kafka-polyroom-project-generate-topic"
    )

    # Start Kafka in a background thread
    project_generator_listener_thread = threading.Thread(
        target=start_project_generator_listener, daemon=True)
    project_generator_listener_thread.start()

    yield

    print("🛑 [FastAPI] Shutting down workers...", flush=True)

app = FastAPI(title="Polyroom AI Worker", lifespan=lifespan)


@app.get("/health")
def health_check() -> Dict[str, str]:
    print("🔍 [FastAPI] Health check requested...", flush=True)
    return {"status": "alive", "gpu": "ready", "queue": "listening"}
