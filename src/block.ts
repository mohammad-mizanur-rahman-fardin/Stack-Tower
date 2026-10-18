/**
 * block.ts — Block logic: creation, slicing, perfect-drop detection.
 */

import {
  PERFECT_TOLERANCE,
  CUT_PIECE_GRAVITY,
  CUT_PIECE_HORIZONTAL_SPEED,
  CUT_PIECE_ROTATION_SPEED,
  CUT_PIECE_LIFETIME,
  HUE_SHIFT_PER_BLOCK,
  STARTING_HUE,
  BLOCK_SATURATION,
  BLOCK_LIGHTNESS,
} from './config';

/** A placed or sliding block */
export interface Block {
  x: number;       // center x in world space
  y: number;       // top edge y in world space
  width: number;   // current width
  height: number;  // block height
  hue: number;     // HSL hue for color
}

/** A cut-off piece that falls away */
export interface CutPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  hue: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
}

/** Result of dropping a block onto the tower */
export interface DropResult {
  /** The new block to add to the tower (null if missed entirely) */
  placed: Block | null;
  /** The cut-off piece (null if perfect or total miss) */
  cutPiece: CutPiece | null;
  /** Whether this was a perfect drop */
  isPerfect: boolean;
  /** Overlap amount (0 = total miss) */
  overlap: number;
}

/** Get the color for a block at a given index */
export function getBlockHue(index: number): number {
  return (STARTING_HUE + index * HUE_SHIFT_PER_BLOCK) % 360;
}

/** Get the HSL color string for a block */
export function getBlockColor(hue: number, lightnessOffset = 0): string {
  return `hsl(${hue}, ${BLOCK_SATURATION}%, ${BLOCK_LIGHTNESS + lightnessOffset}%)`;
}

/**
 * Create the base block.
 * @param playAreaWidth - width of the play area in game pixels
 * @param canvasHeight - height of the canvas
 * @param blockWidth - starting block width
 * @param blockHeight - block height
 */
export function createBaseBlock(
  playAreaWidth: number,
  canvasHeight: number,
  blockWidth: number,
  blockHeight: number,
): Block {
  return {
    x: playAreaWidth / 2,
    y: canvasHeight - blockHeight,
    width: blockWidth,
    height: blockHeight,
    hue: getBlockHue(0),
  };
}

/**
 * Create a new sliding block above the tower.
 * @param topBlock - the current top block of the tower
 * @param newWidth - the width for the new block
 * @param index - block index (for color)
 * @param direction - 1 = left-to-right, -1 = right-to-left
 * @param playAreaWidth - play area width
 * @param overshoot - how far offscreen the block starts
 */
export function createSlidingBlock(
  topBlock: Block,
  newWidth: number,
  index: number,
  direction: number,
  playAreaWidth: number,
  overshoot: number,
): Block {
  const startX = direction > 0
    ? -newWidth / 2 - overshoot
    : playAreaWidth + newWidth / 2 + overshoot;

  return {
    x: startX,
    y: topBlock.y - topBlock.height,
    width: newWidth,
    height: topBlock.height,
    hue: getBlockHue(index),
  };
}

/**
 * Calculate the drop result when a sliding block is placed.
 * @param sliding - the sliding block being dropped
 * @param top - the current top block of the tower
 * @param scaleFactor - scale factor for tolerance adjustment
 */
export function calculateDrop(
  sliding: Block,
  top: Block,
  scaleFactor: number,
): DropResult {
  const tolerance = PERFECT_TOLERANCE * scaleFactor;

  // Calculate overlap
  const slidingLeft = sliding.x - sliding.width / 2;
  const slidingRight = sliding.x + sliding.width / 2;
  const topLeft = top.x - top.width / 2;
  const topRight = top.x + top.width / 2;

  const overlapLeft = Math.max(slidingLeft, topLeft);
  const overlapRight = Math.min(slidingRight, topRight);
  const overlap = overlapRight - overlapLeft;

  // Total miss
  if (overlap <= 0) {
    return {
      placed: null,
      cutPiece: {
        x: sliding.x,
        y: sliding.y,
        width: sliding.width,
        height: sliding.height,
        hue: sliding.hue,
        vx: sliding.x > top.x ? CUT_PIECE_HORIZONTAL_SPEED : -CUT_PIECE_HORIZONTAL_SPEED,
        vy: 0,
        rotation: 0,
        rotationSpeed: sliding.x > top.x ? CUT_PIECE_ROTATION_SPEED : -CUT_PIECE_ROTATION_SPEED,
        lifetime: CUT_PIECE_LIFETIME,
      },
      isPerfect: false,
      overlap: 0,
    };
  }

  // Check for perfect drop
  const offset = Math.abs(sliding.x - top.x);
  if (offset <= tolerance) {
    // Perfect — snap to alignment, keep full width
    return {
      placed: {
        x: top.x,
        y: sliding.y,
        width: sliding.width,
        height: sliding.height,
        hue: sliding.hue,
      },
      cutPiece: null,
      isPerfect: true,
      overlap: sliding.width,
    };
  }

  // Normal drop — slice off the overhanging part
  const placedCenterX = (overlapLeft + overlapRight) / 2;
  const placedWidth = overlap;

  // Determine which side was cut off
  const cutWidth = sliding.width - overlap;
  const cutOnRight = slidingRight > topRight;
  const cutCenterX = cutOnRight
    ? overlapRight + cutWidth / 2
    : overlapLeft - cutWidth / 2;

  return {
    placed: {
      x: placedCenterX,
      y: sliding.y,
      width: placedWidth,
      height: sliding.height,
      hue: sliding.hue,
    },
    cutPiece: {
      x: cutCenterX,
      y: sliding.y,
      width: cutWidth,
      height: sliding.height,
      hue: sliding.hue,
      vx: cutOnRight ? CUT_PIECE_HORIZONTAL_SPEED : -CUT_PIECE_HORIZONTAL_SPEED,
      vy: 0,
      rotation: 0,
      rotationSpeed: cutOnRight ? CUT_PIECE_ROTATION_SPEED : -CUT_PIECE_ROTATION_SPEED,
      lifetime: CUT_PIECE_LIFETIME,
    },
    isPerfect: false,
    overlap,
  };
}

/** Update a cut piece's physics */
export function updateCutPiece(piece: CutPiece, dt: number): void {
  piece.vy += CUT_PIECE_GRAVITY * dt;
  piece.x += piece.vx * dt;
  piece.y += piece.vy * dt;
  piece.rotation += piece.rotationSpeed * dt;
  piece.lifetime -= dt;
}
