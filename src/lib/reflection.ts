export type Tone = "challenge" | "uncertain" | "positive";

export type Theme = {
  id: string;
  title: string;
  subtitle: string;
  tone: Tone;
  /** opening reflection question */
  question: string;
  /** mirrored understanding shown after the user answers */
  mirror: string;
  insight: string;
  action: string;
  closing: string;
  /** small closing takeaway shown on the final summary screen */
  takeaway: string;
};

export const EXAMPLE_JOURNAL =
  "Today was pretty stressful. I had a presentation and kept worrying about whether people thought I was prepared. Then my friend was quiet at lunch and I kept thinking maybe she's upset with me. I also procrastinated on my assignment again. But I went to the gym and felt much better afterwards.";

const PRESENTATION: Theme = {
  id: "presentation",
  title: "Presentation",
  subtitle: "Concern about being judged",
  tone: "challenge",
  question:
    "You mentioned worrying about whether people thought you were prepared. What part of being judged feels most uncomfortable?",
  mirror:
    "So the weight may be sitting in the imagined verdict rather than in the presentation itself. Does that feel accurate?",
  insight:
    "It sounds like the pressure may be coming less from the presentation itself and more from how you imagine others evaluating you.",
  action:
    "Before your next presentation, write down what \u201cprepared enough\u201d actually means to you and use that as your benchmark.",
  closing: "Would having your own definition of \u201cprepared enough\u201d take some of the pressure off?",
  takeaway: "Sometimes the pressure eases when you get to decide what \u201cgood enough\u201d means.",
};

const FRIENDSHIP: Theme = {
  id: "friendship",
  title: "Friendship",
  subtitle: "Uncertainty and overthinking",
  tone: "uncertain",
  question:
    "You noticed that your friend seemed quiet and started wondering whether you had done something wrong. What made you connect their mood to yourself?",
  mirror:
    "So a moment of not knowing turned quite quickly into a question about yourself. Does that feel accurate?",
  insight:
    "It sounds like uncertainty quickly turned into self-questioning, even though you didn't have clear evidence that something was wrong.",
  action:
    "Next time, pause before assuming the reason and give yourself one alternative explanation for their behavior.",
  closing: "Would holding one alternative explanation make the uncertainty easier to sit with?",
  takeaway: "Sometimes not knowing is easier to hold when it isn't automatically about you.",
};

const ASSIGNMENT: Theme = {
  id: "assignment",
  title: "Assignment",
  subtitle: "Feeling overwhelmed and avoiding starting",
  tone: "challenge",
  question:
    "You mentioned that you keep postponing the assignment even though you know it's due Friday. When you think about starting it, what feels hardest?",
  mirror:
    "So the difficulty may be getting started rather than actually not having enough time. Does that feel accurate?",
  insight:
    "It sounds like the main barrier isn't lack of time. The assignment feels overwhelming because you're thinking about the entire workload at once, which makes avoiding it temporarily easier.",
  action:
    "Tomorrow, spend 15 minutes creating only the assignment outline. The goal isn't to finish it \u2014 just to make starting easier.",
  closing: "Would making the first step smaller make starting feel easier?",
  takeaway: "Sometimes making the first step smaller can make the whole problem feel more manageable.",
};

const WORKOUT: Theme = {
  id: "workout",
  title: "Workout",
  subtitle: "Improved mood after exercise",
  tone: "positive",
  question:
    "You noticed that you felt much better after your workout. What do you think changed for you?",
  mirror:
    "So movement seemed to shift something before the day itself changed. Does that feel accurate?",
  insight:
    "Your mood seemed to shift after doing something physical, suggesting that movement may be a useful reset when the day feels mentally heavy.",
  action:
    "On a stressful day this week, try a short 15-minute walk or workout before deciding the day is going badly.",
  closing: "Would treating movement as an early reset rather than a reward be worth trying?",
  takeaway: "Sometimes the fastest way to change a heavy day is to move your body first.",
};

const PERFORMANCE: Theme = {
  ...PRESENTATION,
  id: "performance",
  title: "Performance",
  subtitle: "Concern about how others perceived you",
};

const WORK: Theme = {
  ...ASSIGNMENT,
  id: "work",
  title: "Work / Procrastination",
  subtitle: "Difficulty getting started",
};

const RELATIONSHIPS: Theme = {
  ...FRIENDSHIP,
  id: "relationships",
  title: "Relationships",
  subtitle: "Uncertainty or overthinking",
};

const WELLBEING: Theme = {
  ...WORKOUT,
  id: "wellbeing",
  title: "Wellbeing",
  subtitle: "Improved mood after activity",
};

const GENERIC: Theme = {
  id: "generic",
  title: "Something on your mind",
  subtitle: "An experience that may be worth exploring further",
  tone: "uncertain",
  question:
    "Something in what you wrote seems to have stayed with you. When you think about it now, what part feels most alive?",
  mirror:
    "So it sounds like this matters more than it first appeared. Does that feel accurate?",
  insight:
    "Based on what you shared, it sounds like this experience is still unresolved \u2014 not because it's dramatic, but because you haven't had a chance to name what it meant to you.",
  action:
    "Tonight, write two sentences: one about what actually happened, and one about what you wish had happened instead.",
  closing: "Would naming it in your own words make it feel a little clearer?",
  takeaway: "Sometimes putting something into your own words is enough to make it feel lighter.",
};

export const SOMETHING_ELSE: Theme = {
  ...GENERIC,
  id: "something-else",
  title: "Something else",
  subtitle: "A part of your day we haven't touched yet",
};

const MATCHERS: { theme: Theme; keywords: string[] }[] = [
  {
    theme: PERFORMANCE,
    keywords: [
      "presentation",
      "present",
      "meeting",
      "interview",
      "speaking",
      "speech",
      "prepared",
      "judged",
      "exam",
      "pitch",
    ],
  },
  {
    theme: RELATIONSHIPS,
    keywords: [
      "friend",
      "relationship",
      "ignored",
      "distant",
      "argument",
      "upset",
      "partner",
      "family",
      "lunch",
      "quiet",
    ],
  },
  {
    theme: WORK,
    keywords: [
      "assignment",
      "homework",
      "deadline",
      "procrastinate",
      "procrastinated",
      "procrastinating",
      "work",
      "scrolling",
      "task",
      "study",
      "email",
    ],
  },
  {
    theme: WELLBEING,
    keywords: ["gym", "workout", "exercise", "run", "running", "walk", "yoga", "swim"],
  },
];

const EXAMPLE_SIGNATURE = ["presentation", "friend", "assignment", "gym"];

function isExampleJournal(text: string) {
  const t = text.toLowerCase();
  return EXAMPLE_SIGNATURE.every((word) => t.includes(word)) && t.includes("stressful");
}

export function analyzeJournal(text: string): Theme[] {
  if (isExampleJournal(text)) {
    return [PRESENTATION, FRIENDSHIP, ASSIGNMENT, WORKOUT];
  }

  const t = text.toLowerCase();
  const matched = MATCHERS.filter(({ keywords }) =>
    keywords.some((k) => t.includes(k)),
  ).map(({ theme }) => theme);

  if (matched.length === 0) return [GENERIC];
  return matched.slice(0, 4);
}

export const AFFIRM_RESPONSES: Record<string, string> = {
  yes: "Thank you for confirming \u2014 that helps me understand what's really going on.",
  maybe: "That's fair. Even a partial fit is useful, so let's hold it loosely.",
  no: "Good to know. Then let's keep what you said closer to the centre than my reading of it.",
};
