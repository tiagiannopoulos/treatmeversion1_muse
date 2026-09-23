import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") ? search.next : "/",
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  // if a session already exists (or one is established by the magic link
  // landing back on this page), continue to the return-to path.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    sb.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) navigate({ to: next, replace: true });
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) navigate({ to: next, replace: true });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate, next]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setError("sign in is not configured yet.");
      return;
    }
    setLoading(true);
    // redirect back to this page with the return-to path preserved, so the
    // magic link lands the user where they came from. window.location.origin
    // is the live site origin in production.
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signin?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) setError(error.message.toLowerCase());
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="tm-display text-4xl">sign in.</h1>
      <p className="mt-3 text-ink-soft">
        one account keeps your scans, reports and rescan history together.
        sign in to start your scan.
      </p>

      {!configured && (
        <div className="tm-card mt-6 border-hot/40 bg-hot-soft p-5">
          <p className="font-semibold text-hot-deep">sign in is not set up yet.</p>
          <p className="mt-1 text-sm text-ink-soft">
            add your supabase keys to .env to enable accounts.
          </p>
        </div>
      )}

      {sent ? (
        <div className="tm-card mt-6 p-6 text-center">
          <p className="tm-display text-3xl">sent.</p>
          <p className="mt-2 text-ink-soft">
            check {email} for your sign in link.
          </p>
          <p className="mt-1 text-sm text-ink-mute">
            open it on this device and browser. not there? check spam, then try again.
          </p>
          <button className="tm-btn-ghost mt-5" onClick={() => navigate({ to: "/" })}>
            back home
          </button>
        </div>
      ) : (
        <form onSubmit={sendLink} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">email</span>
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="tm-input mt-2"
            />
          </label>
          {error && <p className="text-sm font-medium text-hot-deep">{error}</p>}
          <button type="submit" disabled={loading || !configured} className="tm-btn-hot w-full">
            {loading ? "sending..." : "send me a sign in link"}
          </button>
        </form>
      )}
    </div>
  );
}
