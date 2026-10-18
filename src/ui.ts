/**
 * ui.ts — HTML/CSS overlay screens and HUD.
 * Manages start, pause, game-over, and how-to-play screens.
 */

export type ScreenName = 'start' | 'howToPlay' | 'hud' | 'pause' | 'gameOver';

export class UI {
  private screens: Map<ScreenName, HTMLElement> = new Map();
  private scoreEl!: HTMLElement;
  private bestScoreStartEl!: HTMLElement;
  private comboEl!: HTMLElement;
  private gameOverScoreEl!: HTMLElement;
  private gameOverBestEl!: HTMLElement;
  private newBestEl!: HTMLElement;
  private soundBtnStart!: HTMLElement;
  private soundBtnPause!: HTMLElement;

  // Callbacks
  onPlay: (() => void) | null = null;
  onResume: (() => void) | null = null;
  onRestart: (() => void) | null = null;
  onMainMenu: (() => void) | null = null;
  onToggleSound: (() => void) | null = null;
  onShowHowToPlay: (() => void) | null = null;
  onPause: (() => void) | null = null;

  constructor() {
    this.cacheElements();
    this.setupListeners();
  }

  private cacheElements(): void {
    this.screens.set('start', document.getElementById('screen-start')!);
    this.screens.set('howToPlay', document.getElementById('screen-how-to-play')!);
    this.screens.set('hud', document.getElementById('screen-hud')!);
    this.screens.set('pause', document.getElementById('screen-pause')!);
    this.screens.set('gameOver', document.getElementById('screen-game-over')!);

    this.scoreEl = document.getElementById('hud-score')!;
    this.bestScoreStartEl = document.getElementById('start-best-score')!;
    this.comboEl = document.getElementById('hud-combo')!;
    this.gameOverScoreEl = document.getElementById('game-over-score')!;
    this.gameOverBestEl = document.getElementById('game-over-best')!;
    this.newBestEl = document.getElementById('game-over-new-best')!;
    this.soundBtnStart = document.getElementById('btn-sound-start')!;
    this.soundBtnPause = document.getElementById('btn-sound-pause')!;
  }

  private setupListeners(): void {
    document.getElementById('btn-play')!.addEventListener('click', () => this.onPlay?.());
    document.getElementById('btn-how-to-play')!.addEventListener('click', () => this.onShowHowToPlay?.());
    document.getElementById('btn-how-to-play-close')!.addEventListener('click', () => this.showScreen('start'));
    document.getElementById('btn-pause')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onPause?.();
    });
    document.getElementById('btn-resume')!.addEventListener('click', () => this.onResume?.());
    document.getElementById('btn-restart-pause')!.addEventListener('click', () => this.onRestart?.());
    document.getElementById('btn-menu-pause')!.addEventListener('click', () => this.onMainMenu?.());
    document.getElementById('btn-play-again')!.addEventListener('click', () => this.onRestart?.());
    document.getElementById('btn-menu-gameover')!.addEventListener('click', () => this.onMainMenu?.());
    this.soundBtnStart.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleSound?.();
    });
    this.soundBtnPause.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleSound?.();
    });
  }

  /** Show a specific screen, hide all others except HUD during play */
  showScreen(name: ScreenName): void {
    for (const [key, el] of this.screens) {
      if (key === 'hud') {
        // HUD is shown during play, pause, and game over
        el.classList.toggle('hidden', name === 'start' || name === 'howToPlay');
      } else {
        el.classList.toggle('hidden', key !== name);
      }
    }
  }

  /** Update the score display with pop animation */
  setScore(score: number): void {
    this.scoreEl.textContent = String(score);
    this.scoreEl.classList.remove('pop');
    // Force reflow to restart animation
    void this.scoreEl.offsetWidth;
    this.scoreEl.classList.add('pop');
  }

  /** Show combo text */
  showCombo(count: number): void {
    this.comboEl.textContent = `Perfect ×${count}!`;
    this.comboEl.classList.remove('hidden', 'combo-animate');
    void this.comboEl.offsetWidth;
    this.comboEl.classList.add('combo-animate');
    // Hide after animation
    setTimeout(() => {
      this.comboEl.classList.add('hidden');
    }, 1200);
  }

  /** Hide combo text immediately */
  hideCombo(): void {
    this.comboEl.classList.add('hidden');
  }

  /** Update best score on start screen */
  setBestScoreStart(score: number): void {
    this.bestScoreStartEl.textContent = `Best: ${score}`;
  }

  /** Update game over screen */
  setGameOverStats(score: number, best: number, isNewBest: boolean): void {
    this.gameOverScoreEl.textContent = String(score);
    this.gameOverBestEl.textContent = `Best: ${best}`;
    this.newBestEl.classList.toggle('hidden', !isNewBest);
  }

  /** Update sound button icons */
  updateSoundButtons(enabled: boolean): void {
    const icon = enabled ? '🔊' : '🔇';
    const label = enabled ? 'Sound On' : 'Sound Off';
    this.soundBtnStart.textContent = icon;
    this.soundBtnStart.setAttribute('aria-label', label);
    this.soundBtnPause.textContent = icon;
    this.soundBtnPause.setAttribute('aria-label', label);
  }

  /** Set pause button visibility */
  setPauseButtonVisible(visible: boolean): void {
    const btn = document.getElementById('btn-pause')!;
    btn.classList.toggle('hidden', !visible);
  }
}
