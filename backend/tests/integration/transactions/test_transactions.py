import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

PASSWORD = "StrongPassword123!"


def login(api_client, username="testuser"):
    response = api_client.post(
        "/api/auth/login/",
        {"username": username, "password": PASSWORD},
        format="json",
    )
    assert response.status_code == 200


def payload(**overrides):
    data = {
        "type": "income",
        "amount": "1500.00",
        "category": "other",
        "description": "Salary",
        "date": "2026-10-01",
    }
    data.update(overrides)
    return data


@pytest.mark.django_db
def test_create_income_transaction(api_client, user):
    login(api_client)

    response = api_client.post("/api/transactions/", payload(), format="json")

    assert response.status_code == 201
    assert response.json()["type"] == "income"


@pytest.mark.django_db
def test_type_defaults_to_expense(api_client, user):
    login(api_client)
    data = payload()
    del data["type"]

    response = api_client.post("/api/transactions/", data, format="json")

    assert response.status_code == 201
    assert response.json()["type"] == "expense"


@pytest.mark.django_db
def test_invalid_type_is_rejected(api_client, user):
    login(api_client)

    response = api_client.post(
        "/api/transactions/", payload(type="gift"), format="json"
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_can_change_type_on_update(api_client, user):
    login(api_client)
    created = api_client.post(
        "/api/transactions/", payload(type="expense"), format="json"
    ).json()

    response = api_client.patch(
        f"/api/transactions/{created['id']}/", {"type": "income"}, format="json"
    )

    assert response.status_code == 200
    assert response.json()["type"] == "income"


@pytest.mark.django_db
def test_transactions_are_scoped_to_user(api_client, user):
    login(api_client)
    api_client.post("/api/transactions/", payload(), format="json")

    User.objects.create_user(
        username="other", email="other@example.com", password=PASSWORD
    )
    other_client = type(api_client)()
    login(other_client, "other")

    response = other_client.get("/api/transactions/")

    assert response.status_code == 200
    assert response.json() == []
