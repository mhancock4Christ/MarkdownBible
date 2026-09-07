import sqlite3
conn = sqlite3.connect('kjv.sqlite')
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT book, chapter, verse, text FROM verses WHERE chapter=1 AND book=43 ORDER BY verse LIMIT 5").fetchall()
for r in rows:
    print(r['verse'], repr(r['text'][:180]))
