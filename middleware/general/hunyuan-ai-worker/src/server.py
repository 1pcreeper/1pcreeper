import threading
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI
from src.rabbitmq import start_consumer


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("⚡ [FastAPI] Booting up background workers...")

    # Start RabbitMQ in a background thread
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

    yield

    print("🛑 [FastAPI] Shutting down workers...")

app = FastAPI(title="Hunyuan3D AI Worker", lifespan=lifespan)


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "alive", "gpu": "ready", "queue": "listening"}
