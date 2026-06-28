from minio import Minio
from src.config.env import (GENERAL_MINIO_ACCESS_KEY, GENERAL_MINIO_ENDPOINT,
                            GENERAL_MINIO_SECRET_KEY)


def get_minio_client() -> Minio:
    return Minio(
        endpoint=GENERAL_MINIO_ENDPOINT,
        access_key=GENERAL_MINIO_ACCESS_KEY,
        secret_key=GENERAL_MINIO_SECRET_KEY,
        secure=False
    )
