// "Thought pad": park a distracting thought mid-session without stopping the timer.
// Writing an unfinished task down (a concrete plan for it) stops it from intruding —
// Masicampo & Baumeister, JPSP 2011, doi:10.1037/a0024192. See docs/SCIENCE.md.

export interface ParkedThought {
  id: string;
  text: string;
  createdAt: string;
  habitName?: string;
  done: boolean;
}

export const THOUGHT_MAX_LENGTH = 280;
export const THOUGHT_LIST_LIMIT = 200;

/** Collapses whitespace and caps the length; returns '' for blank input. */
export function cleanThoughtText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, THOUGHT_MAX_LENGTH);
}

/**
 * Adds a thought to the front of the list. Blank input is ignored (returns the same list).
 * When the list is over the limit, finished thoughts are dropped first, then the oldest open ones.
 */
export function addThought(
  list: ParkedThought[],
  text: string,
  opts: { id: string; now?: Date; habitName?: string },
): ParkedThought[] {
  const clean = cleanThoughtText(text);
  if (!clean) return list;
  const item: ParkedThought = {
    id: opts.id,
    text: clean,
    createdAt: (opts.now ?? new Date()).toISOString(),
    done: false,
    ...(opts.habitName ? { habitName: opts.habitName } : {}),
  };
  const next = [item, ...list];
  if (next.length <= THOUGHT_LIST_LIMIT) return next;
  let overflow = next.length - THOUGHT_LIST_LIMIT;
  // drop finished thoughts from the oldest end first
  const kept: ParkedThought[] = [];
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (overflow > 0 && next[i].done) {
      overflow -= 1;
      continue;
    }
    kept.unshift(next[i]);
  }
  return overflow > 0 ? kept.slice(0, kept.length - overflow) : kept;
}

export function toggleThought(list: ParkedThought[], id: string): ParkedThought[] {
  return list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeThought(list: ParkedThought[], id: string): ParkedThought[] {
  return list.filter((t) => t.id !== id);
}

export function clearDoneThoughts(list: ParkedThought[]): ParkedThought[] {
  return list.filter((t) => !t.done);
}

export function openThoughtCount(list: ParkedThought[]): number {
  return list.reduce((n, t) => n + (t.done ? 0 : 1), 0);
}

/** Thoughts parked at or after `since` (e.g. the start of the current session). */
export function thoughtsSince(list: ParkedThought[], since: number): number {
  return list.reduce((n, t) => n + (Date.parse(t.createdAt) >= since ? 1 : 0), 0);
}
