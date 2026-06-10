from minio import Minio


def get_minio_client() -> Minio:
    return Minio(
        endpoint="localhost:30000",
        access_key="admin",
        secret_key="password123",
        secure=False
    )
