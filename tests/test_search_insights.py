import pytest

from app import main, main_Local


@pytest.mark.parametrize("app_module", [main, main_Local])
def test_search_insights_count_context_words_and_matched_books(app_module):
    rows = [
        {"book": 1, "cleaned_text": "The LORD made a bright morning."},
        {"book": 43, "cleaned_text": "Love is patient and bright."},
        {"book": 43, "cleaned_text": "The LORD is kind."},
    ]
    matched_rows = [rows[1], rows[2]]

    insights = app_module.build_search_insights(rows, "love", matched_rows)

    assert insights["verse_count"] == 3
    assert insights["books"] == [
        {"book": 1, "name": "Genesis", "count": 1},
        {"book": 43, "name": "John", "count": 2},
    ]
    assert insights["matched_books"] == [{"book": 43, "count": 2}]
    assert {entry["word"]: entry["count"] for entry in insights["words"]} == {
        "bright": 2,
        "kind": 1,
        "LORD": 2,
        "made": 1,
        "morning": 1,
        "patient": 1,
    }
