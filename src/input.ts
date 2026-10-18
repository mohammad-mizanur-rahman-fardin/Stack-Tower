/**
 * input.ts — Unified input handler for pointer (tap/click) and keyboard.
 * Dispatches a single "drop" action regardless of input method.
 */

export type InputCallback = () => void;

export class Input {
  private dropCallbacks: InputCallback[] = [];
  private pauseCallbacks: InputCallback[] = [];
  private enabled = true;

  constructor(private canvas: HTMLCanvasElement) {
    this.setupPointerEvents();
    this.setupKeyboardEvents();
  }

  /** Register a callback for the "drop" action */
  onDrop(cb: InputCallback): void {
    this.dropCallbacks.push(cb);
  }

  /** Register a callback for the "pause" action */
  onPause(cb: InputCallback): void {
    this.pauseCallbacks.push(cb);
  }

  /** Enable/disable input (e.g., during menus or game over) */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private fireDrop(): void {
    if (!this.enabled) return;
    for (const cb of this.dropCallbacks) cb();
  }

  private firePause(): void {
    for (const cb of this.pauseCallbacks) cb();
  }

  private setupPointerEvents(): void {
    // Use pointerdown for unified tap/click
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      this.fireDrop();
    }, { passive: false });

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.fireDrop();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        this.firePause();
      }
    });
  }

  /** Clean up event listeners */
  destroy(): void {
    // In a real teardown scenario we'd remove listeners,
    // but since the game lives for the lifetime of the page this is fine.
  }
}
