import pytest

from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_user_can_be_created():
    user = User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="StrongPassword123!",
    )

    assert user.username == "testuser"
    assert user.email == "test@example.com"

@pytest.mark.django_db
def test_user_password_is_hashed():
    password = "StrongPassword123!"

    user = User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password=password
    )

    assert user.password != password
    assert user.check_password(password)

from django.conf import settings


def test_argon2_is_first_password_hasher():
    assert (
        settings.PASSWORD_HASHERS[0]
        == "django.contrib.auth.hashers.Argon2PasswordHasher"
    )