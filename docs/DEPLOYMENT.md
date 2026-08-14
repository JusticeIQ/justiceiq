# Deployment Guide

## 1. Local installation

```bash
git clone <your-repo-url> justiceiq
cd justiceiq
npm install
cp .env.example .env.local   # optional — demo mode works without this
npm run dev
```

Visit `http://localhost:3000`. Without Supabase credentials configured, the app runs entirely in
seeded demo mode.

## 2. Supabase setup (for production data persistence)

1. Create a project at [supabase.com](https://supabase.com/dashboard)
2. In the SQL Editor, run `supabase/schema.sql` (creates all tables, indexes, and RLS policies)
3. Run `supabase/seed.sql` for reference data (subscription plans, task templates)
4. Create a private Storage bucket named `matter-documents` for uploaded evidence, and configure
   storage RLS so only members of the owning firm can read/write objects under
   `matter-documents/{firm_id}/{matter_id}/...`
5. In Project Settings → API, copy your **Project URL** and **anon public key**
6. Set them as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
7. If implementing the JusticeChamp integration, set `JUSTICECHAMP_WEBHOOK_SECRET` (server-only)
   and `NEXT_PUBLIC_JUSTICECHAMP_APP_URL`

> Note: the MVP UI still reads/writes through the local demo store (`src/lib/store.tsx`).
> Connecting Supabase end-to-end requires replacing those calls with Supabase queries — see
> `docs/ARCHITECTURE.md` and `docs/CTO_REVIEW_NOTES.md` for the recommended approach.

## 3. Vercel deployment

1. Push your repository to GitHub (see below)
2. In [Vercel](https://vercel.com/new), import the repository — Next.js is auto-detected
3. Add environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; mark as "Sensitive")
   - `JUSTICECHAMP_WEBHOOK_SECRET` (server-only)
   - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_JUSTICECHAMP_APP_URL`
4. Deploy. The app works even if Supabase variables are omitted — it runs in demo mode in
   production too, which is useful for a public investor/lawyer-facing preview link.

## 4. GitHub setup

```bash
cd justiceiq
git init
git add .
git commit -m "Initial SolonIQ MVP"
git branch -M main
git remote add origin https://github.com/<your-org>/justiceiq.git
git push -u origin main
```

Then connect the repo to Vercel for automatic deployments on every push to `main`.

## 5. Environment variable reference

See `.env.example` for the full list with comments. Never commit `.env.local` or any file
containing real Supabase credentials — `.gitignore` already excludes `.env*` (except
`.env.example`).
