# deploy_info.py
# just a basic helper to visualize mock deployment settings
# not tied to infra yet — prints out what we'll probably use

import json

def print_deployment_info():
    config = {
        "service_name": "studyzone-backend",
        "host": "0.0.0.0",
        "port": 5000,
        "env": {
            "OPENAI_API_KEY": "(hidden)",
            "ASSISTANT_ID": "(hidden)",
            "AZURE_BLOB_URL": "(maybe)"
        },
        "recommendations": [
            "Use Azure App Service (B1 or better)",
            "Store secrets in Azure Key Vault",
            "Log to App Insights later",
            "Blob Storage for persistent image uploads"
        ]
    }
    print("\nMock Deployment Config:\n")
    print(json.dumps(config, indent=2))

if __name__ == "__main__":
    print_deployment_info()
