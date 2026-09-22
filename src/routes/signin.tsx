import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setError("sign in is not configured yet.");
      return;
    }
    setLoading(true);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message.toLowerCase());
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <p className="tm-eyebrow">account</p>
      <h1 className="tm-display mt-3 text-4xl">sign in.</h1>
      <p className="mt-3 text-ink-soft">
        one account keeps your scans, reports and rescan history together.
      </p>

      {!configured && (
        <div className="tm-card mt-6 border-hot/40 bg-hot-soft p-5">
          <p className="font-semibold text-hot-deep">sign in is not set up yet.</p>
          <p className="mt-1 text-sm text-ink-soft">
            add your supabase keys to .env to enable accounts. you can still
            explore the scan flow.
          </p>
        </div>
      )}

      {sent ? (
        <div className="tm-card mt-6 p-6 text-center">
          <p className="text-3xl">sent.</p>
          <p className="mt-2 text-ink-soft">
            check {email} for your sign in link.
          </p>
          <button className="tm-btn-ghost mt-5" onClick={() => navigate({ to: "/" })}>
            back home
          </button>
        </div>
      ) : (
        <form onSubmit={sendLink} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="tm-input"
          />
          {error && <p className="text-sm font-medium text-hot-deep">{error}</p>}
          <button type="submit" disabled={loading || !configured} className="tm-btn-hot w-full">
            {loading ? "sending..." : "send me a sign in link"}
          </button>
        </form>
      )}
    </div>
  );
}
