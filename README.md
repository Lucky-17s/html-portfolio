## Portfolio Site (Static HTML)

Modernized UI with Tailwind, Supabase authentication (magic link + Google), and a contact form that saves to Postgres.

### Quick start
- Open `index.html` in a static server (for auth redirects it's best to serve over http://localhost).
- Fill in Supabase env in `public/env.js`:

```js
window.__ENV__ = {
  SUPABASE_URL: "https://YOUR-PROJECT.ref.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-KEY",
};
```

### Database schema (Supabase/Postgres)
Use the SQL in `db/schema.sql` in the Supabase SQL editor.

Optional: add a rate-limited edge function or use Supabase Realtime RLS to harden abuse further.

### Authentication
- Magic link and Google OAuth are wired via Supabase JS v2.
- Update `Authentication > URL Configuration` in Supabase to include `http://localhost:3000` (or your host) as redirect and site URL.

### Security
- Content Security Policy (CSP) is applied in both `index.html` and `public/contact.html`.
- `.gitignore` includes `.env*` to avoid committing secrets.

### Files
- `index.html`: Landing page with hero, sections, auth modal.
- `public/env.js`: Put your Supabase public env here.
- `public/app.js`: Theme toggle, auth UI, magic link + Google.
- `public/contact.html`: Contact details and message form.
- `public/contact.js`: Client-side validation and Supabase insert.
