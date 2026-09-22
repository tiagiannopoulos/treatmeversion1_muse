import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScan } from "@/lib/scan-store";
import {
  CONCERN_GROUPS,
  CONCERN_LABELS,
  bandFor,
  type AnalysisResult,
  type ConcernKey,
} from "@/lib/concerns";
import { ScoreBar } from "@/components/ScoreBar";
import { FaceMap } from "@/components/FaceMap";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/report/$scanId")({
  component: ReportPage,
});

interface LoadedReport {
  result: AnalysisResult;
  frontPhoto: string | null;
  createdAt: string | null;
}

function ReportPage() {
  const { scanId } = Route.useParams();
  const navigate = useNavigate();
  const { result: liveResult, photos } = useScan();
  const [loaded, setLoaded] = useState<LoadedReport | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (scanId === "latest") {
        if (liveResult) {
          setLoaded({ result: liveResult, frontPhoto: photos.front, createdAt: null });
        } else {
          setMissing(true);
        }
        return;
      }
      const sb = getSupabase();
      if (!sb) {
        setMissing(true);
        return;
      }
      const { data, error } = await sb.from("scans").select("*").eq("id", scanId).maybeSingle();
      if (cancelled || error || !data) {
        setMissing(true);
        return;
      }
      const concerns = Object.fromEntries(
        Object.entries(data.scores as Record<string, number>).map(([k, score]) => [
          k,
          { score, explanation: (data.explanations as Record<string, string>)[k] ?? "" },
        ]),
      );
      setLoaded({
        result: {
          concerns: concerns as AnalysisResult["concerns"],
          top_priorities: data.top_priorities as ConcernKey[],
          summary: data.summary as string,
          fitzpatrick: data.fitzpatrick ?? undefined,
        },
        frontPhoto: null,
        createdAt: data.created_at as string,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [scanId, liveResult, photos.front]);

  if (missing) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="tm-display text-4xl">no report here.</h1>
        <p className="mt-3 text-ink-soft">
          this report is not available. run a fresh scan to get one.
        </p>
        <Link to="/scan" className="tm-btn-hot mt-6">
          start a scan
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="tm-pulse mx-auto h-12 w-12 rounded-full bg-hot" />
        <p className="mt-4 text-ink-soft">loading your report...</p>
      </div>
    );
  }

  const { result } = loaded;
  const scores = Object.fromEntries(
    Object.entries(result.concerns).map(([k, v]) => [k, v.score]),
  ) as Record<ConcernKey, number>;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <p className="tm-eyebrow">your skin report</p>
      <h1 className="tm-display mt-3 text-4xl">here is what we see.</h1>
      {loaded.createdAt && (
        <p className="mt-2 text-sm text-ink-mute">
          scanned {new Date(loaded.createdAt).toLocaleDateString()}
        </p>
      )}

      <div className="tm-card mt-6 p-6">
        <p className="tm-eyebrow">summary</p>
        <p className="mt-2 text-lg leading-relaxed">{result.summary}</p>
        {result.fitzpatrick && (
          <p className="mt-3 text-sm text-ink-mute">
            fitzpatrick type {result.fitzpatrick}
          </p>
        )}
      </div>

      {loaded.frontPhoto && (
        <div className="mt-6">
          <FaceMap photo={loaded.frontPhoto} scores={scores} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="tm-display text-3xl">your top 3 priorities</h2>
        <div className="mt-4 grid gap-3">
          {result.top_priorities.map((key, i) => {
            const c = result.concerns[key];
            return (
              <div key={key} className="tm-card tm-rise p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold">
                    <span className="mr-2 text-hot">{i + 1}.</span>
                    {CONCERN_LABELS[key]}
                  </p>
                  <span className="text-sm font-semibold text-hot-deep">
                    {bandFor(c.score)} · {c.score}
                  </span>
                </div>
                <p className="mt-1.5 text-ink-soft">{c.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="tm-display text-3xl">the full picture</h2>
        {CONCERN_GROUPS.map((g) => (
          <div key={g.key} className="tm-card mt-4 p-6">
            <h3 className="tm-display text-xl">{g.label}</h3>
            <div className="divide-y divide-line">
              {g.concerns.map((c) => {
                const key = c.key as ConcernKey;
                const v = result.concerns[key];
                return (
                  <ScoreBar
                    key={key}
                    score={v.score}
                    label={c.label}
                    blurb={v.explanation}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {result.medical_flag && (
        <div className="tm-card mt-6 border-amber-300 bg-amber-50 p-5">
          <p className="font-semibold">worth a doctor's look:</p>
          <p className="mt-1 text-sm text-ink-soft">{result.medical_flag}</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          className="tm-btn-hot w-full sm:w-auto"
          onClick={() =>
            navigate({
              to: "/treatments",
              search: { priorities: result.top_priorities },
            })
          }
        >
          see treatments for my priorities
        </button>
        <p className="mx-auto mt-4 max-w-md text-xs text-ink-mute">
          cosmetic and educational only. this is an estimate from photos, not a
          diagnosis. when in doubt, see a professional in person.
        </p>
      </div>
    </div>
  );
}
