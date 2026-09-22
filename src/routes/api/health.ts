import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          ok: true,
          analysis_configured: Boolean(process.env.ANTHROPIC_API_KEY),
          db_configured: Boolean(
            process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
          ),
        });
      },
    },
  },
});
