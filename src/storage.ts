/**
 * storage.ts — Safe localStorage helpers.
 * All access is wrapped in try/catch so the game works
 * even when storage is blocked (private browsing, etc.).
 */

const BEST_SCORE_KEY = 'stackTower_bestScore';
const SOUND_KEY = 'stackTower_soundEnabled';

export function getBestScore(): number {
  try {
    const val = localStorage.getItem(BEST_SCORE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setBestScore(score: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Storage unavailable — silently ignore
  }
}

export function getSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // Storage unavailable — silently ignore
  }
}
