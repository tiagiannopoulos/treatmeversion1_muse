import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tsConfigPaths(),
    tanstackStart({ customViteReactPlugin: true }),
    viteReact(),
    tailwindcss(),
  ];

  // package the ssr server for vercel (serverless functions) on deploy builds.
  // plain `npm run build` stays a vite build; `npm run build:vercel` (or
  // NITRO_PRESET=vercel) produces the vercel output directory instead.
  if (command === "build" && process.env.NITRO_PRESET === "vercel") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "vercel" }));
  }

  return {
    server: { port: 3000 },
    plugins,
  };
});
