# Orban driver app (React + Vite) - complete project

This is a full, ready-to-run project (it has its own `package.json` and `index.html`),
so you do not need your old driver folder.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Then open the address the terminal prints (it will be `http://localhost:5174/`).
Start the backend first (see `orban-backend.zip`): `npm run seed` then `npm run dev`.
Demo login: `emeka@example.com` / `demo1234`.

If your backend is not on port 5000, change `VITE_API_URL` in `.env` and restart `npm run dev`.

## Pages
`/login` `/signup` `/` (online switch, earnings, requests) `/trips` `/history` `/vehicle` `/notifications` `/profile`

## How it is organised
- `src/Context/DriverContext.jsx` - login session and every API call.
- `src/Pages/` - one file per screen. `src/Components/` - trip and request cards, image picker, layout.
- Going offline hides the car from riders' search (the backend checks it).
- Photos are shrunk in the browser before upload (`src/utils/image.js`).

## What changed from your old driver app
The old live-request dashboard is replaced by scheduled booking requests. That old screen called
`${API_BASE}/requests` without `/api`, which is one reason it was not working.
