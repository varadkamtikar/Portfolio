export type Role = 'ds' | 'da';
export interface CardMeta { id: string; rank: Record<Role, number>; stack: string[] }

const norm = (s: string) => s.trim().toLowerCase();

/** True when any of the skill's names appears in the project's stack. */
export function matchesSkill(stack: string[], names: string[]): boolean {
  const have = new Set(stack.map(norm));
  return names.some((n) => have.has(norm(n)));
}

/** Cards sorted for the role (stable; ties keep input order), optionally filtered to a skill. */
export function arrange<T extends CardMeta>(cards: T[], role: Role, skillNames: string[] | null): T[] {
  return cards
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => !skillNames || matchesSkill(c.stack, skillNames))
    .sort((a, b) => a.c.rank[role] - b.c.rank[role] || a.i - b.i)
    .map(({ c }) => c);
}

/** Bento slot for the nth visible card: first is the large lead card, 4th onward are half width. */
export function slot(index: number): 'lead' | 'side' | 'half' {
  return index === 0 ? 'lead' : index < 3 ? 'side' : 'half';
}
