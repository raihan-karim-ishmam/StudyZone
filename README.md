# StudyZone Backend

This is the backend implementation for the StudyZone AI-powered study assistant. The backend is built using **FastAPI** and currently supports a **basic chatbot** that interacts with OpenAI's API. The chatbot is initialized with an **OpenAI API key** and an **OpenAI assitant ID**.

## Project Setup

### 1. Clone the Repository

### 2. Install Dependencies

Ensure you have Python installed (preferably 3.8 or higher), then install dependencies using:

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

The backend requires an `.env` file that contains the OpenAI API keys. This file **is not included** in the repository for security reasons. You must create it manually in the root directory.

#### **Create a `.env` File**
Inside the root directory, create a file named `.env` and add the following variables:

```plaintext
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_openai_assistant_id_here
```

Replace `your_openai_api_key_here` and `your_openai_assistant_id_here` with your actual OpenAI credentials.

### 4. Run the Backend Server

To start the FastAPI backend server, run:

```bash
uvicorn app:app --host 0.0.0.0 --port 5000
```

This will start the server at `http://127.0.0.1:5000/`, where you can interact with the chatbot via API requests.

### 5. Testing API Requests

Once the server is running, you can test the API using **cURL**, **Postman**, or any HTTP client.
PS: Backend calls has already been tested with **SwaggerUI** by FastAPI ✅

Example `POST` request to send a message to the chatbot:

```bash
curl -X 'POST' \
  'http://127.0.0.1:5000/chat' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello!"}'
```

### 6. Connecting with the Frontend

To integrate with the frontend, simply point the frontend's API requests to the backend URL (`http://127.0.0.1:5000/`). The backend will handle message exchanges with the chatbot.

---

## Notes

- The `.env` file **must** be created before running the server.
- Do **not** push the `.env` file to GitHub to avoid exposing API credentials.
- The project is still in the **early development phase**, with planned extensions for **to-do lists** and other study-related features.

