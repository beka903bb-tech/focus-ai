import { ChildInterest, Profession } from '@/store/coachProfileStore';

interface LevelBadgeIcon {
  name: string;
}

// Each profession/interest gets its own short "upgrade" ladder — as the user's level
// (utils/level.ts) climbs, the badge icon steps through this array and holds on the
// last (best) entry once the level exceeds the ladder's length.
const LADDERS: Record<string, LevelBadgeIcon[]> = {
  driver: [{ name: 'car-outline' }, { name: 'car' }, { name: 'car-sport-outline' }, { name: 'car-sport' }],
  developer: [{ name: 'code-slash-outline' }, { name: 'laptop-outline' }, { name: 'hardware-chip-outline' }, { name: 'rocket-outline' }],
  teacher: [{ name: 'book-outline' }, { name: 'school-outline' }, { name: 'library-outline' }, { name: 'trophy-outline' }],
  doctor: [{ name: 'medkit-outline' }, { name: 'pulse-outline' }, { name: 'fitness-outline' }, { name: 'ribbon-outline' }],
  business: [{ name: 'briefcase-outline' }, { name: 'business-outline' }, { name: 'trending-up-outline' }, { name: 'trophy-outline' }],
  child_sport: [{ name: 'football-outline' }, { name: 'medal-outline' }, { name: 'trophy-outline' }],
  child_art: [{ name: 'color-palette-outline' }, { name: 'brush-outline' }, { name: 'trophy-outline' }],
  child_science: [{ name: 'flask-outline' }, { name: 'planet-outline' }, { name: 'rocket-outline' }],
  child_games: [{ name: 'game-controller-outline' }, { name: 'game-controller' }, { name: 'trophy-outline' }],
  other: [{ name: 'star-outline' }, { name: 'star' }, { name: 'trophy-outline' }],
};

function ladderKey(profession?: Profession, childInterest?: ChildInterest): string {
  if (profession === 'child') return `child_${childInterest ?? 'sport'}`;
  return profession ?? 'other';
}

export function getLevelBadgeIcon(
  profession: Profession | undefined,
  childInterest: ChildInterest | undefined,
  level: number
): LevelBadgeIcon {
  const ladder = LADDERS[ladderKey(profession, childInterest)] ?? LADDERS.other;
  const index = Math.min(Math.max(level - 1, 0), ladder.length - 1);
  return ladder[index];
}
