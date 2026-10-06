import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from budgets.models import Budget
from transactions.models import Transaction

User = get_user_model()

PASSWORD = "StrongPassword123!"
URL = "/api/auth/delete-account/"


def make_user(username="victim"):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password=PASSWORD,
    )


def login(client, username):
    response = client.post(
        "/api/auth/login/",
        {"username": username, "password": PASSWORD},
        format="json",
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_delete_account_removes_user_and_all_data():
    user = make_user()
    other = make_user("bystander")
    for owner in (user, other):
        Transaction.objects.create(
            user=owner, type="expense", amount=10,
            category="food", description="x", date="2026-10-01",
        )
        Budget.objects.create(user=owner, month="2026-10", limit=100)

    client = APIClient()
    login(client, "victim")
    assert OutstandingToken.objects.filter(user=user).exists()

    response = client.post(URL, {"password": PASSWORD}, format="json")

    assert response.status_code == 204
    assert not User.objects.filter(username="victim").exists()
    assert not Transaction.objects.filter(user_id=user.pk).exists()
    assert not Budget.objects.filter(user_id=user.pk).exists()
    assert not OutstandingToken.objects.filter(user_id=user.pk).exists()
    # Other users' data is untouched.
    assert Transaction.objects.filter(user=other).count() == 1
    assert Budget.objects.filter(user=other).count() == 1


@pytest.mark.django_db
def test_delete_account_requires_correct_password():
    make_user()
    client = APIClient()
    login(client, "victim")

    response = client.post(URL, {"password": "wrong"}, format="json")

    assert response.status_code == 400
    assert User.objects.filter(username="victim").exists()


@pytest.mark.django_db
def test_delete_account_requires_authentication():
    response = APIClient().post(URL, {"password": PASSWORD}, format="json")

    assert response.status_code in (401, 403)
