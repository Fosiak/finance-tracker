import pytest


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

    access_token = login_response.data["access"]
    refresh_token = login_response.data["refresh"]

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    logout_response = api_client.post(
        "/api/auth/logout/",
        {
            "refresh": refresh_token,
        },
        format="json",
    )

    assert logout_response.status_code == 200

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": refresh_token,
        },
        format="json",
    )

    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_logout_rejects_invalid_refresh_token(
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

    access_token = login_response.data["access"]

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    response = api_client.post(
        "/api/auth/logout/",
        {
            "refresh": "invalid-refresh-token",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_logout_requires_authentication(
    api_client,
):
    response = api_client.post(
        "/api/auth/logout/",
        {
            "refresh": "some-refresh-token",
        },
        format="json",
    )

    assert response.status_code == 401
