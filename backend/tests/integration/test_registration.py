import pytest
from django.core import mail
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_user_can_register(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User",
        },
        format="json",
    )

    assert response.status_code == 201

    user = User.objects.get(username="testuser")

    assert user.email == "test@example.com"
    assert user.first_name == "Test"
    assert user.last_name == "User"
    assert user.is_active is False


@pytest.mark.django_db
def test_registration_requires_password_confirmation(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_registration_rejects_different_passwords(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "DifferentPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_registration_rejects_invalid_email(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "not-an-email",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_registration_requires_email(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_registration_rejects_weak_password(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "123",
            "password_confirm": "123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_registration_rejects_duplicate_username(api_client):
    User.objects.create_user(
        username="testuser",
        email="old@example.com",
        password="StrongPassword123!",
    )

    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "new@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "username" in response.data


@pytest.mark.django_db
def test_registration_rejects_duplicate_email(api_client):
    User.objects.create_user(
        username="existing",
        email="test@example.com",
        password="StrongPassword123!",
    )

    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "newuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    # This test documents the desired behavior.
    # It will expose that email uniqueness is not yet enforced.
    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_registration_sends_verification_email(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert len(mail.outbox) == 1

    email = mail.outbox[0]

    assert email.to == ["test@example.com"]
    assert "Confirm your Finance Tracker account" in email.subject
    assert "verify-email" in email.body


@pytest.mark.django_db
def test_registration_does_not_store_plain_password(api_client):
    password = "StrongPassword123!"

    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": password,
            "password_confirm": password,
        },
        format="json",
    )

    assert response.status_code == 201

    user = User.objects.get(username="testuser")

    assert user.password != password
    assert user.check_password(password)


@pytest.mark.django_db
def test_registration_does_not_create_user_with_invalid_data(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "testuser",
            "email": "invalid",
            "password": "123",
            "password_confirm": "456",
        },
        format="json",
    )

    assert response.status_code == 400
    assert User.objects.count() == 0