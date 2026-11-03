import json
import sqlite3

import pytest

from app.dictionary_store import search_dictionary


@pytest.fixture
def dictionary_db(tmp_path):
    database_path = tmp_path / "dictionary.db"
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE dictionary (
                id INTEGER PRIMARY KEY,
                headword TEXT NOT NULL,
                part_of_speech TEXT,
                languages TEXT,
                etymology TEXT,
                notes TEXT,
                definition TEXT
            )
            """
        )
        connection.execute(
            "CREATE TABLE lemmas (form TEXT PRIMARY KEY, root TEXT NOT NULL)"
        )
        connection.executemany(
            """
            INSERT INTO dictionary
                (headword, part_of_speech, languages, etymology, notes, definition)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                ("LOVE", "noun", json.dumps(["English"]), "[From love.]", "[]", "Affection."),
                ("LOVE", "verb", "[]", None, json.dumps(["[Not used.]"]), "To regard with affection."),
                ("LOVESICK", "adjective", "[]", None, "[]", "Pining with love."),
                ("DOVE", "noun", "[]", None, "[]", "A bird."),
                ("LOVES%", "noun", "[]", None, "[]", "A literal percent sign."),
                ("WIFE", "noun plural", json.dumps(["German"]), "[G., a woman.]", "[]", "Wives."),
                ("WIFE", None, "[]", None, "[]", "A lawful consort."),
                ("WIFE", None, "[]", None, "[]", "A woman of low employment."),
            ],
        )
        connection.execute("INSERT INTO lemmas (form, root) VALUES (?, ?)", ("loveth", "LOVE"))
    return database_path


def test_search_dictionary_returns_all_exact_headword_definitions(dictionary_db):
    result = search_dictionary(dictionary_db, "love")

    assert result["total"] == 1
    assert len(result["results"]) == 1
    assert result["results"][0]["headword"] == "LOVE"
    assert [entry["part_of_speech"] for entry in result["results"][0]["definitions"]] == [
        "noun",
        "verb",
    ]
    assert result["results"][0]["definitions"][0]["languages"] == ["English"]
    assert result["results"][0]["definitions"][1]["notes"] == ["[Not used.]"]
    assert result["definition_count"] == 2


def test_search_dictionary_does_not_count_word_preface_as_a_definition(dictionary_db):
    result = search_dictionary(dictionary_db, "wife")

    assert result["total"] == 1
    assert result["definition_count"] == 2
    assert len(result["results"][0]["definitions"]) == 3
    assert result["results"][0]["definitions"][0]["is_headword_preface"] is True
    assert all(
        not definition["is_headword_preface"]
        for definition in result["results"][0]["definitions"][1:]
    )


def test_lookup_dictionary_resolves_lemma_and_preserves_exact_headword(dictionary_db):
    from app.dictionary_store import lookup_dictionary

    exact = lookup_dictionary(dictionary_db, "love")
    lemma = lookup_dictionary(dictionary_db, "loveth")

    assert exact["headword"] == "LOVE"
    assert exact["is_lemma"] is False
    assert lemma["headword"] == "LOVE"
    assert lemma["is_lemma"] is True
    assert lemma["query"] == "loveth"
    assert lemma["definition_count"] == 2


def test_lookup_dictionary_returns_none_for_unknown_word(dictionary_db):
    from app.dictionary_store import lookup_dictionary

    assert lookup_dictionary(dictionary_db, "notaword") is None


@pytest.mark.parametrize(
    ("query", "expected_headwords"),
    [
        ("love*", ["LOVE", "LOVES%", "LOVESICK"]),
        ("?ove", ["DOVE", "LOVE"]),
        ("love*%", ["LOVES%"]),
    ],
)
def test_search_dictionary_supports_wildcards_and_escaped_like_characters(
    dictionary_db, query, expected_headwords
):
    result = search_dictionary(dictionary_db, query)

    assert [word["headword"] for word in result["results"]] == expected_headwords


def test_search_dictionary_paginates_definitions(dictionary_db):
    first_page = search_dictionary(dictionary_db, "*", limit=2)
    second_page = search_dictionary(dictionary_db, "*", limit=2, offset=2)

    assert first_page["total"] == 5
    assert first_page["definition_count"] == 3
    assert len(first_page["results"]) == 2
    assert len(second_page["results"]) == 2
    assert [word["headword"] for word in first_page["results"]] == ["DOVE", "LOVE"]
    assert len(first_page["results"][1]["definitions"]) == 2
    assert [word["headword"] for word in second_page["results"]] == ["LOVES%", "LOVESICK"]


@pytest.mark.parametrize(
    ("query", "limit", "offset"),
    [("", 50, 0), ("a" * 101, 50, 0), ("word", 0, 0), ("word", 101, 0), ("word", 50, -1)],
)
def test_search_dictionary_rejects_invalid_search_parameters(
    dictionary_db, query, limit, offset
):
    with pytest.raises(ValueError):
        search_dictionary(dictionary_db, query, limit, offset)


def test_search_dictionary_reports_missing_database(tmp_path):
    with pytest.raises(FileNotFoundError):
        search_dictionary(tmp_path / "missing.db", "word")
