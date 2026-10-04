import pytest

from django.conf import settings
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


def refresh_cookie_value(response):
    return response.cookies[settings.AUTH_COOKIE_REFRESH].value


@pytest.mark.django_db
def test_refresh_token_returns_new_tokens(
    api_client,
    active_user,
):
    login_response = login(api_client)

    assert login_response.status_code == 200

    old_refresh = refresh_cookie_value(login_response)

    response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert response.status_code == 200

    assert settings.AUTH_COOKIE_ACCESS in response.cookies
    assert settings.AUTH_COOKIE_REFRESH in response.cookies

    assert refresh_cookie_value(response) != old_refresh


@pytest.mark.django_db
def test_old_refresh_token_is_blacklisted_after_rotation(
    api_client,
    active_user,
):
    login_response = login(api_client)

    old_refresh = refresh_cookie_value(login_response)

    first_refresh_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert first_refresh_response.status_code == 200

    api_client.cookies[settings.AUTH_COOKIE_REFRESH] = old_refresh

    second_refresh_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert second_refresh_response.status_code == 401


@pytest.mark.django_db
def test_new_refresh_token_can_be_used(
    api_client,
    active_user,
):
    login_response = login(api_client)

    assert login_response.status_code == 200

    refresh_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert refresh_response.status_code == 200

    second_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert second_response.status_code == 200
    assert settings.AUTH_COOKIE_ACCESS in second_response.cookies


@pytest.mark.django_db
def test_invalid_refresh_token_is_rejected(api_client):
    api_client.cookies[
        settings.AUTH_COOKIE_REFRESH
    ] = "invalid-refresh-token"

    response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_missing_refresh_token_is_rejected(api_client):
    response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_missing_access_token_is_rejected(api_client):
    response = api_client.get(
        "/api/auth/profile/"
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_invalid_access_token_is_rejected(api_client):
    api_client.cookies[settings.AUTH_COOKIE_ACCESS] = "invalid-token"

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

    assert login_response.status_code == 200

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

    token_a = refresh_cookie_value(login_response)

    rotate_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert rotate_response.status_code == 200

    token_b = refresh_cookie_value(rotate_response)

    api_client.cookies[settings.AUTH_COOKIE_REFRESH] = token_a

    replay_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert replay_response.status_code == 401

    api_client.cookies[settings.AUTH_COOKIE_REFRESH] = token_b

    token_b_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert token_b_response.status_code == 401


@pytest.mark.django_db
def test_reuse_detection_does_not_affect_other_login_sessions(
    active_user,
):
    """
    Reuse detected on one login session (family) must not revoke an
    unrelated session created by a separate login.
    """
    session_one = APIClient()
    session_two = APIClient()

    session_one_login = login(session_one)
    session_two_login = login(session_two)

    session_one_token_a = refresh_cookie_value(session_one_login)
    session_two_token = refresh_cookie_value(session_two_login)

    rotate_response = session_one.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert rotate_response.status_code == 200

    # Replay session one's original token -> triggers reuse detection
    # for session one's family only.
    session_one.cookies[
        settings.AUTH_COOKIE_REFRESH
    ] = session_one_token_a

    replay_response = session_one.post(
        "/api/auth/refresh/",
        format="json",
    )

    assert replay_response.status_code == 401

    # Session two must be completely unaffected.
    session_two.cookies[
        settings.AUTH_COOKIE_REFRESH
    ] = session_two_token

    session_two_refresh_response = session_two.post(
        "/api/auth/refresh/",
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

    token_a = refresh_cookie_value(login_response)
    family_a = UntypedToken(token_a).payload[FAMILY_CLAIM]

    rotate_response = api_client.post(
        "/api/auth/refresh/",
        format="json",
    )

    token_b = refresh_cookie_value(rotate_response)
    family_b = UntypedToken(token_b).payload[FAMILY_CLAIM]

    assert family_a == family_b
