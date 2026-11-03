import json
import os
import re
import tempfile
import threading
import unicodedata
from datetime import datetime, timezone
from pathlib import Path


RECENT_LIMIT = 20
FASTEST_LIMIT = 10
_write_lock = threading.Lock()
_blocked_terms = {
    "ass", "asshole", "assholes", "bastard", "bitch", "bitches", "bullshit",
    "crap", "cunt", "damn", "dick", "fag", "fuck", "fucked", "fucker",
    "fuckers", "fucking", "hell", "nigger", "shit", "shithead", "shitty",
    "slut", "whore", "anal", "blowjob", "boobs", "clitoris", "cum", "dildo",
    "ejaculate", "erotic", "hentai", "hooker", "incest", "masturbate",
    "masturbation", "naked", "nude", "orgasm", "paedophile", "pedophile",
    "penis", "porn", "porno", "pornography", "prostitute", "pussy", "rape",
    "rapist", "sex", "sexual", "sexy", "testicle", "tits", "vagina", "vulva",
    "xxx",
}
_leet_translation = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"})
_display_name_pattern = re.compile(r"^[\w .'-]{1,32}$", re.UNICODE)
_blocked_term_patterns = [
    re.compile(r"(?<!\w)" + r"[\W_]*".join(re.escape(letter) for letter in word) + r"(?!\w)")
    for word in _blocked_terms
]


def validate_completion(name, elapsed_ms, mistakes):
    if not isinstance(name, str):
        raise ValueError("Enter a display name using letters, numbers, spaces, apostrophes, periods, or hyphens.")

    name = name.strip()
    if not name:
        name = "Guest"
    if len(name) > 32 or not _display_name_pattern.fullmatch(name):
        raise ValueError("Display names must be 1–32 characters and use only letters, numbers, spaces, apostrophes, periods, or hyphens.")

    normalized_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").casefold()
    normalized_name = normalized_name.translate(_leet_translation)
    if any(pattern.search(normalized_name) for pattern in _blocked_term_patterns):
        raise ValueError("Please choose a display name without profanity or adult terms.")

    if type(elapsed_ms) is not int or not 1_000 <= elapsed_ms <= 86_400_000:
        raise ValueError("Completion time must be between 1 second and 24 hours.")
    if type(mistakes) is not int or not 0 <= mistakes <= 10_000:
        raise ValueError("Mistakes must be a whole number between 0 and 10,000.")

    return {
        "name": name,
        "elapsedMs": elapsed_ms,
        "mistakes": mistakes,
        "completedAt": datetime.now(timezone.utc).isoformat(),
    }


def _read_board(path):
    if not path.exists():
        return {"recent": [], "fastest": []}

    try:
        board = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError("The leaderboard JSON file could not be read.") from error

    if (
        not isinstance(board, dict)
        or not isinstance(board.get("recent"), list)
        or not isinstance(board.get("fastest"), list)
    ):
        raise ValueError("The leaderboard JSON file has an invalid format.")
    if any(not _valid_entry(entry) for entry in board["recent"] + board["fastest"]):
        raise ValueError("The leaderboard JSON file contains an invalid entry.")
    return board


def _valid_entry(entry):
    return (
        isinstance(entry, dict)
        and isinstance(entry.get("name"), str)
        and type(entry.get("elapsedMs")) is int
        and type(entry.get("mistakes")) is int
        and isinstance(entry.get("completedAt"), str)
    )


def load_leaderboard(file_path):
    with _write_lock:
        board = _read_board(Path(file_path))
    return {"recent": board["recent"][:RECENT_LIMIT], "fastest": board["fastest"][:FASTEST_LIMIT]}


def record_completion(file_path, entry):
    path = Path(file_path)
    with _write_lock:
        board = _read_board(path)
        recent = [*board["recent"], entry][-RECENT_LIMIT:]
        fastest = sorted(
            [*board["fastest"], entry],
            key=lambda result: (result["elapsedMs"], result["completedAt"]),
        )[:FASTEST_LIMIT]
        updated_board = {"recent": recent, "fastest": fastest}

        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=path.parent,
                prefix=f".{path.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                json.dump(updated_board, temporary_file, ensure_ascii=False, indent=2)
                temporary_file.write("\n")
                temporary_file.flush()
                os.fsync(temporary_file.fileno())
            os.replace(temporary_path, path)
        except OSError:
            if temporary_path is not None:
                try:
                    temporary_path.unlink()
                except FileNotFoundError:
                    pass
            raise

    return updated_board
