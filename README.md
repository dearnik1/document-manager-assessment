# Propylon Document Manager

Document versioning system with a Django REST Framework backend and a React/TypeScript frontend.

### Prerequisites (macOS)
1. Install [Homebrew](https://brew.sh/) (if not already installed)
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
2. Install Python 3.11
```sh
brew install python@3.11
```

### Prerequisites (WSL / Ubuntu)
1. Update system and install base build tools
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install build-essential software-properties-common -y
```
2. Add the Deadsnakes PPA for Python 3.11
```sh
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
```
3. Install Python 3.11 and required environment tools
```sh
sudo apt install python3.11 python3.11-dev python3.11-venv -y
```

## Backend Setup

Create virtual environment and install dependencies:
```bash
make build
```

Load sample fixture data:
```bash
make fixture
```

(Optional) Create a superuser for accessing admin panel (PowerShell):
```powershell
$env:DJANGO_SETTINGS_MODULE="propylon_document_manager.site.settings.local"
python manage.py createsuperuser
```

(Optional) Create a superuser for accessing admin panel (Bash):
```bash
export DJANGO_SETTINGS_MODULE=propylon_document_manager.site.settings.local
python manage.py createsuperuser
```

Start the API server (port 8001):
```bash
make serve
```


### Backend Commands

- `$ make build` to create the virtual environment.
- `$ make fixture` to create a small number of fixture file versions.
- `$ make serve` to start the development server on port 8001.
- `$ make test` to run the limited test suite via PyTest.

## Frontend Setup

Navigate to the client directory (`cd client/doc-manager`) and use the following commands:

- `$ npm install` to install all dependencies.
- `$ npm run dev` to start Vite dev server with HMR.
- `$ npm run build` to type-check and build for production.
- `$ npm run test` to run Vitest unit tests.
- `$ npm run test:watch` to run tests in watch mode.
- `$ npm run lint` to run ESLint.
- `$ npm run format` to run Prettier.
