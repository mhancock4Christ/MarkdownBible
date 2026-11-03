import asyncio

import pytest
from starlette.requests import Request

from app import main, main_Local


def make_request(path="/", query_string=b""):
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": path,
            "headers": [],
            "query_string": query_string,
            "server": ("test", 80),
            "scheme": "http",
            "client": ("test", 1),
            "root_path": "",
        }
    )


@pytest.mark.parametrize("app_module", [main, main_Local])
def test_home_defaults_to_john_3_16_without_query_argument(app_module):
    response = asyncio.run(app_module.home(make_request()))

    assert response.status_code == 200
    assert "Jn 3.16" in response.body.decode("utf-8")


@pytest.mark.parametrize("app_module", [main, main_Local])
def test_home_preserves_explicit_query_argument(app_module):
    response = asyncio.run(app_module.home(make_request(query_string=b"q=Genesis+1%3A1")))

    assert response.status_code == 200
    assert "Genesis 1:1" in response.body.decode("utf-8")
    assert "Jn 3.16" not in response.body.decode("utf-8")
