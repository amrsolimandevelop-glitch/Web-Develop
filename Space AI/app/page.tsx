"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  ArrowUp, Atom, BrainCircuit, Check, ChevronDown, CircleHelp, Compass,
  FileText, Globe2, LogOut, Menu, MessageSquare, Plus, Settings2, Sparkles,
  WandSparkles, X
} from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type User = { id: string; email?: string };

const suggestions = [
  { icon: BrainCircuit, title: "Explain a complex topic", prompt: "Explain quantum computing in simple terms, with an analogy." },
  { icon: WandSparkles, title: "Write something great", prompt: "Help me write a polished, engaging introduction for a project." },
  { icon: Compass, title: "Plan my next move", prompt: "Help me turn a big goal into a practical 7-day action plan." },
  { icon: FileText, title: "Summarize and learn", prompt: "Show me a useful method for learning and remembering new information." },
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTitle, setActiveTitle] = useState("New conversation");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthMessage("Setup required: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables.");
      setAuthReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setAuthBusy(true); setAuthMessage("");
    if (!supabase) {
      setAuthMessage("Setup required: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables.");
      setAuthBusy(false);
      return;
    }
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail, password: authPassword,
          options: { data: { full_name: authName } },
        });
        if (error) throw error;
        if (data.session) setUser({ id: data.user!.id, email: data.user!.email });
        else setAuthMessage("Account created! Check your email to confirm your account, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user) setUser({ id: data.user.id, email: data.user.email });
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setAuthBusy(false); }
  }

  async function sendMessage(text = input) {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next); setInput(""); setBusy(true);
    if (!messages.length) {
      setActiveTitle(content.length > 32 ? content.slice(0, 32) + "…" : content);
      setHistory(prev => [content.length > 32 ? content.slice(0, 32) + "…" : content, ...prev].slice(0, 8));
    }
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `**A quick setup note:** ${err instanceof Error ? err.message : "Please try again."}` }]);
    } finally { setBusy(false); }
  }

  function newChat() { setMessages([]); setInput(""); setActiveTitle("New conversation"); setMobileSidebar(false); }
  async function signOut() { if (supabase) await supabase.auth.signOut(); setMessages([]); setHistory([]); }

  if (!authReady) return <main className="loading-screen"><div className="brand-mark"><Atom size={23}/></div><span>Preparing your space…</span></main>;

  if (!user) return (
    <main className="auth-page">
      <div className="auth-orb orb-one" /><div className="auth-orb orb-two" />
      <a className="brand auth-brand" href="#"><span className="brand-mark"><Atom size={23}/></span><span>space<span className="brand-ai">AI</span></span></a>
      <div className="auth-card">
        <div className="auth-icon"><Sparkles size={23}/></div>
        <div className="eyebrow">YOUR PERSONAL AI SPACE</div>
        <h1>{authMode === "signup" ? "Make room for big ideas." : "Welcome back."}</h1>
        <p className="auth-subtitle">{authMode === "signup" ? "Create your account and bring your next idea to life." : "Sign in to pick up where your ideas left off."}</p>
        <form onSubmit={handleAuth} className="auth-form">
          {authMode === "signup" && <label>Your name<input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="How should we call you?" autoComplete="name" required /></label>}
          <label>Email address<input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete={authMode === "signup" ? "new-password" : "current-password"} required /></label>
          {authMessage && <div className="auth-message">{authMessage}</div>}
          <button className="primary auth-submit" disabled={authBusy || !supabase}>{authBusy ? "Please wait…" : authMode === "signup" ? "Create free account" : "Sign in"} <ArrowUp size={16} className="arrow-right"/></button>
        </form>
        <div className="auth-switch">{authMode === "signup" ? "Already have an account?" : "New to Space AI?"} <button onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setAuthMessage(""); }}>{authMode === "signup" ? "Sign in" : "Create account"}</button></div>
        <div className="auth-security"><Check size={14}/> Your account. Your space. Your conversations.</div>
      </div>
      <div className="auth-footer">A little more room to think. <span>© 2026 Space AI</span></div>
    </main>
  );

  return (
    <main className="app-shell">
      {mobileSidebar && <button aria-label="Close menu" className="mobile-scrim" onClick={() => setMobileSidebar(false)} />}
      <aside className={`sidebar ${mobileSidebar ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <a className="brand" href="#" onClick={e => { e.preventDefault(); newChat(); }}><span className="brand-mark"><Atom size={21}/></span><span>space<span className="brand-ai">AI</span></span></a>
          <button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMobileSidebar(false)}><X size={18}/></button>
        </div>
        <button className="new-chat" onClick={newChat}><Plus size={17}/> <span>New conversation</span><span className="shortcut">⌘ K</span></button>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active" onClick={newChat}><MessageSquare size={17}/> Chat</button>
        <button className="nav-item" onClick={() => setInput("Help me brainstorm five creative ideas for a new project.")}><Sparkles size={17}/> Explore ideas <span className="tiny-new">NEW</span></button>
        <div className="side-label history-label">RECENT</div>
        {history.length ? history.map((item, i) => <button key={`${item}-${i}`} className="history-item" title={item} onClick={() => { setMessages([]); setInput(item); }}>{item}</button>) : <div className="empty-history">Your recent chats will show up here.</div>}
        <div className="sidebar-bottom">
          <div className="plan-card"><div className="plan-icon"><Sparkles size={15}/></div><div><strong>Your ideas, amplified.</strong><span>Space to think without limits.</span></div></div>
          <button className="profile-row" onClick={signOut}><div className="avatar">{(user.email || "U").slice(0,1).toUpperCase()}</div><div className="profile-text"><strong>{user.email?.split("@")[0] || "Your account"}</strong><span>{user.email}</span></div><LogOut size={16} className="logout-icon"/></button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button menu-toggle" aria-label="Open menu" onClick={() => setMobileSidebar(true)}><Menu size={19}/></button><span className="breadcrumb">Workspace</span><span className="crumb-slash">/</span><span className="current-crumb">{activeTitle}</span></div>
          <div className="topbar-right"><span className="model-pill"><span className="status-dot"/> Space AI <ChevronDown size={13}/></span><button className="icon-button" aria-label="Help" title="Help"><CircleHelp size={18}/></button></div>
        </header>

        <div className={`chat-area ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-symbol"><div className="symbol-ring ring-a"/><div className="symbol-ring ring-b"/><Atom size={35} strokeWidth={1.35}/><span className="symbol-spark">✳</span></div>
              <div className="eyebrow welcome-eyebrow">A NEW KIND OF THINKING SPACE</div>
              <h1>What’s on your <span>mind?</span></h1>
              <p className="welcome-copy">Big question, tiny task, wild idea —<br className="desktop-break"/> wherever your mind goes, start here.</p>
              <div className="suggestion-grid">{suggestions.map(({icon: Icon, title, prompt}) => <button className="suggestion-card" key={title} onClick={() => sendMessage(prompt)}><span className="suggestion-icon"><Icon size={18}/></span><span className="suggestion-title">{title}</span><span className="suggestion-arrow">↗</span></button>)}</div>
            </div>
          ) : (
            <div className="conversation">
              {messages.map((m, i) => <div key={i} className={`message-row ${m.role}`}><div className={`message-avatar ${m.role === "assistant" ? "ai-avatar" : ""}`}>{m.role === "assistant" ? <Atom size={17}/> : (user.email || "U").slice(0,1).toUpperCase()}</div><div className="message-body"><div className="message-name">{m.role === "assistant" ? "Space AI" : "You"}</div><div className="message-content">{m.content}</div></div></div>)}
              {busy && <div className="message-row assistant"><div className="message-avatar ai-avatar"><Atom size={17}/></div><div className="message-body"><div className="message-name">Space AI</div><div className="typing"><i/><i/><i/></div></div></div>}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask anything, explore everything…" rows={1} aria-label="Message Space AI"/>
            <div className="composer-bottom"><div className="composer-hint"><span className="hint-spark">✳</span> Curiosity looks good on you.</div><div className="composer-actions"><span className="enter-hint">↵ to send</span><button className="send-button" disabled={!input.trim() || busy} aria-label="Send message"><ArrowUp size={18}/></button></div></div>
          </form>
          <p className="disclaimer">Space AI can make mistakes. Check important information.</p>
        </div>
      </section>
    </main>
  );
}
