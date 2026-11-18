# Beacon dashboard

Where developers create apps, get a Client ID, add their site's address and read the docs.
Live at https://dash.beaconmcu.space.

## Pages

| Page | Who | What it does |
|------|-----|--------------|
| `/login` | everyone | Sign in with Google |
| `/apps` | signed in | All your apps; create one (name only) |
| `/apps/:clientId` | signed in | Overview: users, network, domains, Client ID and the code to copy |
| `/apps/:clientId/playground` | signed in | Try the SDK live: log in, switch network, sign, send, with a live log and the code for each action |
| `/apps/:clientId/users` | signed in | Who has signed in to the app |
| `/apps/:clientId/settings` | signed in | Name, default network, sign-in methods, delete the app |
| `/apps/:clientId/domains` | signed in | Your live site addresses (localhost always works) |
| `/docs` | everyone | Documentation |

The signed-in pages share one shell: a sidebar (a slide-out drawer on phones) that also lists the open app's pages, a
top bar with a breadcrumb, and a profile menu (account, light/dark theme, documentation, sign out).

## Theme

All colours are tokens defined in `src/index.css` (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, ...). Light and
dark only swap the token values, so components never mention a colour directly. The choice is saved in localStorage
and applied before first paint (see `index.html`).

## Run it locally

```bash
cd Dashboard
cp .env.example .env     # VITE_API_URL=http://localhost:8787 (or the live backend)
npm install
npm run dev              # http://localhost:5173
```

Sign-in uses Beacon's Google client. `http://localhost:5173` must be an authorized JavaScript origin of that
OAuth client in Google Cloud Console (it already is).

## Deploy (Cloudflare Workers, static assets)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `Dashboard` (or `/` if this folder is its own repo)
- Add the custom domain `dash.beaconmcu.space` in the Worker's Domains tab once DNS is on Cloudflare.
- Also add the dashboard's address to the backend's CORS list (`backend/src/lib/cors.ts`) and to the Google OAuth
  client's authorized JavaScript origins.

`VITE_API_URL` is read at build time: set it as a **build** variable (Settings → Build → Variables), or it will be
`undefined` in the built site.

The Playground opens the Beacon wallet that is built into the SDK, so nothing needs configuring (SDK 0.1.3 and later;
older versions need `VITE_WALLET_URL` set as a build variable). The wallet always allows the dashboard's own address to
embed it (see `wallet/src/lib/origin.ts`).

## How it talks to the backend

`src/lib/api.ts` is the only place that calls the API. It sends the developer's session as a Bearer token and signs
the developer out when the server answers 401 (the session lasts one hour). The session is kept in the tab's
`sessionStorage`.
