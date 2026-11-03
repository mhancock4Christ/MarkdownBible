import uvicorn

from app.main_Local import app


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000, log_config=None)
