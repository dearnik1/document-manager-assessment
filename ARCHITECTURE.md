# Architecture

## Overview

Propylon Document Manager is a document versioning system. Users upload files to logical URL paths. Each upload is stored as a versioned snapshot with a SHA-256 content hash for content-addressable retrieval.

## Tech Stack

| Layer    | Technology                                      |
|----------|------------------------------------------------|
| Backend  | Django 4.x, Django REST Framework, SQLite      |
| Frontend | React 19, TypeScript, MUI 9, Vite 8            |
| Auth     | DRF Token Authentication                        |
| Testing  | Backend: pytest + DRF APIClient · Frontend: Vitest + React Testing Library |

## Backend

```
src/propylon_document_manager/
├── file_versions/
│   ├── models.py          # User, Document, FileVersion
│   ├── api/
│   │   ├── serializers.py # FileVersionSerializer (handles upload + versioning)
│   │   └── views.py       # FileVersionViewSet, DocumentStorageView
│   └── management/        # load_file_fixtures command
└── site/settings/         # Django settings (base, local)
```

### Models

- **User** — Custom user model, authenticates by `email` (no username).
- **Document** — Represents a logical document at a `url_path`, scoped to a user. Unique constraint: `(user, url_path)`.
- **FileVersion** — A specific version of a document. Fields: `document` (FK), `version_number`, `file`, `file_name`, `content_hash` (SHA-256), `created_at`. Unique constraint: `(document, version_number)`.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/file_versions/` | Upload file. Auto-creates Document, assigns next version number, computes SHA-256 hash |
| GET    | `/api/file_versions/` | List file versions. Supports `?latest=true`, `?document=<id>`, `?page=<n>`, `?no_pagination=true` |
| GET    | `/api/file_versions/<id>/download/` | Download a specific version's file |
| GET    | `/api/file_versions/cas/<hash>/` | Content-addressable retrieval by SHA-256 hash |
| DELETE | `/api/file_versions/<id>/` | Delete a specific version |
| GET    | `/documents/<path>/` | Retrieve latest version (or `?revision=<n>` for specific version) |
| POST   | `/documents/<path>/` | Upload new version at logical path |
| DELETE | `/documents/<path>/` | Delete document and all versions |
| POST   | `/auth-token/` | Obtain auth token (username=email, password) |

All endpoints except `/auth-token/` require `Authorization: Token <key>` header. Users can only access their own documents.

## Frontend

```
client/doc-manager/src/
├── api/
│   ├── client.ts      # Axios instance with token interceptor
│   ├── auth.ts        # login()
│   └── files.ts       # getFiles, uploadFile, uploadNewVersion, downloadLatest, getVersions, deleteDocument, deleteFileVersion
├── components/
│   ├── AppLayout.tsx   # Header bar with branding + user menu
│   └── ProtectedRoute.tsx  # Auth guard, redirects to /login
├── contexts/
│   └── AuthContext.tsx # Auth state provider (token in localStorage)
├── pages/
│   ├── LoginPage.tsx   # Email/password login form
│   └── MyFilesPage.tsx # Main file manager: data grid, upload, versions, favorites
├── utils/
│   └── favorites.ts   # localStorage helpers for favorites
├── types/index.ts     # TypeScript interfaces
└── theme.ts           # MUI dark theme (Indigo/Pink palette, Outfit font)
```

### Routing

| Route    | Component     | Guard          |
|----------|--------------|----------------|
| `/login` | LoginPage    | None           |
| `/files` | MyFilesPage  | ProtectedRoute |
| `*`      | Redirect → `/files` | —        |
