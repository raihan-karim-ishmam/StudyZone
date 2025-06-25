# cloud_config.py
# this one's a stub — simulating Azure setup (blob + key vault)
# not live yet, base scaling/deployment

import os
import logging

# fake blob storage prep (not wired up yet)
def configure_blob_storage():
    logging.info("Connecting to Azure Blob Storage...")
    return os.getenv("AZURE_BLOB_URL", "https://fake.blob.core.windows.net/container")

# fake key vault access — would use azure-identity/client libs later
def fetch_secret_from_key_vault(secret_name: str):
    logging.info(f"Fetching secret: {secret_name} (mock)")
    # placeholder fake secrets
    secrets = {
        "OPENAI_API_KEY": "sk-test-key",
        "DB_PASSWORD": "supersecret"
    }
    return secrets.get(secret_name, "missing")
