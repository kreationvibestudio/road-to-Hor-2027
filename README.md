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
