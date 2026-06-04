import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.core.files.uploadedfile import SimpleUploadedFile
from .factories import UserFactory
from propylon_document_manager.file_versions.models import FileVersion, Document


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_user():
    return UserFactory()


@pytest.fixture
def auth_client(api_client, auth_user):
    token = Token.objects.create(user=auth_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return api_client


@pytest.mark.django_db
def test_upload_creates_version_zero(auth_client, auth_user):
    url = reverse("api:fileversion-list")
    file_content = b"Version 0 Content"
    uploaded_file = SimpleUploadedFile("document.pdf", file_content, content_type="application/pdf")

    response = auth_client.post(
        url,
        {"file": uploaded_file, "url_path": "documents/document.pdf"},
        format="multipart"
    )

    assert response.status_code == 201
    assert response.data["version_number"] == 0
    assert response.data["file_name"] == "document.pdf"

    # Verify Document and FileVersion models exist in DB
    doc = Document.objects.get(user=auth_user, url_path="documents/document.pdf")
    assert FileVersion.objects.filter(document=doc, version_number=0).exists()


@pytest.mark.django_db
def test_upload_twice_increments_version(auth_client, auth_user):
    url = reverse("api:fileversion-list")
    
    # First Upload
    file1 = SimpleUploadedFile("document.pdf", b"V0 Content", content_type="application/pdf")
    res1 = auth_client.post(
        url,
        {"file": file1, "url_path": "documents/document.pdf"},
        format="multipart"
    )
    assert res1.status_code == 201
    assert res1.data["version_number"] == 0

    # Second Upload to same url_path
    file2 = SimpleUploadedFile("document.pdf", b"V1 Content", content_type="application/pdf")
    res2 = auth_client.post(
        url,
        {"file": file2, "url_path": "documents/document.pdf"},
        format="multipart"
    )
    assert res2.status_code == 201
    assert res2.data["version_number"] == 1


@pytest.mark.django_db
def test_download_returns_correct_content(auth_client, auth_user):
    url = reverse("api:fileversion-list")
    file_content = b"Downloadable Content"
    uploaded_file = SimpleUploadedFile("download_test.txt", file_content, content_type="text/plain")
    res = auth_client.post(
        url,
        {"file": uploaded_file, "url_path": "documents/download_test.txt"},
        format="multipart"
    )
    assert res.status_code == 201
    file_version_id = res.data["id"]
    
    # Download by ID action
    download_url = reverse("api:fileversion-download", kwargs={"id": file_version_id})
    download_res = auth_client.get(download_url)
    assert download_res.status_code == 200
    
    # Read file response content
    content = b"".join(download_res.streaming_content)
    assert content == file_content


@pytest.mark.django_db
def test_cas_retrieval_by_hash(auth_client, auth_user):
    url = reverse("api:fileversion-list")
    file_content = b"CAS Hash Content"
    uploaded_file = SimpleUploadedFile("cas_test.txt", file_content, content_type="text/plain")
    res = auth_client.post(
        url,
        {"file": uploaded_file, "url_path": "documents/cas_test.txt"},
        format="multipart"
    )
    assert res.status_code == 201
    content_hash = res.data["content_hash"]
    
    # CAS retrieval URL
    cas_url = reverse("api:fileversion-cas-retrieve", kwargs={"content_hash": content_hash})
    cas_res = auth_client.get(cas_url)
    assert cas_res.status_code == 200
    
    content = b"".join(cas_res.streaming_content)
    assert content == file_content


@pytest.mark.django_db
def test_custom_url_post_uploads_new_versions(auth_client, auth_user):
    # POST to /documents/my/logical/path.txt
    url = reverse("document-storage", kwargs={"url_path": "my/logical/path.txt"})
    file_content = b"Custom URL Content V0"
    uploaded_file = SimpleUploadedFile("path.txt", file_content, content_type="text/plain")
    
    res = auth_client.post(
        url,
        {"file": uploaded_file},
        format="multipart"
    )
    assert res.status_code == 201
    assert res.data["version_number"] == 0
    
    # Post again to upload version 1
    file_content_v1 = b"Custom URL Content V1"
    uploaded_file_v1 = SimpleUploadedFile("path.txt", file_content_v1, content_type="text/plain")
    res_v1 = auth_client.post(
        url,
        {"file": uploaded_file_v1},
        format="multipart"
    )
    assert res_v1.status_code == 201
    assert res_v1.data["version_number"] == 1


@pytest.mark.django_db
def test_custom_url_get_latest_version(auth_client, auth_user):
    url = reverse("document-storage", kwargs={"url_path": "latest/test.txt"})
    
    # Upload version 0
    file0 = SimpleUploadedFile("test.txt", b"Version 0", content_type="text/plain")
    auth_client.post(url, {"file": file0}, format="multipart")
    
    # Upload version 1
    file1 = SimpleUploadedFile("test.txt", b"Version 1", content_type="text/plain")
    auth_client.post(url, {"file": file1}, format="multipart")
    
    # GET without revision param gets latest (Version 1)
    get_res = auth_client.get(url)
    assert get_res.status_code == 200
    content = b"".join(get_res.streaming_content)
    assert content == b"Version 1"


@pytest.mark.django_db
def test_custom_url_get_revision(auth_client, auth_user):
    url = reverse("document-storage", kwargs={"url_path": "revision/test.txt"})
    
    # Upload version 0
    file0 = SimpleUploadedFile("test.txt", b"Version 0", content_type="text/plain")
    auth_client.post(url, {"file": file0}, format="multipart")
    
    # Upload version 1
    file1 = SimpleUploadedFile("test.txt", b"Version 1", content_type="text/plain")
    auth_client.post(url, {"file": file1}, format="multipart")
    
    # GET with ?revision=0
    get_res_v0 = auth_client.get(url, {"revision": 0})
    assert get_res_v0.status_code == 200
    content_v0 = b"".join(get_res_v0.streaming_content)
    assert content_v0 == b"Version 0"
    
    # GET with ?revision=1
    get_res_v1 = auth_client.get(url, {"revision": 1})
    assert get_res_v1.status_code == 200
    content_v1 = b"".join(get_res_v1.streaming_content)
    assert content_v1 == b"Version 1"


@pytest.mark.django_db
def test_user_boundaries_and_permissions(auth_client, auth_user, api_client):
    # Create User B and User B's client
    user_b = UserFactory()
    token_b = Token.objects.create(user=user_b)
    client_b = APIClient()
    client_b.credentials(HTTP_AUTHORIZATION=f"Token {token_b.key}")
    
    # User A uploads a file
    url_a = reverse("document-storage", kwargs={"url_path": "secret/doc.txt"})
    file_a = SimpleUploadedFile("doc.txt", b"User A Secret Content", content_type="text/plain")
    res = auth_client.post(url_a, {"file": file_a}, format="multipart")
    assert res.status_code == 201
    file_version_id = res.data["id"]
    content_hash = res.data["content_hash"]
    
    # 1. User B tries to download User A's file via ViewSet download ID link -> should be 404
    download_url = reverse("api:fileversion-download", kwargs={"id": file_version_id})
    res_download = client_b.get(download_url)
    assert res_download.status_code == 404
    
    # 2. User B tries to retrieve User A's file via CAS endpoint -> should be 404
    cas_url = reverse("api:fileversion-cas-retrieve", kwargs={"content_hash": content_hash})
    res_cas = client_b.get(cas_url)
    assert res_cas.status_code == 404
    
    # 3. User B tries to retrieve User A's file via Logical Path endpoint -> should be 404
    logical_url = reverse("document-storage", kwargs={"url_path": "secret/doc.txt"})
    res_logical = client_b.get(logical_url)
    assert res_logical.status_code == 404


@pytest.mark.django_db
def test_unauthenticated_access_to_documents_returns_403(api_client):
    url = reverse("document-storage", kwargs={"url_path": "anonymous/doc.txt"})
    response = api_client.get(url)
    assert response.status_code == 403
    
    response_post = api_client.post(
        url,
        {"file": SimpleUploadedFile("doc.txt", b"anon")},
        format="multipart"
    )
    assert response_post.status_code == 403
