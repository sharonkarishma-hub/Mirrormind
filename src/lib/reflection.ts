export type Tone = "challenge" | "uncertain" | "positive";

export type Theme = {
  id: string;
  title: string;
  subtitle: string;
  tone: Tone;
  /** opening reflection question */
  question: string;
  /** follow-up question for interactive chat */
  followup: string;
  /** mirrored understanding shown after the user answers */
  mirror: string;
  /** final chat response before summary */
  chatMirror: string;
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
  followup:
    "It's natural to feel that way. If someone did think you weren't prepared, what is the worst thing that would happen in your mind?",
  mirror:
    "So the weight may be sitting in the imagined verdict rather than in the presentation itself. Does that feel accurate?",
  chatMirror:
    "It sounds like the fear is about losing credibility, rather than just the presentation itself. You are holding yourself to a very high standard.",
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
  followup:
    "Overthinking a friend's behavior is common. Have they ever been quiet or distant in the past for reasons completely unrelated to you?",
  mirror:
    "So a moment of not knowing turned quite quickly into a question about yourself. Does that feel accurate?",
  chatMirror:
    "It sounds like you care deeply about this friendship, which is why your mind jumps to trying to fix it immediately.",
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
    "You mentioned that you keep postponing the assignment even though you know it's Friday. When you think about starting it, what feels hardest?",
  followup:
    "You've handled similar assignments before. What feels different this time around that is causing this friction?",
  mirror:
    "So the difficulty may be getting started rather than actually not having enough time. Does that feel accurate?",
  chatMirror:
    "It sounds like the workload is manageable — fear of underperforming is what's making this feel larger and harder to initiate.",
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
  followup:
    "Physical resets are very powerful. How can you carry this clear-headed feeling into the rest of your day?",
  mirror:
    "So movement seemed to shift something before the day itself changed. Does that feel accurate?",
  chatMirror:
    "It sounds like physical activity is a reliable tool for you to clear mental clutter and reset your emotional state.",
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

const GOOD_DAY: Theme = {
  id: "good-day",
  title: "A Positive Day",
  subtitle: "A moment of joy, gratitude, or accomplishment",
  tone: "positive",
  question:
    "It's wonderful to hear your day was positive! When you look back at today, what specific moment or thought made it feel that way?",
  followup:
    "Often we let good moments pass by quickly without dwelling on them. How did that moment make you feel about your own capabilities or connection to others?",
  mirror:
    "So it sounds like you really allowed yourself to experience that positive moment fully today. Does that feel accurate?",
  chatMirror:
    "It sounds like you really allowed yourself to experience that positive moment fully, which is a great practice for building resilience.",
  insight:
    "Taking a moment to notice and reflect on positive experiences helps shift our emotional baseline and builds lasting feelings of competence and gratitude.",
  action:
    "Savor this feeling tonight by writing down one thing you did that contributed to this good day, and see if you can repeat it tomorrow.",
  closing: "Would focusing on what went well today make you feel more confident about tomorrow?",
  takeaway: "Savoring positive moments trains your mind to notice and create them more easily.",
};

const STRESSED_HEAVY: Theme = {
  id: "stressed-heavy",
  title: "Stress & Heavy Feelings",
  subtitle: "Feeling weighed down, anxious, or exhausted",
  tone: "challenge",
  question:
    "I hear you, and it's completely okay to feel heavy or stressed. When you look at what's stressing you, what feels like the heaviest part right now?",
  followup:
    "Does this pressure feel like it's coming from outside expectations (like work, school, or friends), or is it mostly coming from your own standards?",
  mirror:
    "So it sounds like the weight is compounded by how much you care about getting it right. Does that feel accurate?",
  chatMirror:
    "It sounds like you are carrying a lot of responsibility on your shoulders right now, which makes even starting feel twice as heavy.",
  insight:
    "Stress can make us feel like we have to solve the entire future at once, which leads to freeze and exhaustion. Letting go of the full picture temporarily can restore your energy.",
  action:
    "Tonight, give yourself permission to step away completely. Choose one small 5-minute task for tomorrow, and commit only to that.",
  closing: "Would focusing on just one tiny task tomorrow make the weight feel more manageable?",
  takeaway: "You don't have to carry the whole load at once. One tiny step is enough to shift the energy.",
};

const QUIET_STILL: Theme = {
  id: "quiet-still",
  title: "A Quiet / Neutral Day",
  subtitle: "A normal, slow, routine, or quiet day",
  tone: "uncertain",
  question:
    "A quiet or slow day has its own pace. Did today feel like a restful pause, or did it feel a bit flat or routine for you?",
  followup:
    "What is one small thing that would have brought a bit more energy, joy, or spark to your day today?",
  mirror:
    "So today was less about big events and more about just sitting with the routine. Does that feel accurate?",
  chatMirror:
    "It sounds like you're in a neutral space today, which is a perfect window to check in on what your body and mind actually need next.",
  insight:
    "Routine days can feel boring, but they are also a blank canvas. They offer a rare, low-stakes space to reset and choose your own speed without external pressure.",
  action:
    "Do one tiny thing that is outside your normal routine tonight—like listening to a new song, walking a new path, or writing down a curiosity.",
  closing: "Would introducing a tiny, unexpected change in your routine bring a bit of freshness to your day?",
  takeaway: "Quiet, simple days are perfect opportunities to choose your own slow, restful pace.",
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
  followup:
    "Why do you think that specific part is staying with you right now instead of other things?",
  mirror:
    "So it sounds like this matters more than it first appeared. Does that feel accurate?",
  chatMirror:
    "It sounds like this is holding some important meaning for you to process, and naming it is the first step.",
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

const EMOTION_MATCHERS: { theme: Theme; keywords: string[] }[] = [
  {
    theme: GOOD_DAY,
    keywords: ["good", "great", "happy", "super", "awesome", "proud", "fun", "accomplished", "love", "amazing", "well", "nice", "cheerful", "excited", "glad", "joy", "peaceful", "calm"],
  },
  {
    theme: STRESSED_HEAVY,
    keywords: ["stress", "stressed", "anxious", "anxiety", "bad", "sad", "tired", "exhausted", "heavy", "overwhelmed", "terrible", "hard", "difficult", "struggling", "hate", "angry", "furious", "annoyed", "frustrated", "sick", "pain", "worry", "worried"],
  },
  {
    theme: QUIET_STILL,
    keywords: ["nothing", "okay", "fine", "not much", "dunno", "routine", "quiet", "normal", "boring", "slow", "average", "still", "standard", "ordinary"],
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
  
  // 1. Check for specific topic matchers
  const matchedTopics = MATCHERS.filter(({ keywords }) =>
    keywords.some((k) => t.includes(k)),
  ).map(({ theme }) => theme);

  if (matchedTopics.length > 0) {
    return matchedTopics.slice(0, 4);
  }

  // 2. If no specific topics matched, check for emotional vibe matchers
  const matchedEmotions = EMOTION_MATCHERS.filter(({ keywords }) =>
    keywords.some((k) => t.includes(k)),
  ).map(({ theme }) => theme);

  if (matchedEmotions.length > 0) {
    return [matchedEmotions[0]];
  }

  // 3. Fallback to generic
  return [GENERIC];
}

export const AFFIRM_RESPONSES: Record<string, string> = {
  yes: "Thank you for confirming \u2014 that helps me understand what's really going on.",
  maybe: "That's fair. Even a partial fit is useful, so let's hold it loosely.",
  no: "Good to know. Then let's keep what you said closer to the centre than my reading of it.",
};
