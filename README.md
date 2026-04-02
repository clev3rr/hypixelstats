# Hypixel Stats

Web application for viewing Hypixel player and guild statistics, with player comparison and a modular frontend architecture.

## Features

- Player statistics lookup by username
- Guild statistics lookup by guild name or player name
- Side-by-side player comparator
- Recent searches and theme persistence
- FAQ, Contact, Change Log, and Privacy pages
- API-compliance oriented setup (unofficial project disclaimer, key via environment variables, request caching)

## Tech Stack

- **Backend:** Node.js, Express, Axios, CORS, dotenv
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Runtime:** CommonJS

## Project Structure

```text
.
├─ server.js
├─ package.json
├─ .env.example
├─ public/
│  ├─ index.html
│  ├─ style.css
│  ├─ styles/
│  └─ js/
│     ├─ main.js
│     ├─ core.js
│     ├─ navigation.js
│     ├─ player.js
│     ├─ compare.js
│     ├─ guild.js
│     └─ stats-render.js
```

## Prerequisites

- Node.js 18+
- A valid Hypixel API key from the Hypixel Developer Portal

## Environment Variables

Create a local `.env` file based on `.env.example`.

```env
HYPIXEL_API_KEY=your_hypixel_api_key_here
PORT=3000
API_CACHE_TTL_MS=300000
```

- `HYPIXEL_API_KEY`: required, your private Hypixel API key
- `PORT`: optional, defaults to `3000`
- `API_CACHE_TTL_MS`: optional, server-side cache TTL in milliseconds

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your key.

3. Start the server:

```bash
npm start
```

4. Open:

- http://localhost:3000

## API Usage Notes

- This project is **unofficial** and **not affiliated with or endorsed by Hypixel**.
- Do not commit or share your real API key.
- Avoid implementing continuous player session tracking/polling.
- Respect Hypixel API policies and Terms of Service.

## Security / Secrets

- `.env` must stay local and private.
- `.env.example` is safe to share.
- If a key is leaked, revoke/regenerate it in the Hypixel Developer Portal.

## Scripts

- `npm start` — run production-style local server

## License

ISC (per `package.json`)
