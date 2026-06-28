from confluent_kafka import KafkaException
from confluent_kafka.admin import AdminClient, NewTopic


def create_topic_if_not_exists(broker: str, topic_name: str, partitions: int = 3, replication_factor: int = 1) -> None:
    # 1. Initialize the AdminClient
    admin_client = AdminClient({'bootstrap.servers': broker})

    # 2. Define the topic
    new_topic = NewTopic(
        topic_name,
        num_partitions=partitions,
        replication_factor=replication_factor
    )

    # 3. Request creation (This returns a dictionary of background tasks called 'Futures')
    print(f"⏳ Checking/Creating topic '{topic_name}'...")
    futures = admin_client.create_topics([new_topic])

    # 4. Wait for the background task to finish and check the result
    for topic, future in futures.items():
        try:
            future.result()  # This will throw an error if creation fails
            print(f"🚀 Topic '{topic}' created successfully!")

        except KafkaException as e:
            # Check the specific error code
            error_code = e.args[0].name()
            if error_code == "TOPIC_ALREADY_EXISTS":
                print(f"✅ Topic '{topic}' already exists.")
            else:
                print(f"❌ Failed to create topic '{topic}': {e}")


# Run it!
if __name__ == "__main__":
    create_topic_if_not_exists('localhost:9092', 'my-new-topic')
