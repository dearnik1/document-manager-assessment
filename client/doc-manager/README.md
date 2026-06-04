# Document Manager Frontend

React/TypeScript SPA for the Propylon Document Manager.

## Tech Stack

- React 19 + TypeScript
- Material UI 9 (MUI) + MUI X DataGrid
- Vite 8 (bundler)
- Axios (HTTP client)
- Vitest + React Testing Library (testing)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
```

Requires the Django backend running on `http://localhost:8001`.

## Testing

```bash
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
```

## Build

```bash
npm run build        # Type-check + production build → dist/
npm run preview      # Preview production build locally
```

## Code Quality

```bash
npm run lint         # ESLint
npm run format       # Prettier (auto-fix)
```

## Project Structure

```
src/
├── api/            # Axios client, auth and file API functions
├── components/     # Reusable components (AppLayout, ProtectedRoute)
├── contexts/       # React context providers (AuthContext)
├── pages/          # Route-level pages (LoginPage, MyFilesPage)
├── utils/          # Utility modules (favorites localStorage helpers)
├── types/          # TypeScript interfaces
├── theme.ts        # MUI dark theme configuration
└── main.tsx        # Application entry point
```
