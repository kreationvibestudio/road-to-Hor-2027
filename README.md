# House of Reps 2027 — Campaign Website

Campaign site for **House of Representatives 2027**, **Esan North East & Esan South East Federal Constituency**, under the **ADC (African Democratic Congress)**.

**Live site:** [road-to-hor-2027.vercel.app](https://road-to-hor-2027.vercel.app)

## Message

- Putting **humanity** back in politics  
- **Service without mincing words**  
- Not a money bag — **competence and heart** to lead  
- **Accountable** to the people  

## Run locally

1. Open the project folder in Cursor (or any editor).
2. Serve the site with a simple HTTP server, or open `index.html` in a browser.

Using Python:

```bash
# Python 3
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

Using Node (if you have `npx`):

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
- **script.js** — Mobile menu and smooth scroll.

## Hosting

You can host this as static files on:

- **GitHub Pages** — Push to a repo and enable Pages.
- **Netlify** or **Vercel** — Drag the folder or connect the repo.
- Any web host that serves HTML/CSS/JS.

No build step required; upload the project folder as-is.

## Supabase

If you see **Invalid time zone specified: Etc/Unknown**:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the script in `supabase/timezone-fix.sql` (sets the database timezone to `UTC`).
3. Reconnect or refresh; new connections will use the correct timezone.

## Admin page (view requests)

The **Admin** link in the footer goes to a password-protected page where you can view all constituency project requests from anywhere.

### How it works

- Login uses **server-side auth**: you enter the password on the site; the server checks it and sets a secure **HttpOnly cookie** (no password is stored in the browser).
- Requests are loaded via an **API** that uses your Supabase **service role** key, so the list is not exposed to the public.
- Session lasts **24 hours**; use **Log out** to end it early.

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
