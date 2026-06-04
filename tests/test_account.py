import pytest
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from propylon_document_manager.file_versions.models import User, Document
from .factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_user():
    user = UserFactory(password="testpass123")
    return user


@pytest.fixture
def auth_client(api_client, auth_user):
    token = Token.objects.create(user=auth_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return api_client


# ── Sign Up ──────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_signup_creates_user_and_returns_token(api_client):
    response = api_client.post("/api/signup/", {
        "email": "newuser@example.com",
        "password": "securepass123",
        "password_confirm": "securepass123",
    })

    assert response.status_code == 201
    assert response.data["email"] == "newuser@example.com"
    assert "token" in response.data
    assert User.objects.filter(email="newuser@example.com").exists()


@pytest.mark.django_db
def test_signup_rejects_mismatched_passwords(api_client):
    response = api_client.post("/api/signup/", {
        "email": "newuser@example.com",
        "password": "securepass123",
        "password_confirm": "differentpass",
    })

    assert response.status_code == 400
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_signup_rejects_short_password(api_client):
    response = api_client.post("/api/signup/", {
        "email": "newuser@example.com",
        "password": "short",
        "password_confirm": "short",
    })

    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_signup_rejects_duplicate_email(api_client):
    UserFactory(email="existing@example.com")

    response = api_client.post("/api/signup/", {
        "email": "existing@example.com",
        "password": "securepass123",
        "password_confirm": "securepass123",
    })

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_signup_rejects_missing_fields(api_client):
    response = api_client.post("/api/signup/", {})

    assert response.status_code == 400
    assert "email" in response.data
    assert "password" in response.data
    assert "password_confirm" in response.data


@pytest.mark.django_db
def test_signup_token_can_authenticate(api_client):
    """The token returned by signup should work for authenticated endpoints."""
    response = api_client.post("/api/signup/", {
        "email": "tokentest@example.com",
        "password": "securepass123",
        "password_confirm": "securepass123",
    })

    token = response.data["token"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
    list_response = api_client.get("/api/file_versions/")
    assert list_response.status_code == 200


# ── Delete Account ───────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_delete_account_removes_user(auth_client, auth_user):
    user_id = auth_user.id

    response = auth_client.delete("/api/account/")

    assert response.status_code == 204
    assert not User.objects.filter(id=user_id).exists()


@pytest.mark.django_db
def test_delete_account_cascades_documents(auth_client, auth_user):
    """Deleting the user should also delete their documents."""
    Document.objects.create(user=auth_user, url_path="docs/test.txt")
    assert Document.objects.filter(user=auth_user).count() == 1

    response = auth_client.delete("/api/account/")

    assert response.status_code == 204
    assert Document.objects.filter(user=auth_user).count() == 0


@pytest.mark.django_db
def test_delete_account_requires_authentication(api_client):
    response = api_client.delete("/api/account/")

    assert response.status_code in (401, 403)
