import io

import pytest
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
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


@pytest.mark.django_db
def test_replacing_avatar_deletes_the_old_file(api_client):
    User.objects.create_user(
        username="replacer",
        email="replacer@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=True,
    )

    authenticate(api_client, "replacer", "StrongPassword123!")

    first_response = api_client.patch(
        "/api/auth/profile/avatar/",
        {"avatar": make_avatar_file("first.png")},
        format="multipart",
    )
    assert first_response.status_code == 200

    user = User.objects.get(username="replacer")
    old_name = user.avatar.name
    assert default_storage.exists(old_name)

    second_response = api_client.patch(
        "/api/auth/profile/avatar/",
        {"avatar": make_avatar_file("second.png")},
        format="multipart",
    )
    assert second_response.status_code == 200

    user.refresh_from_db()
    assert user.avatar.name != old_name
    assert not default_storage.exists(old_name)
    assert default_storage.exists(user.avatar.name)


@pytest.mark.django_db
def test_user_can_reset_avatar(api_client):
    User.objects.create_user(
        username="resetter",
        email="resetter@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=True,
    )

    authenticate(api_client, "resetter", "StrongPassword123!")

    api_client.patch(
        "/api/auth/profile/avatar/",
        {"avatar": make_avatar_file()},
        format="multipart",
    )

    user = User.objects.get(username="resetter")
    avatar_name = user.avatar.name
    assert default_storage.exists(avatar_name)

    response = api_client.delete("/api/auth/profile/avatar/")

    assert response.status_code == 204

    user.refresh_from_db()
    assert not user.avatar
    assert not default_storage.exists(avatar_name)


@pytest.mark.django_db
def test_unverified_user_cannot_reset_avatar(api_client):
    User.objects.create_user(
        username="unverified2",
        email="unverified2@example.com",
        password="StrongPassword123!",
        is_active=True,
        email_verified=False,
    )

    authenticate(api_client, "unverified2", "StrongPassword123!")

    response = api_client.delete("/api/auth/profile/avatar/")

    assert response.status_code == 403
