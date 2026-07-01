# PlantCare AI

PlantCare AI is a small Next.js web app that identifies a plant from a user-supplied image and returns tailored care instructions for water, sunlight, soil/fertilizer, and temperature/humidity.

## Preview

![Talk to your plant — light mode](docs/preview-light.jpeg)

## Tech stack

- Next.js App Router with TypeScript
- OpenAI `gpt-4o` vision via the official `openai` SDK
- Hand-written CSS implementing the Blend design system
- Client-side HEIC conversion and image downscaling with `heic2any`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your OpenAI key:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Next.js and upload a clear image of one plant.

## Deployment

PlantCare AI is a standard Next.js app with server-side API routes. The only required secret is `OPENAI_API_KEY`.

### Verify the build

Before deploying, confirm the production build succeeds locally:

```bash
npm run build
npm start
```

### Vercel (recommended)

This project is designed for a Vercel-style deployment: the UI and `/api/*` routes ship as one app, and the OpenAI key stays on the server.

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add an environment variable:
   - `OPENAI_API_KEY` — your OpenAI API key
4. Deploy. Vercel runs `npm run build` and serves the app automatically.

Redeploy after changing environment variables.

### Other Node hosts

Any host that can run Next.js works (Railway, Render, Fly.io, a VPS, etc.):

1. Set `OPENAI_API_KEY` in the host's environment.
2. Run `npm install`, `npm run build`, and `npm start`.
3. Expose the port your host expects (Next.js defaults to `3000`).

Use Node 18 or later.

### Post-deploy checks

- Open the site and upload a clear plant photo.
- Confirm identification returns care instructions.
- Try a follow-up question to verify `/api/followup`.
- If requests fail immediately, check that `OPENAI_API_KEY` is set in the deployment environment.

### Notes

- There is no authentication in v0.1; anyone with the URL can use the app and consume OpenAI quota.
- API routes call OpenAI on each identification and follow-up; monitor usage and set billing limits in your OpenAI account.

## How it works

- The browser converts HEIC images to JPEG when needed and downscales large images before upload.
- `POST /api/identify` sends the image to OpenAI and asks for a structured JSON response containing the plant identity, confidence, and care fields.
- Low-confidence or non-plant responses show a clearer-photo fallback instead of care results.
- `POST /api/followup` answers plant-specific care questions using the identified plant context.

## Scope

Included in v0.1: image upload, plant identification, care instructions, confidence/fallback handling, follow-up Q&A, JPEG/PNG/HEIC support, and Blend styling.

Out of scope in v0.1: accounts, history, reminders, disease or pest diagnosis, and multi-plant detection.
