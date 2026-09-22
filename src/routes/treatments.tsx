import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  matchTreatments,
  BUDGET_LABELS,
  DOWNTIME_LABELS,
  type BudgetTier,
  type Downtime,
} from "@/lib/treatments";
import { CONCERN_KEYS, CONCERN_LABELS, type ConcernKey } from "@/lib/concerns";
import { useScan } from "@/lib/scan-store";

const SearchSchema = z.object({
  priorities: z.array(z.enum(CONCERN_KEYS)).optional().default([]),
});

export const Route = createFileRoute("/treatments")({
  validateSearch: (s) => SearchSchema.parse(s),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const { priorities } = Route.useSearch();
  const { result } = useScan();
  const fallback: ConcernKey[] =
    priorities.length > 0
      ? priorities
      : result
        ? result.top_priorities
        : ["texture", "pores", "radiance"];

  const [selected, setSelected] = useState<ConcernKey[]>(fallback);
  const [budget, setBudget] = useState<BudgetTier | "any">("any");
  const [downtime, setDowntime] = useState<Downtime | "any">("any");
  const [noNeedles, setNoNeedles] = useState(false);

  const matches = useMemo(
    () => matchTreatments({ budget, downtime, noNeedles, priorities: selected }),
    [budget, downtime, noNeedles, selected],
  );

  function toggle(k: ConcernKey) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <p className="tm-eyebrow">treatment plan</p>
      <h1 className="tm-display mt-3 text-4xl">matched to your skin.</h1>
      <p className="mt-3 text-ink-soft">
        every suggestion below is tied to your scan. tune the filters and the
        list rebuilds around you.
      </p>

      <div className="tm-card mt-6 p-6">
        <p className="font-semibold">your focus concerns</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONCERN_KEYS.map((k) => (
            <button
              key={k}
              className="tm-chip"
              data-active={selected.includes(k)}
              onClick={() => toggle(k)}
            >
              {CONCERN_LABELS[k]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-ink-mute">budget</span>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as BudgetTier | "any")}
              className="tm-input mt-1.5"
            >
              {(Object.keys(BUDGET_LABELS) as (BudgetTier | "any")[]).map((b) => (
                <option key={b} value={b}>
                  {BUDGET_LABELS[b]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-mute">downtime</span>
            <select
              value={downtime}
              onChange={(e) => setDowntime(e.target.value as Downtime | "any")}
              className="tm-input mt-1.5"
            >
              {(Object.keys(DOWNTIME_LABELS) as (Downtime | "any")[]).map((d) => (
                <option key={d} value={d}>
                  {DOWNTIME_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={noNeedles}
            onChange={(e) => setNoNeedles(e.target.checked)}
            className="h-5 w-5 accent-[#ff2e88]"
          />
          <span className="font-medium">
            no needles. <span className="text-ink-mute">hide every injectable, no exceptions.</span>
          </span>
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {matches.length === 0 && (
          <div className="tm-card p-8 text-center">
            <p className="tm-display text-2xl">nothing matches those filters.</p>
            <p className="mt-2 text-ink-soft">
              loosen a filter or two and more options will appear.
            </p>
          </div>
        )}
        {matches.map((t) => (
          <article key={t.slug} className="tm-card tm-rise p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="tm-eyebrow">{t.category}</p>
                <h3 className="tm-display mt-1 text-2xl">{t.name}</h3>
              </div>
              <p className="text-lg font-bold">
                ${t.price_from}
                <span className="text-sm font-medium text-ink-mute"> to ${t.price_to}</span>
              </p>
            </div>
            <p className="mt-2 inline-flex items-center rounded-full bg-hot-soft px-3 py-1 text-xs font-semibold text-hot-deep">
              {t.why}
            </p>
            <p className="mt-3 text-ink-soft">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ink-mute">
              <span className="rounded-full bg-mist px-3 py-1.5">{t.downtime_label}</span>
              <span className="rounded-full bg-mist px-3 py-1.5">{t.sessions}</span>
              <span className="rounded-full bg-mist px-3 py-1.5">
                {t.needles ? "involves needles" : "needle free"}
              </span>
            </div>
            <a
              href={t.booking_url}
              target="_blank"
              rel="noreferrer"
              className="tm-btn-primary mt-5 w-full sm:w-auto"
            >
              book this treatment
            </a>
          </article>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-md text-center text-xs text-ink-mute">
        booking links go straight to the clinic. treatme does not take a cut and
        clinics cannot pay to appear higher.
      </p>
    </div>
  );
}
