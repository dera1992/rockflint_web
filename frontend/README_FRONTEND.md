# Rockflint Realty Frontend

## Setup

```bash
cd frontend
npm install
```

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

## Backend integration

- Base URL is configured via `NEXT_PUBLIC_API_BASE_URL`.
- Listings, vendors, customers, and auth endpoints are integrated via `/api/*` routes.
- JWT refresh uses `/api/users/token/refresh/`.
