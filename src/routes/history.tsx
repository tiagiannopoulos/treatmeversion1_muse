import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CONCERN_LABELS,
  type ConcernKey,
} from "@/lib/concerns";
import { BandBadge } from "@/components/ScoreBar";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

interface ScanRow {
  id: string;
  created_at: string;
  scores: Record<string, number>;
  top_priorities: string[];
  summary: string;
}

const RESCAN_DAYS = 30;

function HistoryPage() {
  const [scans, setScans] = useState<ScanRow[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const sb = getSupabase();
      if (!sb) {
        setSignedIn(false);
        return;
      }
      const { data: session } = await sb.auth.getSession();
      if (!session.session) {
        if (!cancelled) {
          setSignedIn(false);
          setScans([]);
        }
        return;
      }
      if (!cancelled) setSignedIn(true);
      const { data } = await sb
        .from("scans")
        .select("id, created_at, scores, top_priorities, summary")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setScans((data as ScanRow[]) ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured() || signedIn === false) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="tm-eyebrow">history</p>
        <h1 className="tm-display mt-3 text-4xl">sign in to see your history.</h1>
        <p className="mt-3 text-ink-soft">
          your scans and rescan comparisons live in your account.
        </p>
        <Link to="/signin" className="tm-btn-hot mt-6">
          sign in
        </Link>
      </div>
    );
  }

  if (scans === null) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="tm-pulse mx-auto h-12 w-12 rounded-full bg-hot" />
        <p className="mt-4 text-ink-soft">loading your scans...</p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="tm-eyebrow">history</p>
        <h1 className="tm-display mt-3 text-4xl">no scans yet.</h1>
        <p className="mt-3 text-ink-soft">your first scan starts your timeline.</p>
        <Link to="/scan" className="tm-btn-hot mt-6">
          scan my skin
        </Link>
      </div>
    );
  }

  const latest = scans[0];
  const previous = scans[1] ?? null;
  const daysSince = Math.floor(
    (Date.now() - new Date(latest.created_at).getTime()) / 86400000,
  );
  const rescanDue = daysSince >= RESCAN_DAYS;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <p className="tm-eyebrow">history</p>
      <h1 className="tm-display mt-3 text-4xl">watch your skin change.</h1>

      {rescanDue ? (
        <div className="tm-card mt-6 border-hot/40 bg-hot-soft p-6">
          <p className="font-bold text-hot-deep">
            it has been {daysSince} days since your last scan.
          </p>
          <p className="mt-1 text-ink-soft">
            time for a rescan to see what is improving and what needs attention.
          </p>
          <Link to="/scan" className="tm-btn-hot mt-4">
            rescan now
          </Link>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-mute">
          last scan {daysSince === 0 ? "today" : `${daysSince} days ago`}. we will
          nudge you to rescan after {RESCAN_DAYS} days.
        </p>
      )}

      {previous && (
        <div className="mt-8">
          <h2 className="tm-display text-2xl">since your last scan</h2>
          <div className="tm-card mt-3 divide-y divide-line p-6">
            <ComparisonRow
              label="biggest improvement"
              rows={topMovers(latest, previous, "up")}
            />
            <ComparisonRow
              label="needs attention"
              rows={topMovers(latest, previous, "down")}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="tm-display text-2xl">all scans</h2>
        <div className="mt-3 space-y-3">
          {scans.map((s) => (
            <Link
              key={s.id}
              to="/report/$scanId"
              params={{ scanId: s.id }}
              className="tm-card block p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {new Date(s.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">
                    {Math.round(avgScore(s))}
                  </span>
                  <BandBadge score={avgScore(s)} />
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{s.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.top_priorities.slice(0, 3).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink-soft"
                  >
                    {CONCERN_LABELS[p as ConcernKey] ?? p}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function avgScore(s: ScanRow): number {
  const vals = Object.values(s.scores);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function topMovers(latest: ScanRow, previous: ScanRow, dir: "up" | "down") {
  const deltas = Object.keys(latest.scores).map((k) => ({
    key: k as ConcernKey,
    delta: latest.scores[k] - (previous.scores[k] ?? latest.scores[k]),
  }));
  const sorted = deltas.sort((a, b) =>
    dir === "up" ? b.delta - a.delta : a.delta - b.delta,
  );
  return sorted.slice(0, 3).filter((d) => (dir === "up" ? d.delta > 0 : d.delta < 0));
}

function ComparisonRow({
  label,
  rows,
}: {
  label: string;
  rows: { key: ConcernKey; delta: number }[];
}) {
  return (
    <div className="py-4">
      <p className="text-sm font-semibold text-ink-mute">{label}</p>
      {rows.length === 0 ? (
        <p className="mt-1 text-sm text-ink-soft">nothing notable here.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between text-sm">
              <span className="font-medium">{CONCERN_LABELS[r.key]}</span>
              <span
                className={`font-bold tabular-nums ${r.delta > 0 ? "text-emerald-600" : "text-hot-deep"}`}
              >
                {r.delta > 0 ? "+" : ""}
                {Math.round(r.delta)} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
