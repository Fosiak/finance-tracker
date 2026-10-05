import io

import pytest
from django.contrib.auth import get_user_model
from PIL import Image
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


def make_avatar_file(name="avatar.png"):
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    buffer.seek(0)
    buffer.name = name
    return buffer


def authenticate(api_client, username, password):
    response = api_client.post(
        "/api/auth/login/",
        {"username": username, "password": password},
        format="json",
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_verified_user_can_upload_avatar(api_client):
    User.objects.create_user(
        username="verified",
        email="verified@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=True,
    )

    authenticate(api_client, "verified", "StrongPassword123!")

    response = api_client.patch(
        "/api/auth/profile/avatar/",
        {"avatar": make_avatar_file()},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.data["avatar"]


@pytest.mark.django_db
def test_unverified_user_cannot_upload_avatar(api_client):
    User.objects.create_user(
        username="unverified",
        email="unverified@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=False,
    )

    authenticate(api_client, "unverified", "StrongPassword123!")

    response = api_client.patch(
        "/api/auth/profile/avatar/",
        {"avatar": make_avatar_file()},
        format="multipart",
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_profile_endpoint_ignores_avatar_field(api_client):
    User.objects.create_user(
        username="verified2",
        email="verified2@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=True,
    )

    authenticate(api_client, "verified2", "StrongPassword123!")

    response = api_client.patch(
        "/api/auth/profile/",
        {"avatar": make_avatar_file()},
        format="multipart",
    )

    assert response.status_code == 200

    user = User.objects.get(username="verified2")
    assert not user.avatar
