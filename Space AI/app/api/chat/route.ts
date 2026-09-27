import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables." },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to use Space AI." }, { status: 401 });

  const body = await req.json();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) return NextResponse.json({ error: "Add a message first." }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY to your environment variables." }, { status: 503 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are Space AI, a helpful, thoughtful assistant. Be clear, accurate, and friendly. If you are uncertain, say so." },
        ...messages.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" as const : "user" as const,
          content: String(m.content).slice(0, 12000),
        })),
      ],
    });
    return NextResponse.json({ reply: completion.choices[0]?.message?.content || "I couldn't generate a response." });
  } catch (e) {
    console.error("Space AI request failed", e);
    return NextResponse.json({ error: "The AI request failed. Check your API key and model access, then try again." }, { status: 500 });
  }
}
