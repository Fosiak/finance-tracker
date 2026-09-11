import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def active_user():
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="StrongPassword123!",
        is_active=True,
    )


def login(api_client):
    return api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )


@pytest.mark.django_db
def test_refresh_token_returns_new_tokens(
    api_client,
    active_user,
):
    login_response = login(api_client)

    assert login_response.status_code == 200

    old_refresh = login_response.data["refresh"]

    response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": old_refresh,
        },
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data

    assert response.data["refresh"] != old_refresh


@pytest.mark.django_db
def test_old_refresh_token_is_blacklisted_after_rotation(
    api_client,
    active_user,
):
    login_response = login(api_client)

    old_refresh = login_response.data["refresh"]

    first_refresh_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": old_refresh,
        },
        format="json",
    )

    assert first_refresh_response.status_code == 200

    second_refresh_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": old_refresh,
        },
        format="json",
    )

    assert second_refresh_response.status_code == 401


@pytest.mark.django_db
def test_new_refresh_token_can_be_used(
    api_client,
    active_user,
):
    login_response = login(api_client)

    old_refresh = login_response.data["refresh"]

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": old_refresh,
        },
        format="json",
    )

    new_refresh = refresh_response.data["refresh"]

    second_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": new_refresh,
        },
        format="json",
    )

    assert second_response.status_code == 200
    assert "access" in second_response.data


@pytest.mark.django_db
def test_invalid_refresh_token_is_rejected(api_client):
    response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": "invalid-refresh-token",
        },
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_missing_refresh_token_is_rejected(api_client):
    response = api_client.post(
        "/api/auth/refresh/",
        {},
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_missing_access_token_is_rejected(api_client):
    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_invalid_access_token_is_rejected(api_client):
    api_client.credentials(
        HTTP_AUTHORIZATION="Bearer invalid-token"
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_access_token_authenticates_user(
    api_client,
    active_user,
):
    login_response = login(api_client)

    access_token = login_response.data["access"]

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 200
    assert response.data["username"] == "testuser"