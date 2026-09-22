import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import {
  getUserFromRequest,
  isPremium,
  countScansToday,
  serviceClient,
  isDbConfigured,
} from "@/lib/supabase.server";
import {
  AnalysisResultSchema,
  CONCERN_KEYS,
  FREE_SCANS_PER_DAY,
  type AnalysisResult,
} from "@/lib/concerns";

/**
 * POST /api/analyze
 * multipart form-data: front, left, right (image files), ageRange, concerns (json), email.
 * auth: Authorization: Bearer <supabase access token>.
 *
 * never returns placeholder scores. when the analysis engine is unavailable
 * it returns 503 "analysis unavailable".
 */

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const MetaSchema = z.object({
  ageRange: z.string().max(20).optional().default(""),
  concerns: z.array(z.string()).max(16).optional().default([]),
  email: z.string().email().max(200),
});

const SYSTEM_PROMPT = `you are treatme's skin analysis engine, a medical aesthetics expert.
you look at face photos and return a structured cosmetic skin assessment. this is cosmetic and educational, never a medical diagnosis.

rules:
- write everything in lowercase. warm, clinical, plain english. no jargon, no scare tactics, no emojis, no em-dashes.
- score each of the 16 concerns from 0 to 100, where higher is better. for example pores 80 means small and tight, lines 80 means few visible lines, hydration 80 means well hydrated.
- "explanation" is one short plain sentence per concern, specific to what you see in the photos.
- "top_priorities" is the 1 to 3 concerns that would make the biggest visible difference if addressed. use exact concern keys.
- "summary" is 2 to 3 short sentences leading with the headline finding.
- "fitzpatrick": classify I to VI honestly from the photos when you can, otherwise omit it.
- "medical_flag": null almost always. a short lowercase phrase only if you see something a doctor should look at rather than an aesthetics provider, like an irregular mole or a lesion. never name a diagnosis.
- never use the word "poor". never estimate a skin age.
- analyze the front photo primarily. use the left and right photos for profile and symmetry context.

return strict json only. no prose, no markdown, no code fences. exact shape:
{
  "concerns": {
    "pores": { "score": 0-100, "explanation": "..." },
    "breakouts": { "score": 0-100, "explanation": "..." },
    "texture": { "score": 0-100, "explanation": "..." },
    "oiliness": { "score": 0-100, "explanation": "..." },
    "redness": { "score": 0-100, "explanation": "..." },
    "pigmentation": { "score": 0-100, "explanation": "..." },
    "uniformness": { "score": 0-100, "explanation": "..." },
    "radiance": { "score": 0-100, "explanation": "..." },
    "lines": { "score": 0-100, "explanation": "..." },
    "firmness": { "score": 0-100, "explanation": "..." },
    "volume_loss": { "score": 0-100, "explanation": "..." },
    "hydration": { "score": 0-100, "explanation": "..." },
    "dark_circles": { "score": 0-100, "explanation": "..." },
    "under_eye_puffiness": { "score": 0-100, "explanation": "..." },
    "tear_trough": { "score": 0-100, "explanation": "..." },
    "eyelid_heaviness": { "score": 0-100, "explanation": "..." }
  },
  "top_priorities": ["key", "key"],
  "summary": "...",
  "fitzpatrick": "III",
  "medical_flag": null
}`;

async function fileToImageBlock(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: file.type as "image/jpeg" | "image/png" | "image/webp",
      data: buf.toString("base64"),
    },
  };
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. engine availability. never fake a result.
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return Response.json(
            {
              error: "analysis unavailable",
              detail:
                "the skin analysis engine is not configured yet. please try again later.",
            },
            { status: 503 },
          );
        }

        // 2. auth.
        const user = await getUserFromRequest(request);
        if (!user) {
          return Response.json(
            { error: "sign in required" },
            { status: 401 },
          );
        }

        // 3. daily scan limit (free tier).
        const dbConfigured = isDbConfigured();
        if (dbConfigured && !(await isPremium(user.id))) {
          const used = await countScansToday(user.id);
          if (used >= FREE_SCANS_PER_DAY) {
            return Response.json(
              {
                error: "daily limit reached",
                detail: `you have used all ${FREE_SCANS_PER_DAY} free scans for today.`,
                scans_remaining: 0,
              },
              { status: 429 },
            );
          }
        }

        // 4. validate input.
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid form data" }, { status: 400 });
        }

        const photos: { angle: string; file: File }[] = [];
        for (const angle of ["front", "left", "right"]) {
          const file = form.get(angle);
          if (!(file instanceof File) || file.size === 0) {
            return Response.json(
              { error: `missing photo: ${angle}` },
              { status: 400 },
            );
          }
          if (!SUPPORTED_TYPES.has(file.type)) {
            return Response.json(
              { error: `unsupported image type for ${angle}. use jpeg, png or webp.` },
              { status: 400 },
            );
          }
          if (file.size > MAX_BYTES) {
            return Response.json(
              { error: `${angle} photo is too large. keep each photo under 5mb.` },
              { status: 400 },
            );
          }
          photos.push({ angle, file });
        }

        let concerns: string[] = [];
        try {
          concerns = JSON.parse((form.get("concerns") as string) || "[]");
        } catch {
          concerns = [];
        }
        const meta = MetaSchema.safeParse({
          ageRange: (form.get("ageRange") as string) || "",
          concerns,
          email: (form.get("email") as string) || "",
        });
        if (!meta.success) {
          return Response.json(
            { error: "a valid email is required to receive your report." },
            { status: 400 },
          );
        }

        // 5. call the vision model.
        let result: AnalysisResult;
        try {
          const anthropic = new Anthropic({ apiKey });
          const imageBlocks = await Promise.all(
            photos.map((p) => fileToImageBlock(p.file)),
          );
          const message = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
            max_tokens: 3000,
            system: SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: [
                  ...imageBlocks,
                  {
                    type: "text" as const,
                    text: `user context. age range: ${meta.data.ageRange || "not given"}. self-reported concerns: ${meta.data.concerns.join(", ") || "none"}. analyze the photos now.`,
                  },
                ],
              },
            ],
          });

          const textBlock = message.content.find((b) => b.type === "text");
          if (!textBlock || textBlock.type !== "text") {
            throw new Error("empty model response");
          }
          const parsed = JSON.parse(stripCodeFences(textBlock.text));
          const validated = AnalysisResultSchema.safeParse(parsed);
          if (!validated.success) {
            throw new Error("schema validation failed");
          }
          result = validated.data;
        } catch (err) {
          console.error("analysis failed:", err);
          return Response.json(
            {
              error: "analysis failed",
              detail: "the scan could not be completed. please try again.",
            },
            { status: 502 },
          );
        }

        // 6. persist the scan when the database is configured.
        let scanId: string | null = null;
        if (dbConfigured) {
          const db = serviceClient();
          const scores = Object.fromEntries(
            CONCERN_KEYS.map((k) => [k, result.concerns[k].score]),
          );
          const explanations = Object.fromEntries(
            CONCERN_KEYS.map((k) => [k, result.concerns[k].explanation]),
          );
          const { data, error } = await db!
            .from("scans")
            .insert({
              user_id: user.id,
              scores,
              explanations,
              top_priorities: result.top_priorities,
              summary: result.summary,
              fitzpatrick: result.fitzpatrick ?? null,
              email: meta.data.email,
              photo_count: photos.length,
            })
            .select("id")
            .single();
          if (error) {
            console.error("scan save failed:", error);
          } else {
            scanId = data.id;
          }
        }

        return Response.json({ scan_id: scanId, result });
      },
    },
  },
});
