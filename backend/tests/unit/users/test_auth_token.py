from datetime import timedelta

import pytest
from django.utils import timezone

from users.models.auth_token import AuthToken, AuthTokenPurpose


@pytest.mark.django_db
def test_issued_token_is_valid(user):
    raw_token, token = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    found = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=raw_token,
    )

    assert found is not None
    assert found.pk == token.pk


@pytest.mark.django_db
def test_raw_token_is_never_stored(user):
    raw_token, token = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    assert token.token_hash != raw_token
    assert raw_token not in token.token_hash


@pytest.mark.django_db
def test_used_token_is_no_longer_valid(user):
    raw_token, token = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    token.mark_used()

    found = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=raw_token,
    )

    assert found is None


@pytest.mark.django_db
def test_expired_token_is_no_longer_valid(user):
    raw_token, token = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    token.expires_at = timezone.now() - timedelta(seconds=1)
    token.save(update_fields=["expires_at"])

    found = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=raw_token,
    )

    assert found is None


@pytest.mark.django_db
def test_issuing_new_token_invalidates_previous_unused_token(user):
    old_raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    new_raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    old_found = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=old_raw_token,
    )

    new_found = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=new_raw_token,
    )

    assert old_found is None
    assert new_found is not None


@pytest.mark.django_db
def test_token_is_scoped_to_its_purpose(user):
    raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    # SECURITY: a token minted for email verification must never
    # validate for password reset, and vice versa.
    found_for_wrong_purpose = AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.PASSWORD_RESET,
        raw_token=raw_token,
    )

    assert found_for_wrong_purpose is None


@pytest.mark.django_db
def test_token_does_not_validate_for_a_different_user(user, django_user_model):
    other_user = django_user_model.objects.create_user(
        username="otheruser",
        email="other@example.com",
        password="StrongPassword123!",
    )

    raw_token, _ = AuthToken.objects.issue(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        ttl=timedelta(hours=1),
    )

    found = AuthToken.objects.get_valid(
        user=other_user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token=raw_token,
    )

    assert found is None


@pytest.mark.django_db
def test_garbage_token_is_rejected(user):
    assert AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token="not-a-real-token",
    ) is None


@pytest.mark.django_db
def test_empty_token_is_rejected(user):
    assert AuthToken.objects.get_valid(
        user=user,
        purpose=AuthTokenPurpose.EMAIL_VERIFICATION,
        raw_token="",
    ) is None
