import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useScan, type PhotoAngle } from "@/lib/scan-store";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
});

const ANGLES: { key: PhotoAngle; title: string; hint: string; tip: string }[] = [
  {
    key: "front",
    title: "front",
    hint: "face the camera straight on. keep a neutral expression, hair away from your face.",
    tip: "chin level, eyes on the lens.",
  },
  {
    key: "left",
    title: "left side",
    hint: "turn your head to show your left cheek and jawline to the camera.",
    tip: "shoulders still, turn only your head.",
  },
  {
    key: "right",
    title: "right side",
    hint: "turn your head to show your right cheek and jawline to the camera.",
    tip: "shoulders still, turn only your head.",
  },
];

function downscale(dataUrl: string, maxDim = 1400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale === 1) return resolve(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ScanPage() {
  const navigate = useNavigate();
  const { photos, setPhoto, consent, setConsent } = useScan();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const angle = ANGLES[step];
  const done = ANGLES.every((a) => photos[a.key]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("that file is not a photo. please choose an image.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("that photo is too large. try one under 12mb.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const small = await downscale(reader.result as string);
      setPhoto(angle.key, small);
      if (step < ANGLES.length - 1) setStep(step + 1);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <p className="tm-eyebrow">skin scan</p>
      <h1 className="tm-display mt-3 text-4xl">three quick photos.</h1>

      <div className="tm-card mt-6 bg-mist p-5">
        <p className="font-semibold">for the best read:</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
          <li>face a window or bright light. no flash.</li>
          <li>no makeup if you can, or as little as possible.</li>
          <li>hold the phone at eye level, about an arm away.</li>
        </ul>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#ff1f87]"
        />
        <span className="text-sm text-ink-soft">
          i consent to treatme analyzing my photos for a cosmetic skin report.
          photos are used only for my report. never sold, never shared.
        </span>
      </label>

      <div className="mt-6 flex gap-2">
        {ANGLES.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setStep(i)}
            className={`tm-chip flex-1 ${i === step ? "!border-hot !bg-hot-soft" : ""}`}
            data-active={Boolean(photos[a.key])}
          >
            {i + 1}. {a.title}
            {photos[a.key] && <span className="ml-1">✓</span>}
          </button>
        ))}
      </div>

      <div className="tm-card mt-4 overflow-hidden">
        <div className="relative bg-ink">
          {photos[angle.key] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photos[angle.key]!}
              alt={`${angle.title} preview`}
              className="mx-auto block max-h-96 object-contain"
            />
          ) : (
            <div className="flex aspect-[3/4] max-h-96 w-full items-center justify-center">
              <div className="flex h-64 w-48 items-center justify-center rounded-[50%] border-2 border-dashed border-cream/40">
                <p className="px-6 text-center text-sm text-cream/60">
                  line your face up here
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="tm-display text-2xl">
            {step + 1} of 3. {angle.title}.
          </h3>
          <p className="mt-1 text-ink-soft">{angle.hint}</p>
          <p className="mt-1 text-sm font-medium text-ink-mute">{angle.tip}</p>
          {error && <p className="mt-2 text-sm font-medium text-hot-deep">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button className="tm-btn-hot flex-1" onClick={() => fileRef.current?.click()}>
              {photos[angle.key] ? "retake photo" : "take photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={onFile}
            />
          </div>
        </div>
      </div>

      <button
        disabled={!done || !consent}
        onClick={() => navigate({ to: "/analyzing" })}
        className="tm-btn-hot mt-6 w-full"
      >
        {!consent ? "tick consent to continue" : done ? "analyze my skin" : `take ${3 - Object.values(photos).filter(Boolean).length} more photo${Object.values(photos).filter(Boolean).length === 2 ? "" : "s"}`}
      </button>
    </div>
  );
}
