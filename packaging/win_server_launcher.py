import os
import sys
import threading
import webbrowser
from pathlib import Path

import uvicorn


def main() -> None:
    if getattr(sys, "frozen", False):
        base_dir = Path(sys.executable).resolve().parent
    else:
        base_dir = Path(__file__).resolve().parent

    os.chdir(str(base_dir))
    if str(base_dir) not in sys.path:
        sys.path.insert(0, str(base_dir))

    try:
        import main as app_module
    except Exception as exc:  # pragma: no cover
        print(f"Failed to import app module: {exc}")
        raise

    threading.Timer(1.5, lambda: webbrowser.open("http://127.0.0.1:8000/", new=2)).start()
    uvicorn.run(app_module.app, host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    main()
