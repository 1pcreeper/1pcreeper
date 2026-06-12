import threading
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI
from rabbitmq import start_consumer


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("⚡ [FastAPI] Booting up background workers...", flush=True)

    # Start RabbitMQ in a background thread
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

    yield

    print("🛑 [FastAPI] Shutting down workers...", flush=True)

app = FastAPI(title="Hunyuan3D AI Worker", lifespan=lifespan)


@app.get("/health")
def health_check() -> Dict[str, str]:
    print("🔍 [FastAPI] Health check requested...", flush=True)
    return {"status": "alive", "gpu": "ready", "queue": "listening"}
