import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquareText, Zap, Send, ArrowRight, Sparkles, AlertCircle, ArrowLeft, Home as HomeIcon } from "lucide-react";

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

type Stage = "welcome" | "choice" | "journal" | "loading" | "map" | "explore" | "summary" | "reflections";
type ExploreStep = "chat" | "insight";

const STORAGE_KEY = "ajc.journal";

function Index() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [journal, setJournal] = useState("");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [step, setStep] = useState<ExploreStep>("chat");
  const [mode, setMode] = useState<"chat" | "reflect">("chat");
  const [nickname, setNickname] = useState("");
  const [answer, setAnswer] = useState("");
  const [affirm, setAffirm] = useState<"yes" | "maybe" | "no" | null>(null);
  const [closingChoice, setClosingChoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReflection[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [returnStage, setReturnStage] = useState<Stage>("welcome");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSaved(loadReflections());
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function persist(text: string) {
    setJournal(text);
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
    setStep("choice");
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
    setStage("choice");
    setThemes([]);
    setTheme(null);
    setStep("chat");
    setAnswer("");
    setAffirm(null);
    setClosingChoice(null);
    setJustSaved(false);
    persist("");
  }

  function handleBack() {
    if (stage === "choice") {
      setStage("welcome");
    } else if (stage === "journal") {
      setStage("choice");
    } else if (stage === "explore") {
      if (mode === "chat") {
        setStage("choice");
      } else {
        setStage("map");
      }
    } else if (stage === "map") {
      setStage("journal");
    } else if (stage === "summary") {
      if (mode === "chat") {
        setStage("explore");
        setStep("chat");
      } else {
        setStage("map");
      }
    } else if (stage === "reflections") {
      setStage(returnStage === "reflections" ? "welcome" : returnStage);
    }
  }

  function handleGoHome() {
    setStage("welcome");
  }

  const showNav = stage !== "welcome";

  return (
    <Chrome
      onGuidedReflection={() => setStage("choice")}
      onHome={() => setStage("welcome")}
      headerAction={
        <button
          onClick={openReflections}
          className="text-[10px] uppercase tracking-[0.22em] text-muted-ink underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          My reflections
        </button>
      }
    >
      {showNav && (
        <div className="flex items-center gap-4 py-3 border-b border-line/35 mb-6 text-sm text-muted-ink">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-line/60">|</span>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
          >
            <HomeIcon size={16} /> Home
          </button>
        </div>
      )}

      {stage === "welcome" && (
        <Welcome onStart={() => setStage("choice")} />
      )}

      {stage === "choice" && (
        <Choice
          onSelect={(choice) => {
            setMode(choice);
            if (choice === "chat") {
              setNickname("");
              setStep("chat");
              setStage("explore");
              setTheme(SOMETHING_ELSE);
            } else {
              setStage("journal");
            }
          }}
        />
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
          onStepChange={setStep}
          onSubmitAnswer={() => {
            if (!answer.trim()) return;
            setStep("insight");
          }}
          onAffirm={(value) => {
            setAffirm(value);
            setStep("insight");
          }}
          onClosing={setClosingChoice}
          onBack={backToMap}
          onNew={startOver}
          onFinish={() => setStage("summary")}
          journal={journal}
          onJournalChange={setJournal}
          nickname={nickname}
          onNicknameChange={setNickname}
          mode={mode}
          onThemeChange={setTheme}
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

/* ---------------------------------- Choice ------------------------------ */

function Choice({ onSelect }: { onSelect: (choice: "chat" | "reflect") => void }) {
  return (
    <section className="py-14 sm:py-20">
      <h2 className="jz jz-1 mt-2 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
        How would you like to explore your day?
      </h2>
      <p className="mt-4 max-w-[50ch] text-sm text-muted-ink">
        Choose to talk it through in an interactive guided conversation, or immediately write and get your reflection note.
      </p>

      <div className="mt-10 grid gap-6 max-w-[700px] md:grid-cols-2">
        {/* Card 1: Chat */}
        <button
          onClick={() => onSelect("chat")}
          className="flex flex-col text-left p-6 rounded-[20px] bg-card hover:bg-paper border border-line/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="size-10 rounded-full bg-ink text-ivory flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <MessageSquareText size={20} className="stroke-[1.8]" />
          </div>
          <h3 className="font-display text-xl text-ink font-semibold">Talk it through</h3>
          <p className="mt-2 text-xs text-muted-ink leading-relaxed">
            Start a guided conversation. Name your nickname, share your day, and receive targeted, supportive questions to explore deeper.
          </p>
          <div className="mt-auto pt-6 flex items-center text-xs font-semibold text-ink gap-1 group-hover:gap-2 transition-all">
            Start guided conversation <ArrowRight size={12} />
          </div>
        </button>

        {/* Card 2: Direct Note */}
        <button
          onClick={() => onSelect("reflect")}
          className="flex flex-col text-left p-6 rounded-[20px] bg-card hover:bg-paper border border-line/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="size-10 rounded-full bg-uncertain/20 text-uncertain flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Zap size={20} className="stroke-[1.8]" fill="currentColor" />
          </div>
          <h3 className="font-display text-xl text-ink font-semibold">Just reflect</h3>
          <p className="mt-2 text-xs text-muted-ink leading-relaxed">
            Skip the conversation entirely. Directly write your thoughts and retrieve the synthesized reflection, including insights and actions.
          </p>
          <div className="mt-auto pt-6 flex items-center text-xs font-semibold text-ink gap-1 group-hover:gap-2 transition-all">
            Write & get reflection note <ArrowRight size={12} />
          </div>
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------- 01 ---------------------------------- */

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <p className="jz jz-1 text-[11px] uppercase tracking-[0.24em] text-muted-ink">
            Reflect · Understand · Explore · Act
          </p>
          <h1 className="jz jz-1 mt-6 max-w-[20ch] text-balance font-display text-6xl leading-[0.92] tracking-[-0.02em] sm:text-7xl">
            Understand your day.
          </h1>
          <p className="jz jz-2 mt-7 max-w-[42ch] text-pretty text-base text-muted-ink sm:text-lg">
            Explore your thoughts. We'll help you find clarity, patterns, and focus.
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
            02 · Reflection
          </p>
          <h2 className="jz jz-1 mt-5 max-w-[16ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
            How was your day?
          </h2>
          <p className="jz jz-2 mt-5 max-w-[34ch] text-pretty text-sm text-muted-ink">
            Express whatever is on your mind — the good, the difficult, the confusing, or
            anything that stayed with you today.
          </p>
          <div className="jz jz-3 mt-8 space-y-2.5 border-t border-line/70 pt-6 text-xs text-muted-ink">
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-challenge" /> Private &amp; on this device
            </p>
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-uncertain" /> No scores, no pressure
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
  onStepChange,
  onSubmitAnswer,
  onAffirm,
  onClosing,
  onBack,
  onNew,
  onFinish,
  journal,
  onJournalChange,
  nickname,
  onNicknameChange,
  mode,
  onThemeChange,
}: {
  theme: Theme;
  step: ExploreStep;
  answer: string;
  affirm: "yes" | "maybe" | "no" | null;
  closingChoice: string | null;
  onAnswer: (v: string) => void;
  onStepChange: (v: ExploreStep) => void;
  onSubmitAnswer: () => void;
  onAffirm: (v: "yes" | "maybe" | "no") => void;
  onClosing: (v: string) => void;
  onBack: () => void;
  onNew: () => void;
  onFinish: () => void;
  journal: string;
  onJournalChange: (v: string) => void;
  nickname: string;
  onNicknameChange: (v: string) => void;
  mode: "chat" | "reflect";
  onThemeChange: (t: Theme) => void;
}) {
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatTurn, setChatTurn] = useState<number>(0);

  // Reset local states when theme changes, but not in the middle of a chat session
  useEffect(() => {
    if (chatTurn === 0 || chatHistory.length === 0) {
      setChatHistory([]);
      setChatInput("");
      setIsTyping(false);
      setChatTurn(0);
    }
  }, [theme.id]);

  // Safety keyword detector (Ideation / Crisis support)
  function checkSafety(text: string): boolean {
    const keywords = [
      "suicide",
      "kill myself",
      "self-harm",
      "want to die",
      "end my life",
      "cut myself",
      "hanging myself",
      "overdose",
      "harming myself",
    ];
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  // App feedback detector (Ensures app accepts user feedback with extreme positivity)
  function checkAppFeedback(text: string): boolean {
    const keywords = [
      "this app sucks",
      "sucks",
      "useless",
      "stupid app",
      "hate this",
      "worst app",
      "waste of time",
      "dumb app",
    ];
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }

  // Initialize chat when turning to "chat" step
  useEffect(() => {
    if (step === "chat" && chatHistory.length === 0) {
      if (mode === "chat") {
        setChatHistory([
          {
            sender: "ai",
            text: "Hello! Before we begin, how would you like to be called? (Feel free to share a nickname or pseudonym!)",
          },
        ]);
        setChatTurn(0);
      } else {
        setChatHistory([{ sender: "ai", text: theme.question }]);
        setChatTurn(2);
      }
    }
  }, [step, mode, theme.question, chatHistory.length]);

  // Push transcript to parent state when turn transitions to final summary
  useEffect(() => {
    if (chatTurn === 4 && chatHistory.length > 0) {
      const transcript = chatHistory
        .map((msg) => `${msg.sender === "user" ? "You" : "MirrorMind"}: ${msg.text}`)
        .join("\n\n");
      onAnswer(transcript);
    }
  }, [chatTurn, chatHistory, onAnswer]);

  function handleStartReflectingEarly() {
    if (chatTurn === 1) {
      const lastUserMsg = [...chatHistory].reverse().find((m) => m.sender === "user");
      if (lastUserMsg) {
        const matched = analyzeJournal(lastUserMsg.text);
        const matchedTheme = matched.length ? matched[0] : SOMETHING_ELSE;
        onThemeChange(matchedTheme);
        onJournalChange(lastUserMsg.text);
      }
    }
    setChatTurn(4);
    onStepChange("insight");
  }

  function advanceChat(msg: string) {
    if (chatTurn === 0) {
      // Nickname setup
      onNicknameChange(msg);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Nice to meet you, ${msg}! How was your day? Tell me about whatever is on your mind — the good, the difficult, the confusing, or anything that stayed with you.`,
        },
      ]);
      setChatTurn(1);
    } else if (chatTurn === 1) {
      // Vent / thoughts capture
      onJournalChange(msg);
      const matched = analyzeJournal(msg);
      const matchedTheme = matched.length ? matched[0] : SOMETHING_ELSE;
      onThemeChange(matchedTheme);

      const name = nickname || msg || "friend";
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Thank you for sharing that, ${name}. Based on what you said, I notice a theme of "${matchedTheme.title}" standing out.\n\n${matchedTheme.question}`,
        },
      ]);
      setChatTurn(2);
    } else if (chatTurn === 2) {
      // Answer theme question, ask followup
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: theme.followup,
        },
      ]);
      setChatTurn(3);
    } else if (chatTurn === 3) {
      // Answer followup, give synthesis
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: theme.chatMirror,
        },
      ]);
      setChatTurn(4);
    }
  }

  function handleSendChat() {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput.trim();
    setChatInput("");

    setChatHistory((prev) => [...prev, { sender: "user", text: msg }]);

    // Safety Trigger
    if (checkSafety(msg)) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "It sounds like you are going through an incredibly difficult time. Please consider reaching out to a professional, a doctor, or talking with your loved ones. You do not have to carry this alone. If you are in immediate distress, please contact a local crisis support line or helpline right away.",
          },
        ]);
        setChatTurn(4);
      }, 1100);
      return;
    }

    // App Criticism Feedback Trigger (Only positivity)
    if (checkAppFeedback(msg)) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Thank you so much for sharing your feedback. I appreciate your honesty and am here to support your reflection in whatever way feels most conducive and helpful for you.",
          },
        ]);

        // After a delay, proceed with the actual coaching step
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            advanceChat(msg);
          }, 1200);
        }, 1800);
      }, 1000);
      return;
    }

    // Normal Turn transitions
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      advanceChat(msg);
    }, 1200);
  }

  // Detect global safety warnings
  const showSafetyWarning =
    checkSafety(journal) || chatHistory.some((msg) => msg.sender === "user" && checkSafety(msg.text));

  // INTERACTIVE CHAT VIEW
  if (step === "chat") {
    return (
      <section className="py-10">
        <h2 className="jz jz-1 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
          Interactive Conversation
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Chat log column */}
          <div className="lg:col-span-8 flex flex-col min-h-[450px] bg-paper border border-line/70 rounded-[24px] p-4 sm:p-6 justify-between">
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider text-muted-ink/80 mb-1 px-1">
                    {msg.sender === "user" ? (nickname || "User") : "MirrorMind"}
                  </span>
                  <div
                    className={`px-5 py-3.5 rounded-[18px] text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[oklch(0.235_0.013_75)] text-ivory rounded-tr-sm shadow-sm"
                        : "bg-card text-ink rounded-tl-sm shadow-sm border border-line/40"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mr-auto items-start flex flex-col max-w-[80%]">
                  <span className="text-[9px] uppercase tracking-wider text-muted-ink/80 mb-1 px-1">
                    MirrorMind
                  </span>
                  <div className="px-5 py-3 rounded-[18px] bg-card text-muted-ink text-xs italic rounded-tl-sm border border-line/40 flex items-center gap-1.5 animate-pulse">
                    <span className="size-1.5 rounded-full bg-muted-ink animate-bounce" />
                    <span className="size-1.5 rounded-full bg-muted-ink animate-bounce delay-100" />
                    <span className="size-1.5 rounded-full bg-muted-ink animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-6 border-t border-line/50 pt-4 flex flex-col gap-3">
              {chatTurn < 4 ? (
                <>
                  <div className="flex gap-2 items-end">
                    <textarea
                      rows={2}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="Share your thoughts..."
                      disabled={isTyping}
                      className="flex-1 resize-none bg-card border border-line/50 rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 disabled:opacity-60 placeholder:text-muted-ink/50"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim() || isTyping}
                      className="size-10 rounded-full bg-ink text-ivory flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleStartReflectingEarly}
                      className="rounded-full px-4 py-1.5 border border-line/60 text-xs text-muted-ink hover:text-ink hover:bg-card transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap size={12} fill="currentColor" className="text-uncertain" /> Start reflecting
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center py-2 animate-bounce">
                  <button
                    onClick={() => onStepChange("insight")}
                    className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    See Reflection Note <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right helper column */}
          <div className="lg:col-span-4 h-full">
            <div className="rounded-[20px] bg-card p-6 border border-line/40 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
              <Sparkles className="size-7 text-muted-ink mb-4 opacity-80" />
              <h4 className="font-display text-base text-ink font-semibold">A space to process</h4>
              <p className="mt-2 text-xs text-muted-ink leading-relaxed max-w-[28ch]">
                Take your time to reply. We are keeping track of your reflections and will synthesize them on the next page.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SYNTHESIS & INSIGHT VIEW
  if (step === "insight") {
    // Choice 1: Direct reflection note (clean, centered, 1 column)
    if (mode === "reflect") {
      return (
        <section className="py-10">
          <div className="max-w-[700px] mx-auto">
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
              Your Reflection Note
            </h2>

            {/* Safety Warning Ideation Banner */}
            {showSafetyWarning && (
              <div className="mt-8 p-5 rounded-[18px] bg-challenge/10 border border-challenge/30 text-ink flex gap-4 items-start animate-pulse">
                <AlertCircle className="size-6 text-challenge shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-semibold text-challenge text-sm">We care about you</h4>
                  <p className="mt-1 text-xs text-muted-ink leading-relaxed">
                    It sounds like you are carrying a lot of weight right now. Please know that you do not have to go through this alone. Consider speaking with a doctor, consulting a medical professional, or sharing this with loved ones. If you need immediate support, crisis lines are available to talk 24/7.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-6">
              {/* Insight Card */}
              <div className="jz jz-1 relative rounded-[18px] bg-paper p-6 ring-1 ring-ink/5">
                <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[-3deg] rounded-[2px] bg-challenge/35 shadow-sm" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                  What I noticed
                </span>
                <p className="mt-3 font-display text-[17px] italic leading-relaxed text-ink/90">
                  {theme.insight}
                </p>
              </div>

              {/* Action Card */}
              <div className="jz jz-2 relative rounded-[18px] bg-card p-6 shadow-card ring-1 ring-ink/5">
                <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[3deg] rounded-[2px] bg-positive/40 shadow-sm" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                  One thing you could try
                </span>
                <p className="mt-3 font-display text-[17px] leading-relaxed text-ink">
                  {theme.action}
                </p>
              </div>

              {/* Closing / Affirmations */}
              <div className="jz jz-3 border-t border-line/70 pt-6">
                <p className="max-w-[45ch] text-sm text-ink">{theme.closing}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Yes", "Maybe", "Not really"].map((label) => (
                    <button
                      key={label}
                      onClick={() => onClosing(label)}
                      className={`rounded-full px-5 py-2.5 text-sm transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer ${
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

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={onFinish}
                    className="w-full sm:w-auto rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5 text-center cursor-pointer"
                  >
                    See your reflection today
                  </button>
                  <button
                    onClick={onBack}
                    className="text-sm text-ink underline decoration-line underline-offset-4 cursor-pointer"
                  >
                    Explore another theme
                  </button>
                  <button
                    onClick={onNew}
                    className="text-sm text-muted-ink underline decoration-line underline-offset-4 hover:text-ink cursor-pointer"
                  >
                    Start new reflection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Choice 2: Guided chat transcript visible (2 columns: left chat transcript, right summaries)
    return (
      <section className="py-10">
        <h2 className="jz jz-1 max-w-[24ch] text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em]">
          Coaching Summary
        </h2>

        {/* Safety Warning Ideation Banner */}
        {showSafetyWarning && (
          <div className="mt-6 p-5 rounded-[18px] bg-challenge/10 border border-challenge/30 text-ink flex gap-4 items-start animate-pulse">
            <AlertCircle className="size-6 text-challenge shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-semibold text-challenge text-sm">We care about you</h4>
              <p className="mt-1 text-xs text-muted-ink leading-relaxed">
                It sounds like you are carrying a lot of weight right now. Please know that you do not have to go through this alone. Consider speaking with a doctor, consulting a medical professional, or sharing this with loved ones. If you need immediate support, crisis lines are available to talk 24/7.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left Column: Chat history static transcript */}
          <div className="lg:col-span-6 flex flex-col bg-paper border border-line/60 rounded-[24px] p-5 max-h-[500px] overflow-y-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink mb-4 border-b border-line/40 pb-2">
              Conversation History
            </span>
            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[90%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider text-muted-ink/75 mb-0.5">
                    {msg.sender === "user" ? "You" : "MirrorMind"}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-[14px] text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[oklch(0.235_0.013_75)] text-ivory rounded-tr-none shadow-sm"
                        : "bg-card text-ink rounded-tl-none border border-line/30"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Summaries and buttons */}
          <div className="lg:col-span-6 space-y-6">
            {/* Insight Card */}
            <div className="jz jz-1 relative rounded-[18px] bg-paper p-6 ring-1 ring-ink/5">
              <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[-3deg] rounded-[2px] bg-challenge/35 shadow-sm" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                What I noticed
              </span>
              <p className="mt-3 font-display text-[17px] italic leading-relaxed text-ink/90">
                {theme.insight}
              </p>
            </div>

            {/* Action Card */}
            <div className="jz jz-2 relative rounded-[18px] bg-card p-6 shadow-card ring-1 ring-ink/5">
              <div className="absolute -top-2.5 left-8 h-5 w-14 rotate-[3deg] rounded-[2px] bg-positive/40 shadow-sm" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-ink">
                One thing you could try
              </span>
              <p className="mt-3 font-display text-[17px] leading-relaxed text-ink">
                {theme.action}
              </p>
            </div>

            {/* Closing / Affirmations */}
            <div className="jz jz-3 border-t border-line/70 pt-6">
              <p className="max-w-[45ch] text-sm text-ink">{theme.closing}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Yes", "Maybe", "Not really"].map((label) => (
                  <button
                    key={label}
                    onClick={() => onClosing(label)}
                    className={`rounded-full px-5 py-2.5 text-sm transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer ${
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
                  {affirm && <span className="block mt-1 font-normal text-muted-ink">{AFFIRM_RESPONSES[affirm]}</span>}
                </p>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onFinish}
                  className="w-full sm:w-auto rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory ring-1 ring-ink/10 transition-transform duration-300 hover:-translate-y-0.5 text-center cursor-pointer"
                >
                  See your reflection today
                </button>
                <button
                  onClick={onBack}
                  className="text-sm text-ink underline decoration-line underline-offset-4 cursor-pointer"
                >
                  Explore another theme
                </button>
                <button
                  onClick={onNew}
                  className="text-sm text-muted-ink underline decoration-line underline-offset-4 hover:text-ink cursor-pointer"
                >
                  Start new reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback
  return null;
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
