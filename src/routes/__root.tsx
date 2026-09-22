import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ScanProvider } from "@/lib/scan-store";
import { TopBar, BottomNav } from "@/components/TopBar";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "treatme. understand your skin from one selfie." },
      {
        name: "description",
        content:
          "treatme. scan your skin, get a clear report, and a treatment plan built around you.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="tm-lower">
        <ScanProvider>
          <TopBar />
          <main className="mx-auto w-full max-w-5xl px-5 pb-28 pt-6 sm:pb-16">
            <Outlet />
          </main>
          <BottomNav />
        </ScanProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center">
      <div className="max-w-sm">
        <p className="tm-eyebrow">404</p>
        <h1 className="tm-display mt-3 text-4xl">page not found.</h1>
        <p className="mt-3 text-ink-mute">that route does not exist.</p>
        <div className="mt-6">
          <Link to="/" className="tm-btn-primary">
            go home
          </Link>
        </div>
      </div>
    </div>
  );
}
