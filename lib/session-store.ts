const STORAGE_KEY = 'headshot-sessions';
const MAX_SESSIONS = 30;

export interface HeadshotSession {
  id: string;
  styleName: string;
  styleId: string;
  createdAt: string;
  thumbnails: string[];
  imageCount: number;
}

function generateId(): string {
  return `hs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getSessions(): HeadshotSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HeadshotSession[];
  } catch {
    return [];
  }
}

export function saveSession(session: Omit<HeadshotSession, 'id' | 'createdAt'>): HeadshotSession {
  const full: HeadshotSession = {
    ...session,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const existing = getSessions();
  const updated = [full, ...existing].slice(0, MAX_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — drop oldest entries and retry
    const trimmed = updated.slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }

  return full;
}

export function getSessionById(id: string): HeadshotSession | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function deleteSession(id: string): void {
  const updated = getSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
