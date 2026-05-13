# Launch checklist — Road to HoR 2027

Use this as a living roadmap. Check items as you complete them.

---

## Content gaps (public site)

- [ ] **Candidate identity** — Replace generic “I” with full name everywhere it belongs (hero, About, footer if needed).
- [ ] **Contact block** — Add real phone, email, and social/WhatsApp links in **Get in touch**; verify every link.
- [ ] **Photo / About** — Add portrait and optional second image in About if desired.
- [ ] **Story** — Short personal narrative in About (why you, why now, local ties).
- [ ] **Constituency specificity** — Ward/community names, local references, 2–3 concrete examples in Vision & priorities.
- [ ] **FAQ** — Tune answers to real questions; add or remove items as needed.
- [ ] **Funds & transparency** — Align disclaimer with what you can publish (sources, update cadence).
- [ ] **Privacy / trust** — Short privacy note for the request form (what you collect, how it’s used, retention). Link from footer if you collect PII.
- [ ] **SEO basics** — Page title, meta description; optional Open Graph image for sharing.

---

## Security hardening

- [ ] **Supabase `requests` table** — Confirm Row Level Security and policies: public insert only for needed fields; no broad anon read/update.
- [ ] **Keys** — Service role only in Vercel / server; anon only in the browser. Rotate if anything was ever leaked or committed.
- [ ] **Admin session secret** — Prefer a dedicated long random signing secret instead of reusing `ADMIN_PASSWORD` as the HMAC key (optional hardening).
- [ ] **Cookies** — Confirm HttpOnly, Secure (prod), and SameSite match your deployment domains.
- [ ] **Admin abuse** — Rate-limit or monitor failed logins if your stack supports it.
- [ ] **Uploads** — Size limits enforced; consider MIME allowlist for attachments if needed.
- [ ] **Dependencies** — Run `npm audit` periodically; upgrade intentionally.
- [ ] **Repo hygiene** — No secrets in `index.html` / client code beyond public anon key; `.env`, `admin-config.js`, `.vercel` stay ignored.

---

## Testing (before each meaningful launch)

- [ ] **Public smoke** — Nav anchors, mobile menu, manifesto EN/Esan toggle, contact links.
- [ ] **Request form** — Test submit; confirm row in Supabase; no console errors.
- [ ] **Funds table** — Test project (in progress or completed + show on site) appears via `/api/public-projects`.
- [ ] **Admin** — Login, logout, requests list, create project, status changes, show on site toggle, notes, small file upload, open attachment.
- [ ] **Cross-browser** — Chrome + Safari (iOS) + one Android browser.
- [ ] **Performance** — Lighthouse (mobile); fix obvious LCP / image issues.
- [ ] **Accessibility** — Keyboard nav, focus, labels, contrast (especially navy blue on white).

---

## Launch-readiness (go-live)

- [ ] **Vercel env** — `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` set for Production (and Preview if you use admin there). Redeploy after changes.
- [ ] **Supabase (production)** — Run needed SQL from `supabase/` (schema, `show_on_site`, attachments, timezone fix); create storage bucket if using uploads.
- [ ] **GitHub ↔ Vercel** — Repo linked; production branch correct; preview deploys acceptable for QA.
- [ ] **Domain** — Custom domain on Vercel if not using `*.vercel.app` only; HTTPS and www/non-www redirect as preferred.
- [ ] **Monitoring** — Optional error tracking or a simple post-deploy verification routine.
- [ ] **Access & backup** — Who has Supabase + Vercel access documented; data/export policy if needed.
- [ ] **Runbook** — Short “if form fails, check …; if admin fails, check …” for the team.

---

## Suggested order

1. Content + contact (credibility).
2. Supabase RLS + key hygiene (safety).
3. Full admin + public smoke tests.
4. Vercel production env + domain.
5. Privacy note + Lighthouse / a11y pass.

---

## Local tooling (this repo)

- [ ] Run `check-connections.cmd` when setting up a new machine (GitHub + Vercel + local Node).
- [ ] If Vercel CLI auth is missing: `vercel-local.cmd login`

See **README.md** → *Connection quick fix (GitHub + Vercel)* for details.
