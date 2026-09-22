# Face-map overlay vocabulary (from Tia's PDF spec, 2026-09-22)

Source PDF: `~/workspace/user/files/Design_skin_analysis_paramater_photos.pdf`
Reference crops: `~/workspace/treatme-app/preview/spec-ref/` (row3.png covers the bottom row).

Each parameter is drawn on the user's real captured photo, positioned by
MediaPipe FaceLandmarker anchors (fallback: fractional face-box coords).
All markings are thin and precise. Lower score = more prominent markings.
Do not render a concern's markings when its score is >= 90.

Intensity: `i = clamp((90 - score) / 40, 0, 1)`.
Placement must be deterministic (seeded PRNG per concern key, e.g. mulberry32
over the key string) so overlays are stable across renders.

## The 18 styles

1. **redness** — soft diffuse pink blotches (#f2a3b8, opacity ~0.35–0.55 scaled
   by intensity). Zones: both cheeks, nose, chin, forehead. Use radial-gradient
   soft ellipses.
2. **pigmentation** — small brown dots (#b07a2a, r 1–3px). Scattered across the
   whole face, ~40 * i dots.
3. **pores** — dense gold dots (#d99a1f, r 1–2px). Concentrated on nose +
   T-zone (forehead center, nose, chin), ~120 * i dots.
4. **breakouts** — sparse teal dots (#3aa88f, r 2–3px) each with a small plus
   mark inside. ~12 * i dots on cheeks/chin.
5. **texture** — short brown scribble strokes (#a06a2a, 1.5px, length 6–14px,
   random angle). Scattered, ~50 * i strokes.
6. **unevenness** — soft beige/tan patches (#e8c98a, opacity ~0.3). Forehead,
   cheeks, chin. Radial-gradient ellipses.
7. **hydration** — teal speckle wash (#4db8a5, tiny dots, low opacity ~0.25).
   Dry zones (spec shows forehead); apply to forehead + cheeks.
8. **lines** — thin gold horizontal lines (#d99a1f, 1.5px) across forehead
   (3 lines, length scaled by intensity) + short crow's-feet strokes at outer
   eye corners.
9. **dark_circles** — pink/magenta crescents (#e84393, 2px stroke, no fill)
   under each eye, following the under-eye curve.
10. **under_eye_puffiness** — gold/yellow crescents (#e8b62a, 2px stroke)
    under each eye, slightly wider arc than dark circles.
11. **tear_trough** — deeper pink curved crescents (#e84393, 2px) from inner
    eye corner down toward cheek.
12. **eyelid_heaviness** — teal curved lines (#3aa88f, 2px) along each upper
    eyelid crease.
13. **firmness** — teal contour polylines (#3aa88f, 2px): one solid + one
    dashed line along each jawline, with small arrow ticks pointing up.
14. **volume_loss** — teal dashed circles (#3aa88f, 1.5px dashed) on each
    cheek (+ temples), with small arrows pointing inward.
15. **oiliness** — gold dots (#d99a1f, r 1–2px) across T-zone, ~60 * i dots
    (sparser than pores).
16. **radiance** — gold/beige soft patches (#e3c078, opacity ~0.3) on dull
    areas: forehead, cheeks.
17. **symmetry** — pink circles (#e84393, 1.5px) on cheeks + vertical dashed
    center line + 2 horizontal dashed guides. Diagnostic only; no concern maps
    to it — include the style, don't wire a chip.
18. **fine_lines** — short gold lines (#d99a1f) on forehead + eye corners.
    Fold into the `lines` concern (draw both).

## App concern → style mapping (16 concerns)

pores→pores · breakouts→breakouts · texture→texture · oiliness→oiliness ·
redness→redness · pigmentation→pigmentation · uniformness→unevenness ·
radiance→radiance · lines→lines+fine_lines · firmness→firmness ·
volume_loss→volume_loss · hydration→hydration · dark_circles→dark_circles ·
under_eye_puffiness→under_eye_puffiness · tear_trough→tear_trough ·
eyelid_heaviness→eyelid_heaviness · (symmetry: style only, no chip)

## FaceLandmarker anchor indices (478-landmark model)

forehead center 10 · nose tip 1 · chin 152 · left eye outer 33 · left eye
inner 133 · right eye inner 362 · right eye outer 263 · left cheek 234 ·
right cheek 454 · mouth left 61 · mouth right 291 · left temple 127 ·
right temple 356 · jaw left 172 · jaw right 397.
Eye centers: average of the eye ring landmarks. Under-eye curve: use the
lower eyelid landmarks (e.g. left eye lower lid ~145, 144, 153 region — derive
a curve through the lower lid points).
