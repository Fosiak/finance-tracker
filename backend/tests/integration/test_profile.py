from django.core import mail
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
        first_name="Test",
        last_name="User",
        is_active=True,
    )


@pytest.fixture
def other_user():
    return User.objects.create_user(
        username="otheruser",
        email="other@example.com",
        password="OtherPassword123!",
        first_name="Other",
        last_name="User",
        is_active=True,
    )


def authenticate(api_client, username, password):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": username,
            "password": password,
        },
        format="json",
    )

    assert response.status_code == 200

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
    )


@pytest.mark.django_db
def test_authenticated_user_can_view_own_profile(
    api_client,
    user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 200
    assert response.data["username"] == "testuser"
    assert response.data["email"] == "test@example.com"
    assert response.data["first_name"] == "Test"
    assert response.data["last_name"] == "User"


@pytest.mark.django_db
def test_unauthenticated_user_cannot_view_profile(
    api_client,
):
    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_user_can_update_own_profile(
    api_client,
    user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {
            "first_name": "Updated",
            "last_name": "Name",
        },
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.first_name == "Updated"
    assert user.last_name == "Name"


@pytest.mark.django_db
def test_user_cannot_change_username(
    api_client,
    user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {
            "username": "hackedusername",
        },
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.username == "testuser"


@pytest.mark.django_db
def test_profile_endpoint_only_returns_authenticated_user(
    api_client,
    user,
    other_user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 200

    assert response.data["username"] == "testuser"
    assert response.data["email"] == "test@example.com"

    assert response.data["username"] != "otheruser"
    assert response.data["email"] != "other@example.com"


@pytest.mark.django_db
def test_profile_endpoint_does_not_accept_user_id(
    api_client,
    user,
    other_user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.get(
        f"/api/auth/profile/{other_user.pk}/"
    )

    assert response.status_code in [404, 405]


@pytest.mark.django_db
def test_profile_normalizes_email(
    api_client,
    user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {
            "email": "  NEW@Example.COM ",
        },
        format="json",
        follow=True,
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.email == "new@example.com"


@pytest.mark.django_db
def test_user_can_change_email(api_client, user):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {"email": "new@example.com"},
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.email == "new@example.com"
    assert user.email_verified is False
    assert user.is_active is False
    assert len(mail.outbox) == 1


@pytest.mark.django_db
def test_user_cannot_change_email_to_existing_email(
    api_client,
    user,
    other_user,
):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {"email": "other@example.com"},
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data

    user.refresh_from_db()

    assert user.email == "test@example.com"


@pytest.mark.django_db
def test_profile_email_change_normalizes_email(
    api_client, user
):
    authenticate(api_client, "testuser", "StrongPassword123!",)

    response = api_client.patch(
        "/api/auth/profile/",
        {"email": "   NEW@EXAMPLE.COM  "},
        format="json"
    )

    assert response.status_code == 200
    user.refresh_from_db()

    assert user.email == "new@example.com"
    assert user.email_verified is False
    assert user.is_active is False


@pytest.mark.django_db
def test_changed_email_can_be_verified(api_client, user):
    authenticate(
        api_client,
        "testuser",
        "StrongPassword123!",
    )

    response = api_client.patch(
        "/api/auth/profile/",
        {"email": "new@example.com"},
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.email == "new@example.com"
    assert user.email_verified is False
    assert user.is_active is False

    assert len(mail.outbox) == 1

    email = mail.outbox[0]

    assert email.to == ["new@example.com"]
    assert "verify-email" in email.body
