import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Chrome, toneBg, toneLabel, toneTape, toneText } from "@/components/Chrome";
import {
  AFFIRM_RESPONSES,
  EXAMPLE_JOURNAL,
  SOMETHING_ELSE,
  analyzeJournal,
  type Theme,
} from "@/lib/reflection";
import {
  formatDate,
  loadReflections,
  saveReflection,
  type SavedReflection,
} from "@/lib/saved";


const TITLE = "MirrorMind — Understand your day";
const DESCRIPTION =
  "Write freely about your day and get a reflection map of what stood out, one guided insight, and one small next step.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

type Stage = "welcome" | "journal" | "loading" | "map" | "explore" | "summary" | "reflections";
type ExploreStep = "question" | "mirror" | "insight";

const STORAGE_KEY = "ajc.journal";

function Index() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [journal, setJournal] = useState("");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [step, setStep] = useState<ExploreStep>("question");
  const [answer, setAnswer] = useState("");
  const [affirm, setAffirm] = useState<"yes" | "maybe" | "no" | null>(null);
  const [closingChoice, setClosingChoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReflection[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [returnStage, setReturnStage] = useState<Stage>("welcome");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setJournal(saved);
    } catch {
      /* storage unavailable — the session simply starts empty */
    }
    setSaved(loadReflections());
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function persist(text: string) {
    setJournal(text);
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* ignore */
    }
  }

  function reflect() {
    if (journal.trim().length < 12) {
      setError("Write a little more about your day and we'll take it from there.");
      return;
    }
    setError(null);
    setStage("loading");
    timer.current = setTimeout(() => {
      const found = analyzeJournal(journal);
      setThemes(found.length ? found : [SOMETHING_ELSE]);
      setStage("map");
    }, 1400);
  }

  function openTheme(next: Theme) {
    setTheme(next);
    setStep("question");
    setAnswer("");
    setAffirm(null);
    setClosingChoice(null);
    setStage("explore");
  }

  function backToMap() {
    setStage("map");
    setTheme(null);
    setJustSaved(false);
  }

  function openReflections() {
    setReturnStage(stage === "reflections" ? returnStage : stage);
    setSaved(loadReflections());
    setStage("reflections");
  }

  function saveCurrent() {
    if (!theme) return;
    setSaved(
      saveReflection({
        journal,
        themes: themes.map((t) => ({ title: t.title, subtitle: t.subtitle })),
        selectedTheme: theme.title,
        conversation: {
          question: theme.question,
          answer,
          mirror: theme.mirror,
          affirm,
        },
        insight: theme.insight,
        action: theme.action,
      }),
    );
    setJustSaved(true);
  }

  function startOver() {
    setStage("journal");
    setThemes([]);
    setTheme(null);
    setStep("question");
    setAnswer("");
    setAffirm(null);
    setClosingChoice(null);
    setJustSaved(false);
    persist("");
  }

  return (
    <Chrome
      headerAction={
        <button
          onClick={openReflections}
          className="text-[10px] uppercase tracking-[0.22em] text-muted-ink underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          My reflections
        </button>
      }
    >
      {stage === "welcome" && (
        <Welcome onStart={() => setStage("journal")} />
      )}

      {stage === "journal" && (
        <Journal
          value={journal}
          error={error}
          onChange={persist}
          onExample={() => {
            setError(null);
            persist(EXAMPLE_JOURNAL);
          }}
          onSubmit={reflect}
        />
      )}

      {stage === "loading" && <Loading />}

      {stage === "map" && (
        <ReflectionMap
          themes={themes}
          onPick={openTheme}
          onSomethingElse={() => openTheme(SOMETHING_ELSE)}
          onEdit={() => setStage("journal")}
        />
      )}

      {stage === "explore" && theme && (
        <Explore
          theme={theme}
          step={step}
          answer={answer}
          affirm={affirm}
          closingChoice={closingChoice}
          onAnswer={setAnswer}
          onSubmitAnswer={() => {
            if (!answer.trim()) return;
            setStep("mirror");
          }}
          onAffirm={(value) => {
            setAffirm(value);
            setStep("insight");
          }}
          onClosing={setClosingChoice}
          onBack={backToMap}
          onNew={startOver}
          onFinish={() => setStage("summary")}
        />
      )}

      {stage === "summary" && theme && (
        <Summary
          themes={themes}
          theme={theme}
          saved={justSaved}
          onSave={saveCurrent}
          onBack={backToMap}
          onNew={startOver}
          onReflections={openReflections}
        />
      )}

      {stage === "reflections" && (
        <Reflections
          items={saved}
          onBack={() => setStage(returnStage === "reflections" ? "welcome" : returnStage)}
        />
      )}
    </Chrome>
  );
}

/* ---------------------------------- 01 ---------------------------------- */

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-muted-ink">
            Journal · Understand · Explore · Act
          </p>
          <h1 className="jz jz-1 mt-6 max-w-[20ch] text-balance font-display text-6xl leading-[0.92] tracking-[-0.02em] sm:text-7xl">
            Understand your day.
          </h1>
          <p className="jz jz-2 mt-7 max-w-[42ch] text-pretty text-base text-muted-ink sm:text-lg">
            Write freely. We'll help you make sense of what happened.
          </p>
          <div className="jz jz-3 mt-9 flex flex-wrap items-center gap-5">
            <button
              onClick={onStart}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start today's reflection
            </button>
            <span className="max-w-[26ch] text-xs text-muted-ink">
              A private space to reflect, understand, and take your next step.
            </span>
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="absolute -top-3 left-6 h-24 w-4 rounded-[2px] bg-uncertain/50 shadow-sm" />
          <div className="absolute -bottom-4 right-8 h-20 w-4 rounded-[2px] bg-positive/45 shadow-sm" />
          <div className="jz jz-2 relative rotate-[-1.5deg] rounded-[16px] bg-card p-6 shadow-card ring-1 ring-ink/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">Today</span>
              <span className="text-[10px] text-muted-ink">6:40 pm</span>
            </div>
            <p className="mt-4 font-display text-lg italic leading-snug text-ink/90">
              “The day felt heavy in small ways — a presentation, a quiet friend, an assignment I
              keep postponing…”
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-challenge/10 px-2.5 py-1 text-[11px] font-medium text-challenge">
                Presentation
              </span>
              <span className="rounded-full bg-uncertain/10 px-2.5 py-1 text-[11px] font-medium text-uncertain">
                Friendship
              </span>
              <span className="rounded-full bg-positive/10 px-2.5 py-1 text-[11px] font-medium text-positive">
                Workout
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- 02 ---------------------------------- */

function Journal({
  value,
  error,
  onChange,
  onExample,
  onSubmit,
}: {
  value: string;
  error: string | null;
  onChange: (v: string) => void;
  onExample: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-challenge">
            02 · Journal
          </p>
          <h2 className="jz jz-1 mt-5 max-w-[16ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
            How was your day?
          </h2>
          <p className="jz jz-2 mt-5 max-w-[34ch] text-pretty text-sm text-muted-ink">
            Write about whatever is on your mind — the good, the difficult, the confusing, or
            anything that stayed with you today.
          </p>
          <div className="jz jz-3 mt-8 space-y-2.5 border-t border-line/70 pt-6 text-xs text-muted-ink">
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-challenge" /> Private &amp; on this device
            </p>
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-uncertain" /> No scores, no questionnaires
            </p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="jz jz-2 relative">
            <div className="absolute -top-2.5 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-positive/40 shadow-sm" />
            <div className="rounded-[20px] bg-card p-6 shadow-paper ring-1 ring-ink/5 sm:p-8">
              <textarea
                rows={9}
                autoFocus
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Today was…"
                className="w-full resize-none bg-transparent text-base leading-[1.7] text-ink placeholder:text-muted-ink/60 focus:outline-none"
              />
              {error && <p className="mt-3 text-xs text-challenge">{error}</p>}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line/70 pt-5">
                <button
                  onClick={onSubmit}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Reflect on my day
                </button>
                <button
                  onClick={onExample}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-ink ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Try an example
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <section className="flex min-h-[52vh] flex-col items-center justify-center py-20 text-center">
      <div className="jz jz-1 flex gap-1.5">
        <span className="size-2 animate-pulse rounded-full bg-challenge" />
        <span className="size-2 animate-pulse rounded-full bg-uncertain [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-positive [animation-delay:300ms]" />
      </div>
      <p className="jz jz-2 mt-6 font-display text-2xl italic text-ink/80">
        Reading your reflection…
      </p>
    </section>
  );
}

/* ---------------------------------- 03 ---------------------------------- */

function ReflectionMap({
  themes,
  onPick,
  onSomethingElse,
  onEdit,
}: {
  themes: Theme[];
  onPick: (t: Theme) => void;
  onSomethingElse: () => void;
  onEdit: () => void;
}) {
  const tilts = ["rotate-[-4deg]", "rotate-[3deg]", "rotate-[-2deg]", "rotate-[4deg]"];

  return (
    <section className="py-14 sm:py-20">
      <div className="flex flex-col gap-2">
        <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-challenge">
          03 · Reflection map
        </p>
        <h2 className="jz jz-1 mt-3 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
          A few things stood out today
        </h2>
        <p className="jz jz-2 mt-4 max-w-[46ch] text-pretty text-sm text-muted-ink">
          We read your whole entry before asking a single question. These are the threads we noticed
          — pick the one that matters most right now.
        </p>
      </div>

      <div className="jz jz-2 mt-10 grid gap-5 sm:grid-cols-2">
        {themes.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="group relative rounded-[18px] bg-card p-5 text-left shadow-card ring-1 ring-ink/5 transition-transform duration-300 hover:-translate-y-1"
          >
            <span
              className={`absolute left-5 top-0 h-4 w-12 -translate-y-1/2 rounded-[2px] shadow-sm ${tilts[i % 4]} ${toneTape(t.tone)}`}
            />
            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-[10px] uppercase tracking-[0.18em] ${toneText(t.tone)}`}
              >
                {toneLabel(t.tone)}
              </span>
              <span className={`size-2 rounded-full ${toneBg(t.tone)}`} />
            </div>
            <h3 className="mt-3 font-display text-2xl tracking-tight">{t.title}</h3>
            <p className="mt-1.5 text-sm text-muted-ink">{t.subtitle}</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Explore this →
            </p>
          </button>
        ))}
      </div>

      <div className="jz jz-3 mt-8 flex flex-col gap-4">
        <p className="font-display text-2xl italic">What would you like to explore?</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onSomethingElse}
            className="rounded-full border border-dashed border-line px-5 py-2.5 text-sm font-medium text-muted-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Something else…
          </button>
          <button
            onClick={onEdit}
            className="text-xs text-muted-ink underline decoration-line underline-offset-4 hover:text-ink"
          >
            Edit today's entry
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- 04 / 05 / 06 --------------------------- */

function Explore({
  theme,
  step,
  answer,
  affirm,
  closingChoice,
  onAnswer,
  onSubmitAnswer,
  onAffirm,
  onClosing,
  onBack,
  onNew,
  onFinish,
}: {
  theme: Theme;
  step: ExploreStep;
  answer: string;
  affirm: "yes" | "maybe" | "no" | null;
  closingChoice: string | null;
  onAnswer: (v: string) => void;
  onSubmitAnswer: () => void;
  onAffirm: (v: "yes" | "maybe" | "no") => void;
  onClosing: (v: string) => void;
  onBack: () => void;
  onNew: () => void;
  onFinish: () => void;
}) {
  return (
    <section className="py-14 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] ring-1 ring-line ${toneText(theme.tone)}`}
        >
          <span className={`size-1.5 rounded-full ${toneBg(theme.tone)}`} />
          Exploring · {theme.title}
        </span>
        <button
          onClick={onBack}
          className="text-xs text-muted-ink underline decoration-line underline-offset-4 hover:text-ink"
        >
          ← Back to reflection map
        </button>
      </div>

      <h2 className="jz jz-1 mt-8 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
        Let's explore this a little further.
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="jz jz-2 relative rounded-[20px] bg-card p-6 shadow-paper ring-1 ring-ink/5 sm:p-8">
            <div
              className={`absolute -top-2.5 left-8 h-5 w-14 rotate-[-3deg] rounded-[2px] shadow-sm ${toneTape(theme.tone)}`}
            />
            <p className="pt-1 font-display text-[19px] leading-relaxed text-ink">
              {theme.question}
            </p>

            {step === "question" ? (
              <div className="mt-6">
                <textarea
                  rows={4}
                  autoFocus
                  value={answer}
                  onChange={(e) => onAnswer(e.target.value)}
                  placeholder="Take your time…"
                  className="w-full resize-none border-t border-line/70 bg-transparent pt-5 text-base leading-[1.7] text-ink placeholder:text-muted-ink/60 focus:outline-none"
                />
                <button
                  onClick={onSubmitAnswer}
                  disabled={!answer.trim()}
                  className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-5 border-t border-line/70 pt-5">
                <div className="rounded-[14px] bg-paper px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">You</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{answer}</p>
                </div>
                <p className="font-display text-[19px] leading-relaxed text-ink">{theme.mirror}</p>

                {step === "mirror" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onAffirm("yes")}
                      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ivory transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Yes, that feels right
                    </button>
                    <button
                      onClick={() => onAffirm("maybe")}
                      className="rounded-full px-4 py-2 text-sm text-muted-ink ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => onAffirm("no")}
                      className="rounded-full px-4 py-2 text-sm text-muted-ink ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Not really
                    </button>
                  </div>
                ) : (
                  <p className="text-sm italic leading-relaxed text-muted-ink">
                    {affirm ? AFFIRM_RESPONSES[affirm] : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          {step === "insight" ? (
            <div className="space-y-6">
              <div className="jz jz-1 relative rounded-[18px] bg-paper p-6 ring-1 ring-ink/5">
                <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[-3deg] rounded-[2px] bg-challenge/35 shadow-sm" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                  What I noticed
                </span>
                <p className="mt-3 font-display text-[17px] italic leading-relaxed text-ink/90">
                  {theme.insight}
                </p>
              </div>

              <div className="jz jz-2 relative rounded-[18px] bg-card p-6 shadow-card ring-1 ring-ink/5">
                <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[3deg] rounded-[2px] bg-positive/40 shadow-sm" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                  One thing you could try
                </span>
                <p className="mt-3 font-display text-[17px] leading-relaxed text-ink">
                  {theme.action}
                </p>
              </div>

              <div className="jz jz-3 border-t border-line/70 pt-6">
                <p className="max-w-[34ch] text-sm text-ink">{theme.closing}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Yes", "Maybe", "Not really"].map((label) => (
                    <button
                      key={label}
                      onClick={() => onClosing(label)}
                      className={`rounded-full px-4 py-2 text-sm transition-transform duration-300 hover:-translate-y-0.5 ${
                        closingChoice === label
                          ? "bg-ink text-ivory"
                          : "text-muted-ink ring-1 ring-line"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {closingChoice && (
                  <p className="mt-4 text-xs italic text-muted-ink">
                    Noted — that's enough to work with for today.
                  </p>
                )}
                <div className="mt-6 flex flex-col items-start gap-3">
                  <button
                    onClick={onFinish}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    See your reflection today
                  </button>
                  <button
                    onClick={onBack}
                    className="text-sm text-ink underline decoration-line underline-offset-4"
                  >
                    Explore another part of my day
                  </button>
                  <button
                    onClick={onNew}
                    className="text-sm text-muted-ink underline decoration-line underline-offset-4 hover:text-ink"
                  >
                    Start a new reflection
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="jz jz-3 rounded-[18px] border border-dashed border-line p-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                Next
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted-ink">
                Once we understand this a little better, you'll get one observation about what may be
                going on and one small step to try — nothing more. We stay with{" "}
                {theme.title.toLowerCase()} only.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- 07 ---------------------------------- */

function Summary({
  themes,
  theme,
  saved,
  onSave,
  onBack,
  onNew,
  onReflections,
}: {
  themes: Theme[];
  theme: Theme;
  saved: boolean;
  onSave: () => void;
  onBack: () => void;
  onNew: () => void;
  onReflections: () => void;
}) {
  return (
    <section className="py-14 sm:py-20">
      <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-challenge">
        07 · Closing reflection
      </p>
      <h2 className="jz jz-1 mt-5 max-w-[22ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
        Your reflection today
      </h2>
      <p className="jz jz-2 mt-4 max-w-[44ch] text-pretty text-sm text-muted-ink">
        Here's what you're taking away from today.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="jz jz-2 lg:col-span-5">
          <div className="rounded-[18px] bg-card p-6 shadow-card ring-1 ring-ink/5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
              What stood out
            </span>
            <ul className="mt-4 space-y-4">
              {themes.map((t) => (
                <li key={t.id} className="flex gap-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${toneBg(t.tone)}`} />
                  <div>
                    <p className="font-display text-[17px] tracking-tight">{t.title}</p>
                    <p className="mt-0.5 text-sm text-muted-ink">{t.subtitle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="jz jz-2 relative rounded-[18px] bg-paper p-6 ring-1 ring-ink/5">
            <div
              className={`absolute -top-2.5 left-8 h-5 w-14 rotate-[-3deg] rounded-[2px] shadow-sm ${toneTape(theme.tone)}`}
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
              What you discovered
            </span>
            <p className="mt-3 font-display text-[17px] italic leading-relaxed text-ink/90">
              {theme.insight}
            </p>
          </div>

          <div className="jz jz-3 relative rounded-[20px] bg-ink p-7 shadow-paper">
            <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[3deg] rounded-[2px] bg-positive/50 shadow-sm" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/60">
              Your next step
            </span>
            <p className="mt-3 font-display text-2xl leading-snug text-ivory">{theme.action}</p>
          </div>

          <div className="jz jz-3 border-t border-line/70 pt-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
              A small takeaway
            </span>
            <p className="mt-3 max-w-[46ch] font-display text-lg italic leading-relaxed text-ink/90">
              {theme.takeaway}
            </p>
          </div>

          <div className="jz jz-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore another part of my day
            </button>
            <button
              onClick={onNew}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-ink ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start a new reflection
            </button>
            <button
              onClick={onSave}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-ink ring-1 ring-line transition-transform duration-300 hover:-translate-y-0.5"
            >
              Save this reflection
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-xs text-positive">
                <span className="size-1.5 rounded-full bg-positive" /> Reflection saved
              </span>
            )}
          </div>

          {saved && (
            <button
              onClick={onReflections}
              className="text-xs text-muted-ink underline decoration-line underline-offset-4 hover:text-ink"
            >
              View my reflections
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ My reflections -------------------------- */

function Reflections({
  items,
  onBack,
}: {
  items: SavedReflection[];
  onBack: () => void;
}) {
  return (
    <section className="py-14 sm:py-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-challenge">
            My reflections
          </p>
          <h2 className="jz jz-1 mt-5 max-w-[22ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
            Reflections you've saved
          </h2>
        </div>
        <button
          onClick={onBack}
          className="mt-2 shrink-0 text-xs text-muted-ink underline decoration-line underline-offset-4 hover:text-ink"
        >
          ← Back
        </button>
      </div>

      {items.length === 0 ? (
        <p className="jz jz-2 mt-8 max-w-[40ch] text-sm text-muted-ink">
          Nothing saved yet. Once you finish a reflection, you can keep it here.
        </p>
      ) : (
        <div className="jz jz-2 mt-9 space-y-5">
          {items.map((r) => (
            <article
              key={r.id}
              className="rounded-[18px] bg-card p-6 shadow-card ring-1 ring-ink/5"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                {formatDate(r.date)}
              </p>
              <p className="mt-4 font-display text-lg italic leading-snug text-ink/90">
                “{r.journal.slice(0, 120)}
                {r.journal.length > 120 ? "…" : ""}”
              </p>
              <dl className="mt-5 space-y-3 border-t border-line/70 pt-5 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                    Explored
                  </dt>
                  <dd className="mt-1 text-ink">{r.selectedTheme}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">Insight</dt>
                  <dd className="mt-1 text-muted-ink">{r.insight}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                    Next step
                  </dt>
                  <dd className="mt-1 text-ink">{r.action}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
