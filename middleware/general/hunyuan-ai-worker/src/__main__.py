import uvicorn


def main() -> None:
    print("🚀 Starting FastAPI AI Worker...")
    # 'src.server:app' points Uvicorn to the right module path
    uvicorn.run("src.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
