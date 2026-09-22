import type { ConcernKey } from "@/lib/concerns";

/**
 * approximate face map overlay. zones are positioned as fractions of the
 * photo so they work on any selfie. colour deepens where scores are lower.
 */

interface Zone {
  key: string;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  concerns: ConcernKey[];
}

const ZONES: Zone[] = [
  { key: "forehead", label: "forehead", cx: 0.5, cy: 0.27, rx: 0.27, ry: 0.11, concerns: ["lines", "texture", "oiliness"] },
  { key: "left_cheek", label: "left cheek", cx: 0.29, cy: 0.52, rx: 0.13, ry: 0.12, concerns: ["pores", "redness", "pigmentation", "breakouts"] },
  { key: "right_cheek", label: "right cheek", cx: 0.71, cy: 0.52, rx: 0.13, ry: 0.12, concerns: ["pores", "redness", "pigmentation", "breakouts"] },
  { key: "nose", label: "nose", cx: 0.5, cy: 0.52, rx: 0.09, ry: 0.12, concerns: ["pores", "oiliness", "redness"] },
  { key: "under_eyes", label: "under eyes", cx: 0.5, cy: 0.43, rx: 0.3, ry: 0.055, concerns: ["dark_circles", "under_eye_puffiness", "tear_trough"] },
  { key: "chin", label: "chin", cx: 0.5, cy: 0.79, rx: 0.14, ry: 0.1, concerns: ["breakouts", "texture"] },
];

export function FaceMap({
  photo,
  scores,
  showLabels = true,
}: {
  photo: string;
  scores: Partial<Record<ConcernKey, number>>;
  showLabels?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="your scan photo" className="block aspect-[3/4] w-full object-cover" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {ZONES.map((z) => {
          const vals = z.concerns
            .map((c) => scores[c])
            .filter((v): v is number => typeof v === "number");
          const worst = vals.length ? Math.min(...vals) : 100;
          const opacity = worst >= 90 ? 0 : worst >= 80 ? 0.12 : worst >= 50 ? 0.28 : 0.45;
          if (opacity === 0) return null;
          return (
            <ellipse
              key={z.key}
              cx={z.cx * 100}
              cy={z.cy * 100}
              rx={z.rx * 100}
              ry={z.ry * 100}
              fill="#ff2e88"
              opacity={opacity}
            />
          );
        })}
      </svg>
      {showLabels && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          {ZONES.map((z) => {
            const vals = z.concerns
              .map((c) => scores[c])
              .filter((v): v is number => typeof v === "number");
            const worst = vals.length ? Math.min(...vals) : 100;
            if (worst >= 80) return null;
            return (
              <span
                key={z.key}
                className="rounded-full bg-ink/70 px-2.5 py-1 text-[0.7rem] font-semibold lowercase text-white backdrop-blur"
              >
                {z.label} · {worst}
              </span>
            );
          })}
        </div>
      )}
      <p className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.7rem] lowercase text-white backdrop-blur">
        pink = focus areas
      </p>
    </div>
  );
}
