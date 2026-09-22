# treatme. product decisions (v1, fresh repo)

locked 2026-09-22. this file is the source of truth when chat history disagrees.

## what it is
- treatme: scan your face, get an understandable skin report, get a treatment plan. consumer first. (2026-09-22: the "yuka for your face" line was removed from all in-app copy.)
- explicitly cosmetic and educational. never a medical diagnosis. the report says "an estimate, not a diagnosis."
- the consultation is the product. treatme never sells treatments, so the plan is built around the user's budget and goals first. clinics cannot pay to change matches. that trust is the moat.

## v1 scope
1. home/landing: clinical-minimal positioning, one scan cta.
2. scan: guided selfie capture, front/left/right, face positioning guidance, lighting check, consent checkbox.
3. analyzing: progress state. age range + concerns collected via tap cards during the wait. email captured as the condition for report delivery.
4. skin report: 0-100 scores per concern, higher = better. bands: great (90-100), good (80-89), average (50-79), "focus here" (below 50). the word "poor" is never used. no skin age metric. 16 concerns in 4 groups:
   - texture and clarity: pores, breakouts, texture, oiliness
   - tone and pigment: redness, pigmentation, uniformness, radiance
   - aging and structure: lines, firmness, volume loss, hydration
   - eye area: dark circles, under-eye puffiness, tear trough, eyelid heaviness
   - face map overlay on the user's photo, plain-english explanations, top 3 priorities.
5. treatment recommendations: matched to scan + budget + downtime + needle comfort. "no needles" is a hard filter, never a soft preference. each recommendation explains why it fits. external booking links only (concierge model, no checkout, no payments in v1).
6. history: saved scans, 30-day rescan nudge, comparison of latest vs previous scan.
7. auth: supabase. 5 free scans per day per user, enforced server side. premium flag = unlimited (no payments wired yet).

## analysis engine
- POST /api/analyze accepts the 3 photos and calls claude vision (ANTHROPIC_API_KEY from env) with a structured prompt. response validated with zod.
- if the key is missing: 503 "analysis unavailable". never silent placeholder scores presented as real.
- if the model response fails validation: 502, ask the user to retry.
- fitzpatrick classification is included when the model can do it honestly. medical_flag surfaces only when something looks doctor-worthy, never a diagnosis.

## brand (locked)
- clinical luxe. black (#0b0b0c), white (#ffffff), hot pink (#ff2e88).
- all lowercase copy everywhere, including the model prompt. no em-dashes, use commas and colons.
- premium, clinical, feminine, editorial. clean, image-first, low clutter.

## tech
- tanstack start (react) + typescript + tailwind v4. nitro build, vercel preset for deploy.
- supabase for auth and db (profiles, scans). env placeholders only, no real keys in the repo.
- structured for a later capacitor wrap for ios: all native needs (camera, haptics) go through small adapters, none in v1.
- supersedes the lovable-era direction (blush/nude palette, alata) for this repo. the sept 2026 clinical luxe call wins.

## deferred to v2
- ai consultant chat, 1-3 year phased plans, provider b2b widget, pdf reports, payments/subscriptions.
