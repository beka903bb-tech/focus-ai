import type { TFunction } from 'i18next';

interface MotivationTier {
  key: string;
  icon: string;
}

const TIER_STARTING: MotivationTier = { key: 'starting', icon: 'leaf' };
const TIER_MIDWAY: MotivationTier = { key: 'midway', icon: 'rocket' };
const TIER_ALMOST: MotivationTier = { key: 'almost', icon: 'flame' };
const TIER_COMPLETE: MotivationTier = { key: 'complete', icon: 'trophy' };

function getTier(percent: number): MotivationTier {
  if (percent >= 100) return TIER_COMPLETE;
  if (percent >= 70) return TIER_ALMOST;
  if (percent >= 30) return TIER_MIDWAY;
  return TIER_STARTING;
}

const lastMessageByTier: Record<string, string> = {};

export interface MotivationResult {
  message: string;
  icon: string;
}

export function pickMotivationMessage(t: TFunction, percent: number): MotivationResult {
  const tier = getTier(percent);
  const messages = t(`motivation.${tier.key}`, { returnObjects: true }) as string[];
  const last = lastMessageByTier[tier.key];
  const candidates = messages.length > 1 && last ? messages.filter((message) => message !== last) : messages;
  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  lastMessageByTier[tier.key] = choice;
  return { message: choice, icon: tier.icon };
}
