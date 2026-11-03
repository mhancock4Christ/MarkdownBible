import asyncio
import json

import pytest
from fastapi import HTTPException

from app import main, main_Local
from app.leaderboard_store import load_leaderboard, record_completion, validate_completion


@pytest.mark.parametrize(
    "name",
    ["<script>alert(1)</script>", "sh1t stirrer", "s.h.i.t", "p.o.r.n"],
)
def test_display_names_reject_markup_and_profanity(name):
    with pytest.raises(ValueError):
        validate_completion(name, 30_000, 0)


def test_display_name_and_score_are_normalized_and_validated():
    assert validate_completion("  Grace O'Neil  ", 1_000, 0)["name"] == "Grace O'Neil"
    assert validate_completion("", 1_000, 0)["name"] == "Guest"

    for elapsed_ms, mistakes in [(999, 0), (86_400_001, 0), (1_000, -1), (1_000, 10_001)]:
        with pytest.raises(ValueError):
            validate_completion("Grace", elapsed_ms, mistakes)


def test_json_board_keeps_latest_twenty_and_fastest_ten(tmp_path):
    path = tmp_path / "book_order_leaderboard.json"
    record_completion(path, validate_completion("Fast finisher", 1_000, 0))
    for index in range(1, 21):
        record_completion(path, validate_completion(f"Player {index}", 2_000 + index, 0))

    board = load_leaderboard(path)

    assert path.is_file()
    assert len(board["recent"]) == 20
    assert board["recent"][0]["name"] == "Player 1"
    assert board["recent"][-1]["name"] == "Player 20"
    assert len(board["fastest"]) == 10
    assert board["fastest"][0]["name"] == "Fast finisher"
    assert board["fastest"][0]["elapsedMs"] == 1_000
    assert json.loads(path.read_text(encoding="utf-8")) == board


def test_invalid_json_is_reported(tmp_path):
    path = tmp_path / "book_order_leaderboard.json"
    path.write_text("{", encoding="utf-8")

    with pytest.raises(ValueError, match="could not be read"):
        load_leaderboard(path)


def test_invalid_json_entries_are_reported(tmp_path):
    path = tmp_path / "book_order_leaderboard.json"
    path.write_text(json.dumps({"recent": [{"name": "Bad"}], "fastest": []}), encoding="utf-8")

    with pytest.raises(ValueError, match="invalid entry"):
        load_leaderboard(path)


@pytest.mark.parametrize("app_module", [main, main_Local])
def test_api_routes_save_and_validate_competition_results(monkeypatch, tmp_path, app_module):
    monkeypatch.setattr(app_module, "LEADERBOARD_PATH", str(tmp_path / "scores.json"))

    board = asyncio.run(app_module.submit_book_order_result({
        "name": "Bible reader",
        "elapsedMs": 15_000,
        "mistakes": 1,
    }))
    assert board["recent"][0]["name"] == "Bible reader"
    assert asyncio.run(app_module.get_book_order_leaderboard()) == board

    with pytest.raises(HTTPException) as error:
        asyncio.run(app_module.submit_book_order_result({
            "name": "<script>alert(1)</script>",
            "elapsedMs": 15_000,
            "mistakes": 0,
        }))
    assert error.value.status_code == 400
