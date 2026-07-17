# Deployment

PlantCare AI is a standard Next.js app with server-side API routes. This guide covers deploying under the `/plant-ai` subpath on a shared domain.

## Prerequisites

- Node.js 18 or later
- `OPENAI_API_KEY` for plant identification and follow-up chat

## Mount path (build time)

Set `NEXT_PUBLIC_BASE_PATH` before building. `next.config.ts` reads it and configures:

- **`basePath`** — page and API route URLs (e.g. `/plant-ai`, `/plant-ai/api/identify`)
- **`assetPrefix`** — static asset URLs (e.g. `/plant-ai/_next/static/...`)
- **Client API calls** — `lib/api.ts` via the same env var

Example for subpath deployment:

```bash
export NEXT_PUBLIC_BASE_PATH=/plant-ai
npm run build
```

To deploy at the domain root, leave the variable unset or empty and rebuild:

```bash
unset NEXT_PUBLIC_BASE_PATH
npm run build
```

Copy `.env.example` to `.env.local` for local development:

```bash
NEXT_PUBLIC_BASE_PATH=/plant-ai
OPENAI_API_KEY=your_openai_api_key_here
```

The value must be set at **build time** and match what the reverse proxy forwards. Changing it after build requires a rebuild.

## Environment variables

| Variable | Required | When | Notes |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Runtime | Server-only; never expose to the client |
| `NEXT_PUBLIC_BASE_PATH` | No | Build | Subpath mount (e.g. `/plant-ai`); empty for domain root |
| `NODE_ENV` | Auto | Runtime | Set to `production` by the host |
| `PORT` | No | Runtime | Defaults to `3000` |

## Build and start

```bash
npm ci
NEXT_PUBLIC_BASE_PATH=/plant-ai npm run build
npm start
```

The process listens on port 3000 (or `PORT`) and expects incoming URLs to include the `/plant-ai` prefix.

## Reverse proxy (nginx)

When the app runs behind nginx on the same domain, **forward the full `/plant-ai` prefix**. Do not strip it — Next.js with `basePath` expects requests to arrive with the prefix intact.

```nginx
# Redirect bare /plant-ai → /plant-ai/
location = /plant-ai {
    return 301 /plant-ai/;
}

location /plant-ai/ {
    proxy_pass http://127.0.0.1:3000/plant-ai/;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This single block covers pages, API routes, and static assets.

## Process manager (systemd)

Example unit file for running the app on a VPS:

```ini
[Unit]
Description=PlantCare AI
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/plantcare-ai
Environment=OPENAI_API_KEY=sk-...
Environment=PORT=3000
# NEXT_PUBLIC_BASE_PATH is build-time only; set it before npm run build, not here.
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Public URL: `https://yourdomain.com/plant-ai`

## Post-deploy checks

```bash
# App route — should return HTML
curl -I https://yourdomain.com/plant-ai/

# API route — should return JSON (400 without image), not HTML
curl -s -X POST https://yourdomain.com/plant-ai/api/identify \
  -H "Content-Type: application/json" -d '{}'

# Static assets — should return 200
curl -I https://yourdomain.com/plant-ai/_next/static/...
```

In the browser:

1. Open `https://yourdomain.com/plant-ai`
2. Upload a plant photo and confirm identification works
3. In DevTools → Network, verify the request goes to `POST /plant-ai/api/identify` (not `/api/identify`)
4. Ask a follow-up question to verify `/plant-ai/api/followup`

## Common mistakes

1. **Building without `basePath`** then deploying behind `/plant-ai` — assets and API calls will break.
2. **Stripping the prefix in nginx** (e.g. `proxy_pass http://127.0.0.1:3000/;`) — Next.js will not match routes.
3. **Setting only `assetPrefix` on the server** — that affects static URLs only, not API routing; both need `basePath`.
4. **Changing `NEXT_PUBLIC_BASE_PATH` at runtime** — it must match the value used at build time; rebuild after changing it.

## Vercel

Vercel works well when the app owns the whole domain (e.g. `plant-ai.example.com`). Mounting at `example.com/plant-ai` on a shared domain typically requires routing through another project's rewrites or using your own Node host with the nginx config above.

For a dedicated Vercel deployment:

1. Import the repo in [Vercel](https://vercel.com/new)
2. Set environment variables:
   - `OPENAI_API_KEY` — your OpenAI API key
   - `NEXT_PUBLIC_BASE_PATH` — e.g. `/plant-ai`, or leave unset for domain root
3. Deploy — Vercel runs `npm run build` automatically

Redeploy after changing `NEXT_PUBLIC_BASE_PATH` or `OPENAI_API_KEY`.

## Security notes

- There is no authentication in v0.1; anyone with the URL can use the app and consume OpenAI quota.
- API routes call OpenAI on each identification and follow-up; monitor usage and set billing limits in your OpenAI account.
