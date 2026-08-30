import type { ReactNode } from "react";

export function Chrome({ children, headerAction }: { children: ReactNode; headerAction?: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory font-body text-ink selection:bg-challenge/20">
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-7">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-ink font-display text-[15px] text-ivory">
              A
            </span>
            <span className="font-display text-[17px] tracking-tight">MirrorMind</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-ink sm:block">
              Guided reflection
            </span>
            {headerAction}
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-auto flex flex-col gap-2 border-t border-line/70 py-7 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-ink">
            MirrorMind is designed for self-reflection and personal growth, not medical or
            mental-health diagnosis or treatment.
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted-ink/70">
            A quiet desk at night
          </span>
        </footer>
      </div>
    </div>
  );
}

export function toneText(tone: string) {
  if (tone === "challenge") return "text-challenge";
  if (tone === "positive") return "text-positive";
  return "text-uncertain";
}

export function toneBg(tone: string) {
  if (tone === "challenge") return "bg-challenge";
  if (tone === "positive") return "bg-positive";
  return "bg-uncertain";
}

export function toneTape(tone: string) {
  if (tone === "challenge") return "bg-challenge/40";
  if (tone === "positive") return "bg-positive/40";
  return "bg-uncertain/40";
}

export function toneLabel(tone: string) {
  if (tone === "challenge") return "Challenging";
  if (tone === "positive") return "Positive";
  return "Uncertain";
}
