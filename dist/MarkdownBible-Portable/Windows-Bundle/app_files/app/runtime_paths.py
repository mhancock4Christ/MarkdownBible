import os
import sys
from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
RESOURCE_DIR = Path(
    os.environ.get(
        "MARKDOWN_BIBLE_RESOURCE_DIR",
        getattr(sys, "_MEIPASS", APP_DIR),
    )
)
EXECUTABLE_DIR = (
    Path(sys.executable).resolve().parent
    if getattr(sys, "frozen", False)
    else APP_DIR
)
DATA_DIR = Path(os.environ.get("MARKDOWN_BIBLE_DATA_DIR", EXECUTABLE_DIR / "data"))
DATABASE_PATH = DATA_DIR / "kjv.sqlite"
DICTIONARY_PATH = DATA_DIR / "dictionary.db"
LEADERBOARD_PATH = DATA_DIR / "book_order_leaderboard.json"
ICON_PATH = RESOURCE_DIR / "assets" / "icon.ico"
STATIC_DIR = RESOURCE_DIR / "static"
TEMPLATE_DIR = RESOURCE_DIR / "templates"
