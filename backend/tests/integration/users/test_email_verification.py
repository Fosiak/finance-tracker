import pytest

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from users.services.email_verification import (
    generate_email_verification_token,
)

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_changed_email_can_be_verified(api_client):
    user = User.objects.create_user(
        username="testuser",
        email="new@example.com",
        password="StrongPassword123!",
        is_active=False,
        email_verified=False,
    )

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_email_verification_token(user)

    response = api_client.get(
        reverse(
            "verify_email",
            kwargs={
                "uidb64": uidb64,
                "token": token,
            },
        )
    )

    assert response.status_code == 200

    user.refresh_from_db()

    assert user.is_active is True
    assert user.email_verified is True


@pytest.mark.django_db
def test_verification_token_cannot_be_replayed(api_client):
    user = User.objects.create_user(
        username="testuser",
        email="new@example.com",
        password="StrongPassword123!",
        is_active=False,
        email_verified=False,
    )

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_email_verification_token(user)

    url = reverse(
        "verify_email",
        kwargs={
            "uidb64": uidb64,
            "token": token,
        },
    )

    first_response = api_client.get(url)
    assert first_response.status_code == 200

    # Reset is_active so a "replay" would actually re-trigger
    # activation logic if the token were still considered valid.
    user.is_active = False
    user.save(update_fields=["is_active"])

    second_response = api_client.get(url)

    assert second_response.status_code == 400
    assert second_response.data["detail"] == "Invalid verification link."


@pytest.mark.django_db
def test_resending_verification_invalidates_previous_token(api_client):
    user = User.objects.create_user(
        username="testuser",
        email="new@example.com",
        password="StrongPassword123!",
        is_active=False,
        email_verified=False,
    )

    old_token = generate_email_verification_token(user)

    # Simulates a "resend verification email" action.
    generate_email_verification_token(user)

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    response = api_client.get(
        reverse(
            "verify_email",
            kwargs={
                "uidb64": uidb64,
                "token": old_token,
            },
        )
    )

    assert response.status_code == 400

    user.refresh_from_db()
    assert user.is_active is False
