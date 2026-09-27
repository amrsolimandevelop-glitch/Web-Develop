# Space AI

A dark, modern AI chat website with email/password account creation, sign-in, a responsive chat interface, and a server-side AI endpoint.

## What's included

- Sign-up and sign-in using Supabase Auth
- Email confirmation support (configurable in Supabase)
- Protected chat API: unauthenticated users cannot use the AI endpoint
- OpenAI API key stays on the server (never expose it as a `NEXT_PUBLIC_` variable)
- Responsive desktop and mobile UI
- Optional Supabase schema with row-level security for storing conversations and messages

## Run locally

You need Node.js 20.9+ and accounts with [Supabase](https://supabase.com/) and [OpenAI](https://platform.openai.com/).

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your keys.
3. In Supabase, create a project. Find the project URL and publishable/anon key in **Project Settings → API**.
4. Add those values to `.env.local`. Add your OpenAI API key as `OPENAI_API_KEY`.
5. In Supabase **Authentication → URL Configuration**, set your local Site URL to `http://localhost:3000`. Configure production URLs after deployment.
6. In Supabase **Authentication → Providers → Email**, configure whether email confirmation is required.
7. Start the website:
   ```bash
   npm run dev
   ```
8. Open http://localhost:3000.

## Deploy

Import this folder into a GitHub repository and deploy it on Vercel (or another Next.js host). Add the same environment variables in the host's project settings. Set the Supabase production Site URL and redirect URLs to your live domain.

## Important setup notes

- The site is a starter project, not a deployed public website. It becomes functional after you add your own Supabase and OpenAI credentials and run/deploy it.
- Each visitor creates their own account. Supabase handles password storage and authentication; this project does not store raw passwords.
- The current starter keeps the chat in the page while it is open. To save and restore chat history across sessions, run `supabase/schema.sql` in Supabase and connect the UI to the `conversations` and `messages` tables.
- API usage can incur charges on your OpenAI account. Set usage limits and monitor usage before sharing publicly.
- Add rate limiting, abuse monitoring, privacy/terms pages, and CAPTCHA or bot protection before a public launch.
