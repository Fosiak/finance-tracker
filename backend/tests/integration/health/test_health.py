import pytest

URL = "/api/health/"


@pytest.mark.django_db
class TestHealth:
    def test_public_and_minimal(self, api_client):
        res = api_client.get(URL)

        assert res.status_code == 200
        assert set(res.json()) == {"status", "uptimeSec", "commit"}
        assert res.json()["status"] == "ok"

    def test_sets_no_cookies(self, api_client):
        assert not api_client.get(URL).cookies

    def test_write_methods_not_allowed(self, api_client):
        assert api_client.post(URL, {}).status_code == 405
