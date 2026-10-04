from users.serializers.password import PasswordResetRequestSerializer
import pytest
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.services.password_reset import (
    generate_password_reset_token,
    verify_password_reset_token,
)
from users.serializers.password import PasswordResetConfirmSerializer


@pytest.mark.django_db
def test_password_reset_token_is_valid(user):
    token = generate_password_reset_token(user)

    assert verify_password_reset_token(
        user,
        token,
    ) is True


@pytest.mark.django_db
def test_password_reset_token_is_invalid_for_wrong_token(user):
    assert verify_password_reset_token(
        user,
        "invalid-token",
    ) is False


def test_password_reset_request_normalizes_email():
    serializer = PasswordResetRequestSerializer(
        data={
            "email": "  TEST@EXAMPLE.COM  ",
        }
    )

    assert serializer.is_valid()

    assert serializer.validated_data["email"] == "test@example.com"


def test_password_reset_request_rejects_invalid_email():
    serializer = PasswordResetRequestSerializer(
        data={
            "email": "not-an-email",
        }
    )

    assert serializer.is_valid() is False
    assert "email" in serializer.errors


def test_password_reset_confirm_accepts_matching_passwords():
    serializer = PasswordResetConfirmSerializer(
        data={
            "uid": "1",
            "token": "test-token",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        }
    )

    assert serializer.is_valid()


def test_password_reset_confirm_rejects_mismatched_passwords():
    serializer = PasswordResetConfirmSerializer(
        data={
            "uid": "1",
            "token": "test-token",
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "DifferentPassword123!"
        }
    )

    assert serializer.is_valid() is False
    assert "new_password_confirm" in serializer.errors


@pytest.mark.django_db
def test_password_reset_sends_email(api_client, user, mailoutbox):
    response = api_client.post(
        "/api/auth/password-reset/",
        {
            "email": user.email,
        },
        format="json",
    )

    assert response.status_code == 200

    assert len(mailoutbox) == 1

    email = mailoutbox[0]

    assert email.to == [user.email]
    assert "Reset your Finance Tracker password" in email.subject
    assert "/reset-password/" in email.body
    assert "uid=" in email.body
    assert "token=" in email.body


@pytest.mark.django_db
def test_password_reset_does_not_reveal_existing_account(
    api_client,
    mailoutbox,
):
    response = api_client.post(
        "/api/auth/password-reset/",
        {
            "email": "doesnotexist@example.com",
        },
        format="json",
    )

    assert response.status_code == 200

    assert len(mailoutbox) == 0

    assert response.data["detail"] == (
        "If an account with this email exists, "
        "a password reset link has been sent."
    )


@pytest.mark.django_db
def test_password_reset_email_is_case_insensitive(
    api_client,
    user,
    mailoutbox,
):
    response = api_client.post(
        "/api/auth/password-reset/",
        {
            "email": user.email.upper(),
        },
        format="json",
    )

    assert response.status_code == 200
    assert len(mailoutbox) == 1


@pytest.mark.django_db
def test_password_reset_changes_password(api_client, user):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
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

    assert not user.check_password(
        "StrongPassword123!"
    )


@pytest.mark.django_db
def test_password_reset_rejects_invalid_token(
    api_client,
    user,
):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": "invalid-token",
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
def test_password_reset_rejects_mismatched_passwords(
    api_client,
    user,
):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "DifferentPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400

    user.refresh_from_db()

    assert user.check_password(
        "StrongPassword123!"
    )


@pytest.mark.django_db
def test_password_reset_rejects_weak_password(
    api_client,
    user,
):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "123",
            "new_password_confirm": "123",
        },
        format="json",
    )

    assert response.status_code == 400

    user.refresh_from_db()

    assert user.check_password(
        "StrongPassword123!"
    )


@pytest.mark.django_db
def test_password_reset_revokes_existing_refresh_token(
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

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    reset_response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert reset_response.status_code == 200

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_password_reset_token_cannot_be_replayed(
    api_client,
    user,
):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    first_response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert first_response.status_code == 200

    second_response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "AnotherStrongPassword123!",
            "new_password_confirm": "AnotherStrongPassword123!",
        },
        format="json",
    )

    assert second_response.status_code == 400

    user.refresh_from_db()
    assert user.check_password("NewStrongPassword123!")


@pytest.mark.django_db
def test_requesting_new_reset_invalidates_previous_token(
    api_client,
    user,
):
    old_token = generate_password_reset_token(user)

    # Simulates the user requesting a second reset email.
    generate_password_reset_token(user)

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": old_token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400

    user.refresh_from_db()
    assert user.check_password("StrongPassword123!")


@pytest.mark.django_db
def test_email_verification_token_is_rejected_by_password_reset(
    api_client,
    user,
):
    from users.services.email_verification import (
        generate_email_verification_token,
    )

    # SECURITY: a token minted for a different purpose must never
    # work here, even though both are "AuthToken" rows for the same
    # user.
    email_token = generate_email_verification_token(user)

    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": email_token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400

    user.refresh_from_db()
    assert user.check_password("StrongPassword123!")


@pytest.mark.django_db
def test_user_can_login_with_new_password_after_reset(
    api_client,
    user,
):
    uidb64 = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = generate_password_reset_token(user)

    response = api_client.post(
        "/api/auth/password-reset-confirm/",
        {
            "uid": uidb64,
            "token": token,
            "new_password": "NewStrongPassword123!",
            "new_password_confirm": "NewStrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 200

    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": user.username,
            "password": "NewStrongPassword123!",
        },
        format="json",
    )

    assert login_response.status_code == 200
    assert settings.AUTH_COOKIE_ACCESS in login_response.cookies
    assert settings.AUTH_COOKIE_REFRESH in login_response.cookies
