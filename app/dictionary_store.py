import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path


MAX_QUERY_LENGTH = 100
MAX_PAGE_SIZE = 100


def _is_headword_preface(entry: dict) -> bool:
    definition = (entry["definition"] or "").strip()
    return bool(
        entry["etymology"]
        and entry["part_of_speech"]
        and "plural" in entry["part_of_speech"].casefold()
        and re.fullmatch(r"[\w'’-]+[.!?]?", definition)
    )


def _like_pattern(query: str) -> str:
    pattern = []
    for character in query:
        if character == "*":
            pattern.append("%")
        elif character == "?":
            pattern.append("_")
        elif character in "\\%_":
            pattern.append("\\")
            pattern.append(character)
        else:
            pattern.append(character)
    return "".join(pattern)


def search_dictionary(
    database_path: Path,
    query: str,
    limit: int = 50,
    offset: int = 0,
) -> dict:
    search_term = query.strip()
    if not search_term:
        raise ValueError("Enter a word to search.")
    if len(search_term) > MAX_QUERY_LENGTH:
        raise ValueError(f"Search terms must be {MAX_QUERY_LENGTH} characters or fewer.")
    if not 1 <= limit <= MAX_PAGE_SIZE:
        raise ValueError(f"Page size must be between 1 and {MAX_PAGE_SIZE}.")
    if offset < 0:
        raise ValueError("Result offset cannot be negative.")

    database_file = Path(database_path)
    if not database_file.is_file():
        raise FileNotFoundError(f"Dictionary database not found: {database_file}")

    has_wildcards = "*" in search_term or "?" in search_term
    if has_wildcards:
        where_clause = "headword LIKE ? ESCAPE '\\'"
        search_value = _like_pattern(search_term)
    else:
        where_clause = "headword = ? COLLATE NOCASE"
        search_value = search_term

    with closing(sqlite3.connect(database_file)) as connection:
        connection.row_factory = sqlite3.Row
        total = connection.execute(
            f"""
            SELECT COUNT(DISTINCT headword COLLATE NOCASE)
            FROM dictionary
            WHERE {where_clause}
            """,
            (search_value,),
        ).fetchone()[0]
        headwords = connection.execute(
            f"""
            SELECT headword
            FROM dictionary
            WHERE {where_clause}
            GROUP BY headword COLLATE NOCASE
            ORDER BY headword COLLATE NOCASE
            LIMIT ? OFFSET ?
            """,
            (search_value, limit, offset),
        ).fetchall()
        selected_headwords = [row["headword"] for row in headwords]
        if selected_headwords:
            placeholders = ",".join("?" for _ in selected_headwords)
            rows = connection.execute(
                f"""
                SELECT headword, part_of_speech, languages, etymology, notes, definition
                FROM dictionary
                WHERE headword COLLATE NOCASE IN ({placeholders})
                ORDER BY headword COLLATE NOCASE, id
                """,
                selected_headwords,
            ).fetchall()
        else:
            rows = []

    entries_by_headword = {}
    for row in rows:
        entry = dict(row)
        entry["languages"] = json.loads(entry["languages"] or "[]")
        entry["notes"] = json.loads(entry["notes"] or "[]")
        entry["is_headword_preface"] = _is_headword_preface(entry)
        entries_by_headword.setdefault(entry["headword"].casefold(), {
            "headword": entry["headword"],
            "definitions": [],
        })["definitions"].append(entry)

    entries = [
        entries_by_headword[headword.casefold()]
        for headword in selected_headwords
    ]

    return {
        "query": search_term,
        "total": total,
        "offset": offset,
        "limit": limit,
        "definition_count": sum(
            not definition["is_headword_preface"]
            for entry in entries
            for definition in entry["definitions"]
        ),
        "results": entries,
    }


def lookup_dictionary(database_path: Path, word: str) -> dict | None:
    search_term = word.strip()
    if not search_term:
        raise ValueError("Enter a word to look up.")
    if len(search_term) > MAX_QUERY_LENGTH:
        raise ValueError(f"Words must be {MAX_QUERY_LENGTH} characters or fewer.")

    database_file = Path(database_path)
    if not database_file.is_file():
        raise FileNotFoundError(f"Dictionary database not found: {database_file}")

    normalized_word = search_term.casefold()
    with closing(sqlite3.connect(database_file)) as connection:
        connection.row_factory = sqlite3.Row
        matching_headword = connection.execute(
            """
            SELECT headword
            FROM dictionary
            WHERE headword = ? COLLATE NOCASE
            ORDER BY id
            LIMIT 1
            """,
            (normalized_word,),
        ).fetchone()
        root = normalized_word
        if matching_headword is None:
            lemma = connection.execute(
                "SELECT root FROM lemmas WHERE form = ? COLLATE NOCASE",
                (normalized_word,),
            ).fetchone()
            if lemma is None:
                return None
            root = lemma["root"]
            matching_headword = connection.execute(
                """
                SELECT headword
                FROM dictionary
                WHERE headword = ? COLLATE NOCASE
                ORDER BY id
                LIMIT 1
                """,
                (root,),
            ).fetchone()
            if matching_headword is None:
                return None

        headword = matching_headword["headword"]
        rows = connection.execute(
            """
            SELECT headword, part_of_speech, languages, etymology, notes, definition
            FROM dictionary
            WHERE headword = ? COLLATE NOCASE
            ORDER BY id
            """,
            (headword,),
        ).fetchall()

    definitions = []
    for row in rows:
        entry = dict(row)
        entry["languages"] = json.loads(entry["languages"] or "[]")
        entry["notes"] = json.loads(entry["notes"] or "[]")
        entry["is_headword_preface"] = _is_headword_preface(entry)
        definitions.append(entry)

    return {
        "query": search_term,
        "headword": headword,
        "is_lemma": normalized_word != headword.casefold(),
        "definitions": definitions,
        "definition_count": sum(
            not definition["is_headword_preface"]
            for definition in definitions
        ),
    }
