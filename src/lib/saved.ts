export type SavedReflection = {
  id: string;
  date: string;
  journal: string;
  themes: { title: string; subtitle: string }[];
  selectedTheme: string;
  conversation: { question: string; answer: string; mirror: string; affirm: string | null };
  insight: string;
  action: string;
};

const KEY = "ajc.reflections";

export function loadReflections(): SavedReflection[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedReflection[]) : [];
  } catch {
    return [];
  }
}

export function saveReflection(entry: Omit<SavedReflection, "id" | "date">): SavedReflection[] {
  const record: SavedReflection = {
    ...entry,
    id: `${Date.now()}`,
    date: new Date().toISOString(),
  };
  const next = [record, ...loadReflections()].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the reflection simply isn't kept */
  }
  return next;
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
