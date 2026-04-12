# House of Reps 2027 — Campaign Website

Campaign site for **House of Representatives 2027**, **Esan North East & Esan South East Federal Constituency**, under the **ADC (African Democratic Congress)**.

**Live site:** [road-to-hor-2027.vercel.app](https://road-to-hor-2027.vercel.app)

## Message

- Putting **humanity** back in politics  
- **Service without mincing words**  
- Not a money bag — **competence and heart** to lead  
- **Accountable** to the people  

## Run locally

This project uses **Vite** (`npm run dev`). For day-to-day work, prefer **Docker Desktop** so Node and dependencies match everywhere.

### Docker Desktop (recommended)

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

From the project root (`road-to-Hor-2027/`):

```bash
docker compose up --build
```

Open **http://localhost:5173** (Vite dev server; `--host 0.0.0.0` is set for containers).

- Source is bind-mounted from your machine; `node_modules` lives in a Compose volume so installs stay inside Linux and stay fast.
- On Windows, `CHOKIDAR_USEPOLLING=true` is set to improve file-watch reliability.

**Production-like preview** (serves the built `dist/` with Vite preview on port **4173**):

```bash
docker compose --profile preview up --build preview
```

Then open **http://localhost:4173**.

**One-off production build** (no running server):

```bash
docker build --target build -t road-to-hor-2027:build .
```

The built files are in the image at `/app/dist` (inspect with `docker run --rm road-to-hor-2027:build ls -la /app/dist`).

### Node on the host (without Docker)

```bash
npm ci
npm run dev
```

Open **http://localhost:5173**.

### Legacy: static server only

You can still serve files with a simple HTTP server, but the Vite module bundle and some features expect `npm run dev` or a proper `dist/` deploy.

Using Python:

```bash
python3 -m http.server 8000
```

Using Node:

```bash
npx serve .
```

## What to customize

- **Your name** — Add it in the hero and About section (replace generic “I” with your name where it fits).
- **Contact** — In the **Get in touch** section, add:
  - Phone number  
  - Email  
  - Social media links (e.g. WhatsApp, Twitter/X, Facebook)
- **Photo** — Optional: add a profile photo and a short “About” image in the About section.
- **Stories / experience** — In the About section, add a brief personal story or experience that shows why you’re running.

## Structure

- **index.html** — Single-page site: Hero, About, Why I’m Running, Vision & Priorities, FAQ, Contact.
- **styles.css** — Layout and styling (ADC-inspired green, mobile-first).
- **main.js** — Mobile menu, smooth scroll, manifesto language toggle, request form, funds table (loaded as a Vite module).
- **Dockerfile** / **docker-compose.yml** — Run dev and preview with Docker Desktop.

## Hosting

You can host this as static files on:

- **GitHub Pages** — Push to a repo and enable Pages.
- **Netlify** or **Vercel** — Drag the folder or connect the repo.
- Any web host that serves HTML/CSS/JS.

Production deploys typically use **`npm run build`** (outputs `dist/`). You can also build inside Docker (`docker build --target build`).

## Supabase

If you see **Invalid time zone specified: Etc/Unknown**:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the script in `supabase/timezone-fix.sql` (sets the database timezone to `UTC`).
3. Reconnect or refresh; new connections will use the correct timezone.

## Admin page (requests & projects)

The **Admin** link in the footer goes to a password-protected page where you can view constituency requests and manage projects.

### How it works

- Login uses **server-side auth**: you enter the password on the site; the server checks it and sets a secure **HttpOnly cookie** (no password is stored in the browser).
- Requests are loaded via an **API** that uses your Supabase **service role** key, so the list is not exposed to the public.
- **Add project**: On the Projects (Kanban) tab, use **Add project** to create a new constituency project. Fields include title, community, ward, category (e.g. Roads & transport, Water, Education, Healthcare), status, allocation amount/year, dates, and summary. New projects appear on the Kanban board after saving.
- **Work on a project**: Click a project card to open its detail. There you can: change **Status** (Planned / In progress / Completed / On hold); **Show on public site** (toggle whether the project appears in **Funds and transparency** on the main site when status is In progress or Completed); **Add notes/updates**; **Upload documents and images** (max 4MB per file). Attachments open in a new tab for viewing or download.
- Session lasts **24 hours**; use **Log out** to end it early.

**Funds and transparency:** The public site’s “Funds and transparency” section lists projects that have **started** (status In progress or Completed) and have **Show on public site** enabled. Run `supabase/projects-show-on-site.sql` in the Supabase SQL Editor to add the `show_on_site` column to `projects`.

**Attachments (documents & images):** Run `supabase/project-attachments-schema.sql` in the Supabase SQL Editor, then in Dashboard → **Storage** create a bucket named `project-attachments` (private). The admin upload and view links will then work.

### Vercel environment variables

For the admin page and API to work on the live site, set these in [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment variables**:

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | The password you use to log in to the admin page (e.g. a strong password only you know). |
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxxx.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard → **Project Settings → API** → **service_role** (secret). Never expose this in the frontend. |

Redeploy the project after adding or changing variables.

### Local development

To test the admin flow locally with Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Set the same env vars in `.env.local` (do not commit this file) or via `vercel env pull`. Then open **http://localhost:3000/admin.html** and log in.
