import pytest

from django.conf import settings


@pytest.mark.django_db
def test_logout_revokes_refresh_token(
    api_client,
    user,
):
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": user.username,
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert login_response.status_code == 200

    logout_response = api_client.post(
        "/api/auth/logout/",
    )

    assert logout_response.status_code == 200

    assert (
        logout_response.cookies[settings.AUTH_COOKIE_ACCESS].value
        == ""
    )
    assert (
        logout_response.cookies[settings.AUTH_COOKIE_REFRESH].value
        == ""
    )

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_logout_with_invalid_refresh_cookie_still_clears_cookies(
    api_client,
    user,
):
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": user.username,
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert login_response.status_code == 200

    api_client.cookies[
        settings.AUTH_COOKIE_REFRESH
    ] = "invalid-refresh-token"

    response = api_client.post(
        "/api/auth/logout/",
    )

    assert response.status_code == 200
    assert response.cookies[settings.AUTH_COOKIE_ACCESS].value == ""
    assert response.cookies[settings.AUTH_COOKIE_REFRESH].value == ""


@pytest.mark.django_db
def test_logout_requires_authentication(
    api_client,
):
    response = api_client.post(
        "/api/auth/logout/",
    )

    assert response.status_code == 401
