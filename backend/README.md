# Backend

This directory contains the FastAPI app, model training scripts, and API code for the text classification tool.

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Train the model and start the API server:
   ```bash
   uvicorn train_and_serve:app --reload
   ```

- The API will be available at http://localhost:8000
- The `/predict` endpoint accepts POST requests with `{ "text": "your feedback here" }` and returns predicted categories and detected language. 