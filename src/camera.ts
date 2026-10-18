/**
 * camera.ts — Smooth vertical camera scrolling.
 * Keeps the top of the tower visible in the lower-middle of the screen.
 */

import { CAMERA_LERP_SPEED, CAMERA_TARGET_Y_RATIO } from './config';

export class Camera {
  /** Current camera Y offset (positive = scrolled up) */
  y = 0;
  /** Target Y offset */
  private targetY = 0;

  /**
   * Set the target based on where the top of the tower is.
   * @param towerTopWorldY The Y coordinate of the top block in world space (lower Y = higher)
   * @param canvasHeight The visible canvas height
   * @param blockHeight Height of a single block
   */
  setTarget(towerTopWorldY: number, canvasHeight: number, _blockHeight: number): void {
    // We want towerTopWorldY to appear at CAMERA_TARGET_Y_RATIO of the screen
    const desiredScreenY = canvasHeight * CAMERA_TARGET_Y_RATIO;
    this.targetY = towerTopWorldY - desiredScreenY;

    // Don't scroll down below the ground
    if (this.targetY > 0) {
      this.targetY = 0;
    }
  }

  /** Smoothly interpolate toward target */
  update(dt: number): void {
    this.y += (this.targetY - this.y) * Math.min(1, CAMERA_LERP_SPEED * dt);
  }

  /** Snap camera to target immediately (for game start) */
  snap(): void {
    this.y = this.targetY;
  }
}
