import uvicorn
from src.config.env import GENERAL_POLYROOM_AI_WORKER_SERVER_PORT


def main() -> None:
    print("🚀 Starting FastAPI AI Worker...")
    uvicorn.run("src.handlers.server:app", host="0.0.0.0",
                port=GENERAL_POLYROOM_AI_WORKER_SERVER_PORT, reload=True)


if __name__ == "__main__":
    main()
