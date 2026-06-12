import uvicorn


def main() -> None:
    print("🚀 Starting FastAPI AI Worker...")
    uvicorn.run("server:app", host="0.0.0.0", port=80, reload=True)


if __name__ == "__main__":
    main()
