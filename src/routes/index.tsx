import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const STEPS = [
  {
    n: "01",
    title: "scan",
    text: "three guided selfies, front and both sides. takes about a minute.",
  },
  {
    n: "02",
    title: "understand",
    text: "a clear report on 16 skin concerns, with your top 3 priorities spelled out.",
  },
  {
    n: "03",
    title: "plan",
    text: "treatment suggestions matched to your skin, your budget, and your comfort with needles.",
  },
  {
    n: "04",
    title: "book",
    text: "a direct link to book at a clinic that does exactly what you need.",
  },
];

export function HomePage() {
  return (
    <div>
      <section className="py-10 sm:py-16">
        <h1 className="tm-display max-w-2xl text-5xl sm:text-7xl">
          understand your skin from one selfie.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          treatme reads your skin like a med spa consultation would, then builds
          a treatment plan around you. no upsell, no confusion, just clarity.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/scan" className="tm-btn-hot">
            scan my skin
          </Link>
          <Link to="/treatments" className="tm-btn-ghost">
            browse treatments
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink-mute">
          free. 5 scans a day. sign in to start your first scan.
        </p>
      </section>

      <section className="py-8">
        <div className="divide-y divide-line border-y border-line">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 sm:grid-cols-[3rem_9rem_1fr] sm:items-baseline"
            >
              <p className="text-sm font-bold tabular-nums text-hot">{s.n}</p>
              <h3 className="tm-display text-2xl">{s.title}</h3>
              <p className="col-span-2 text-ink-soft sm:col-span-1">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="my-8 border-y border-line py-10">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="tm-display text-3xl sm:text-4xl">
              every consultation ends with someone selling you something. this
              one does not.
            </h2>
            <p className="mt-4 text-ink-soft">
              treatme never sells treatments, so the plan it builds is built
              around your budget and your goals first. clinics cannot pay to
              change your matches.
            </p>
          </div>
          <div>
            <ul className="divide-y divide-line">
              {[
                "16-point skin report in plain english",
                "face map showing exactly where each concern lives",
                "top 3 priorities, not a wall of data",
                "treatments matched to budget, downtime and needle comfort",
                "rescan tracking so you can see what is actually working",
              ].map((t) => (
                <li key={t} className="flex gap-3 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-hot" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-10 text-center">
        <h2 className="tm-display text-3xl sm:text-4xl">
          your skin, clearly understood.
        </h2>
        <div className="mt-6">
          <Link to="/scan" className="tm-btn-hot">
            start my free scan
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink-mute">
          cosmetic and educational. not a medical diagnosis.
        </p>
      </section>
    </div>
  );
}
