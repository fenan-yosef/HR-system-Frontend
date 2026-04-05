import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.10),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.10),transparent_40%)]" />

      <section className="relative w-full max-w-2xl rounded-3xl border border-border/70 bg-card/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <AlertTriangle className="size-4" />
          Error 404
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          The page you are looking for does not exist, may have been moved, or
          the URL may be incorrect. Please return to a known section of the
          system.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
          >
            <Home className="size-4" />
            Go to Home
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Go to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
