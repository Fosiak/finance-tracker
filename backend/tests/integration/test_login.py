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


@pytest.mark.django_db
def test_user_can_login(api_client, active_user):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_rejects_wrong_password(api_client, active_user):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "WrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 401
    assert "access" not in response.data
    assert "refresh" not in response.data


@pytest.mark.django_db
def test_login_rejects_nonexistent_user(api_client):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "doesnotexist",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 401
    assert "access" not in response.data
    assert "refresh" not in response.data


@pytest.mark.django_db
def test_login_rejects_empty_username(api_client):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_login_rejects_empty_password(api_client):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_inactive_user_cannot_login(api_client):
    User.objects.create_user(
        username="inactive",
        email="inactive@example.com",
        password="StrongPassword123!",
        is_active=False,
    )

    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "inactive",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 401
    assert "access" not in response.data
    assert "refresh" not in response.data


@pytest.mark.django_db
def test_login_error_does_not_reveal_user_existence(
    api_client,
    active_user,
):
    wrong_password_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "WrongPassword123!",
        },
        format="json",
    )

    nonexistent_user_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "doesnotexist",
            "password": "WrongPassword123!",
        },
        format="json",
    )

    assert wrong_password_response.status_code == 401
    assert nonexistent_user_response.status_code == 401

    assert (
        wrong_password_response.data["detail"]
        == nonexistent_user_response.data["detail"]
    )


@pytest.mark.django_db
def test_access_token_can_authenticate_request(
    api_client,
    active_user,
):
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    access_token = login_response.data["access"]

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 200
    assert response.data["username"] == "testuser"


@pytest.mark.django_db
def test_invalid_access_token_is_rejected(
    api_client,
):
    api_client.credentials(
        HTTP_AUTHORIZATION="Bearer invalid-token"
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_refresh_token_returns_new_access_token(
    api_client,
    active_user,
):
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    refresh_token = login_response.data["refresh"]

    response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": refresh_token,
        },
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data