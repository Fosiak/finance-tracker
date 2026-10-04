import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient(enforce_csrf_checks=True)


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
def test_login_does_not_require_csrf_token(
    api_client,
    active_user,
):
    """Anonymous auth endpoints (no session cookie yet) are not
    subject to CSRF enforcement - there is nothing to ride."""
    response = login(api_client)

    assert response.status_code == 200


@pytest.mark.django_db
def test_cookie_authenticated_request_without_csrf_token_is_rejected(
    api_client,
    active_user,
):
    login_response = login(api_client)

    assert login_response.status_code == 200

    response = api_client.post("/api/auth/logout/")

    assert response.status_code == 403


@pytest.mark.django_db
def test_cookie_authenticated_request_with_csrf_token_succeeds(
    api_client,
    active_user,
):
    csrf_response = api_client.get("/api/auth/csrf/")
    csrf_token = csrf_response.cookies["csrftoken"].value

    login_response = login(api_client)

    assert login_response.status_code == 200

    response = api_client.post(
        "/api/auth/logout/",
        HTTP_X_CSRFTOKEN=csrf_token,
    )

    assert response.status_code == 200
