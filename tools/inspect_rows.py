import sqlite3
from pathlib import Path

database_path = Path(__file__).resolve().parents[1] / "app" / "data" / "kjv.sqlite"
conn = sqlite3.connect(database_path)
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT book, chapter, verse, text FROM verses WHERE chapter=1 AND book=43 ORDER BY verse LIMIT 5").fetchall()
for r in rows:
    print(r['verse'], repr(r['text'][:180]))
