import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=True,
    )


def authenticate(api_client):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200

    api_client.credentials(
        HTTP_AUTHORIZATION=(
            f"Bearer {response.data['access']}"
        )
    )


@pytest.mark.django_db
def test_user_can_change_password(api_client, user):
    authenticate(api_client)

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.check_password(
        "NewStrongPassword123!"
    )


@pytest.mark.django_db
def test_change_password_rejects_wrong_current_password(
    api_client,
    user,
):
    authenticate(api_client)

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "WrongPassword123!",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400

    user.refresh_from_db()

    assert user.check_password(
        "StrongPassword123!"
    )


@pytest.mark.django_db
def test_change_password_rejects_weak_password(
    api_client,
    user,
):
    authenticate(api_client)

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "123",
            "new_password_confirm": "123",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_change_password_rejects_different_passwords(
    api_client,
    user,
):
    authenticate(api_client)

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "DifferentPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_change_password_cannot_reuse_current_password(
    api_client,
    user,
):
    authenticate(api_client)

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "StrongPassword123!",
            "new_password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_unauthenticated_user_cannot_change_password(
    api_client,
):
    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_change_password_blacklists_refresh_token(
    api_client,
    user,
):
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert login_response.status_code == 200

    refresh_token = login_response.data["refresh"]

    api_client.credentials(
        HTTP_AUTHORIZATION=(
            f"Bearer {login_response.data['access']}"
        )
    )

    response = api_client.post(
        "/api/auth/change-password/",
        {
            "current_password": "StrongPassword123!",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        {
            "refresh": refresh_token,
        },
        format="json",
    )

    assert refresh_response.status_code == 401