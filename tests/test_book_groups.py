from app.main import BOOK_GROUPS, get_selected_book_numbers
from app.main_Local import BOOK_GROUPS as LOCAL_BOOK_GROUPS


def test_book_groups_use_traditional_bible_divisions():
    assert LOCAL_BOOK_GROUPS == BOOK_GROUPS
    assert BOOK_GROUPS["Old Testament"] == list(range(1, 40))
    assert BOOK_GROUPS["New Testament"] == list(range(40, 67))
    assert BOOK_GROUPS["Law"] == [1, 2, 3, 4, 5]
    assert BOOK_GROUPS["History"] == list(range(6, 18))
    assert BOOK_GROUPS["Poetry"] == [18, 19, 20, 21, 22]
    assert BOOK_GROUPS["Prophets"] == list(range(23, 40))
    assert "Psalms" not in BOOK_GROUPS


def test_selected_book_numbers_match_grouping():
    assert get_selected_book_numbers("Poetry") == [18, 19, 20, 21, 22]
    assert get_selected_book_numbers("History") == list(range(6, 18))
