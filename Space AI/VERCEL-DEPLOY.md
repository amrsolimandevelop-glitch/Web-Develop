# Space AI — Vercel deployment

## 1. Deploy the project

This is a Next.js project. The repository root must contain `package.json`, `next.config.ts`, `app/`, `lib/`, and `supabase/`.

In Vercel, import the GitHub repository and use the default Next.js settings:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave blank/default

After a commit to the connected production branch, Vercel should start a deployment automatically.

## 2. Configure environment variables

In Vercel → Project → Settings → Environment Variables, add these variables for Production (and Preview if desired):

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable/anon key
- `OPENAI_API_KEY` — secret API key from your OpenAI account
- `OPENAI_MODEL` — optional; defaults to `gpt-4.1-mini`

Never put `OPENAI_API_KEY` in a `NEXT_PUBLIC_` variable, commit it to GitHub, or share it in chat.

After adding or changing variables, redeploy the latest deployment so they take effect.

## 3. Set up Supabase database

Open the SQL Editor in your Supabase project and run `supabase/schema.sql`.

In Supabase Authentication settings, configure the site URL to your deployed Vercel URL and add the relevant redirect URLs for production/preview as needed. For a smoother signup flow, review whether email confirmation is enabled and configure email delivery.

## 4. Test

1. Open the deployed URL.
2. Create an account and complete email confirmation if enabled.
3. Sign in.
4. Send a test message in Space AI.

If deployment fails, inspect the *first actual error* in Vercel Build Logs, not only the final summary line.
