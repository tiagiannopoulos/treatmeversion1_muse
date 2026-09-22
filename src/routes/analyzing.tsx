import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScan, AGE_RANGES } from "@/lib/scan-store";
import { CONCERN_GROUPS, type ConcernKey } from "@/lib/concerns";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/analyzing")({
  component: AnalyzingPage,
});

const STAGES = [
  "reading texture and clarity...",
  "mapping tone and pigment...",
  "checking structure and firmness...",
  "looking closely at the eye area...",
  "building your report...",
];

function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, data] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

function AnalyzingPage() {
  const navigate = useNavigate();
  const {
    photos,
    ageRange,
    setAgeRange,
    concerns,
    toggleConcern,
    email,
    setEmail,
    consent,
    setResult,
  } = useScan();

  const [stage, setStage] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2600);
    return () => clearInterval(t);
  }, []);

  const ready =
    photos.front && photos.left && photos.right && consent && email.includes("@");

  async function runAnalysis() {
    if (!ready || sending) return;
    setSending(true);
    setError(null);
    try {
      let token: string | null = null;
      if (isSupabaseConfigured()) {
        const sb = getSupabase();
        const { data } = await sb!.auth.getSession();
        token = data.session?.access_token ?? null;
        if (!token) {
          setError("please sign in first so your report can be saved to your account.");
          setSending(false);
          return;
        }
      }

      const form = new FormData();
      form.append("front", dataUrlToImage(photos.front!), "front.jpg");
      form.append("left", dataUrlToImage(photos.left!), "left.jpg");
      form.append("right", dataUrlToImage(photos.right!), "right.jpg");
      form.append("ageRange", ageRange ?? "");
      form.append("concerns", JSON.stringify(concerns));
      form.append("email", email);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 503) {
        setError("analysis is unavailable right now. please try again later.");
      } else if (res.status === 429) {
        setError("you have used all 5 free scans for today. come back tomorrow.");
      } else if (res.status === 401) {
        setError("please sign in first so your report can be saved to your account.");
      } else if (!res.ok) {
        setError(body.detail || body.error || "the scan could not be completed. please try again.");
      } else {
        setResult(body.result, body.scan_id);
        navigate({ to: "/report/$scanId", params: { scanId: body.scan_id ?? "latest" } });
        return;
      }
    } catch {
      setError("something went wrong sending your photos. check your connection and try again.");
    }
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <p className="tm-eyebrow">analyzing</p>
      <h1 className="tm-display mt-3 text-4xl">reading your skin.</h1>

      <div className="tm-card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="tm-pulse h-12 w-12 shrink-0 rounded-full bg-hot" />
          <p className="font-medium text-ink-soft">{STAGES[stage]}</p>
        </div>
        <div className="score-track mt-4">
          <div
            className="score-fill bg-hot"
            style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-mute">
          while you wait, tell us a little more. it sharpens your report.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="tm-display text-2xl">your age range</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AGE_RANGES.map((r) => (
            <button
              key={r}
              className="tm-chip"
              data-active={ageRange === r}
              onClick={() => setAgeRange(ageRange === r ? null : r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="tm-display text-2xl">what bothers you most</h2>
        <p className="mt-1 text-sm text-ink-mute">tap all that apply.</p>
        {CONCERN_GROUPS.map((g) => (
          <div key={g.key} className="mt-4">
            <p className="text-sm font-semibold text-ink-mute">{g.label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.concerns.map((c) => (
                <button
                  key={c.key}
                  className="tm-chip"
                  data-active={concerns.includes(c.key as ConcernKey)}
                  onClick={() => toggleConcern(c.key as ConcernKey)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="tm-display text-2xl">where should we send your report</h2>
        <p className="mt-1 text-sm text-ink-mute">
          your email unlocks the full report.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="tm-input mt-3"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-hot-soft p-4 text-sm font-medium text-hot-deep">
          {error}
        </p>
      )}

      <button
        onClick={runAnalysis}
        disabled={!ready || sending}
        className="tm-btn-hot mt-6 w-full"
      >
        {sending ? "analyzing..." : "get my report"}
      </button>
      {!email.includes("@") && (
        <p className="mt-2 text-center text-sm text-ink-mute">
          add your email above to unlock the button.
        </p>
      )}
    </div>
  );
}

function dataUrlToImage(dataUrl: string, name: string): File {
  return dataUrlToFile(dataUrl, name);
}
