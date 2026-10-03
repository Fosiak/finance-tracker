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


@pytest.mark.django_db
def test_reusing_rotated_refresh_token_revokes_whole_family(
    api_client,
    active_user,
):
    """
    A -> B via rotation, then A is replayed (e.g. stolen+used by an
    attacker after the legitimate client already rotated to B).

    Expected: the replay itself is rejected, AND B - which the
    legitimate client is still holding - is revoked too, forcing a
    fresh login instead of silently letting the attacker's branch
    keep working.
    """
    login_response = login(api_client)

    token_a = login_response.data["refresh"]

    rotate_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": token_a},
        format="json",
    )

    assert rotate_response.status_code == 200

    token_b = rotate_response.data["refresh"]

    replay_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": token_a},
        format="json",
    )

    assert replay_response.status_code == 401

    token_b_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": token_b},
        format="json",
    )

    assert token_b_response.status_code == 401


@pytest.mark.django_db
def test_reuse_detection_does_not_affect_other_login_sessions(
    api_client,
    active_user,
):
    """
    Reuse detected on one login session (family) must not revoke an
    unrelated session created by a separate login.
    """
    session_one = login(api_client)
    session_two = login(api_client)

    session_one_token_a = session_one.data["refresh"]
    session_two_token = session_two.data["refresh"]

    rotate_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": session_one_token_a},
        format="json",
    )

    assert rotate_response.status_code == 200

    # Replay session one's original token -> triggers reuse detection
    # for session one's family only.
    replay_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": session_one_token_a},
        format="json",
    )

    assert replay_response.status_code == 401

    # Session two must be completely unaffected.
    session_two_refresh_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": session_two_token},
        format="json",
    )

    assert session_two_refresh_response.status_code == 200


@pytest.mark.django_db
def test_refresh_tokens_from_same_login_share_family_claim(
    api_client,
    active_user,
):
    from rest_framework_simplejwt.tokens import UntypedToken

    from users.services.token_family import FAMILY_CLAIM

    login_response = login(api_client)

    token_a = login_response.data["refresh"]
    family_a = UntypedToken(token_a).payload[FAMILY_CLAIM]

    rotate_response = api_client.post(
        "/api/auth/refresh/",
        {"refresh": token_a},
        format="json",
    )

    token_b = rotate_response.data["refresh"]
    family_b = UntypedToken(token_b).payload[FAMILY_CLAIM]

    assert family_a == family_b