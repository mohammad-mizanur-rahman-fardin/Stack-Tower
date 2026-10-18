/**
 * config.ts — All tunable game constants.
 * Change these values to adjust difficulty, visuals, and feel.
 */

// ─── Block Dimensions ────────────────────────────────────────────
/** Starting block width as a fraction of the play area width */
export const BLOCK_WIDTH_RATIO = 0.35;
/** Block height as a fraction of play area width */
export const BLOCK_HEIGHT_RATIO = 0.08;
/** Minimum block width before game over (px, scaled at runtime) */
export const MIN_BLOCK_WIDTH = 5;
/** 3D depth of block top face as fraction of block height */
export const BLOCK_3D_TOP_RATIO = 0.4;
/** 3D depth of block side face as fraction of block height */
export const BLOCK_3D_SIDE_WIDTH = 8;

// ─── Movement & Speed ────────────────────────────────────────────
/** Initial slide speed (pixels per second at 400px play width) */
export const INITIAL_SPEED = 180;
/** Speed increase per block placed */
export const SPEED_INCREMENT = 3;
/** Maximum slide speed */
export const MAX_SPEED = 420;
/** How far off-screen the block starts (fraction of play area width) */
export const SLIDE_OVERSHOOT = 0.15;

// ─── Perfect Drop ────────────────────────────────────────────────
/** Tolerance in pixels for a "perfect" drop (at 400px play width) */
export const PERFECT_TOLERANCE = 5;
/** Consecutive perfects needed to trigger width growth */
export const PERFECT_STREAK_FOR_GROWTH = 3;
/** Width growth per trigger (fraction of original width) */
export const PERFECT_GROWTH_AMOUNT = 0.05;

// ─── Scoring ─────────────────────────────────────────────────────
/** Points per normal block */
export const POINTS_PER_BLOCK = 1;
/** Bonus points for a perfect drop */
export const POINTS_PERFECT_BONUS = 2;

// ─── Camera ──────────────────────────────────────────────────────
/** How far up the screen the top of the tower should sit (0 = top, 1 = bottom) */
export const CAMERA_TARGET_Y_RATIO = 0.6;
/** Camera lerp smoothing factor (higher = faster) */
export const CAMERA_LERP_SPEED = 4;

// ─── Cut Piece Physics ───────────────────────────────────────────
/** Gravity for falling cut pieces (px/s²) */
export const CUT_PIECE_GRAVITY = 1800;
/** Initial horizontal velocity of cut piece */
export const CUT_PIECE_HORIZONTAL_SPEED = 60;
/** Rotation speed of cut piece (radians/s) */
export const CUT_PIECE_ROTATION_SPEED = 3;
/** How long cut pieces live before removal (seconds) */
export const CUT_PIECE_LIFETIME = 2;

// ─── Visual ──────────────────────────────────────────────────────
/** Hue shift per block for rainbow effect (degrees) */
export const HUE_SHIFT_PER_BLOCK = 12;
/** Starting hue */
export const STARTING_HUE = 0;
/** Block saturation (%) */
export const BLOCK_SATURATION = 72;
/** Block lightness (%) */
export const BLOCK_LIGHTNESS = 58;
/** 3D top face lightness boost */
export const TOP_FACE_LIGHTNESS_BOOST = 15;
/** 3D side face lightness reduction */
export const SIDE_FACE_LIGHTNESS_REDUCE = 12;

// ─── Background ──────────────────────────────────────────────────
/** Background gradient top color (changes with tower height) */
export const BG_HUE_START = 220;
/** Background hue shift per block */
export const BG_HUE_SHIFT_PER_BLOCK = 3;
/** Background saturation */
export const BG_SATURATION = 25;
/** Background lightness top */
export const BG_LIGHTNESS_TOP = 15;
/** Background lightness bottom */
export const BG_LIGHTNESS_BOTTOM = 8;

// ─── Screen Shake ────────────────────────────────────────────────
/** Shake duration (seconds) */
export const SHAKE_DURATION = 0.25;
/** Maximum shake amplitude (pixels) */
export const SHAKE_AMPLITUDE = 6;

// ─── Particles ───────────────────────────────────────────────────
/** Number of particles on perfect drop */
export const PERFECT_PARTICLE_COUNT = 24;
/** Number of particles on normal cut */
export const CUT_PARTICLE_COUNT = 8;
/** Particle lifetime (seconds) */
export const PARTICLE_LIFETIME = 0.8;
/** Particle initial speed */
export const PARTICLE_SPEED = 250;
/** Glow ring duration on perfect (seconds) */
export const GLOW_RING_DURATION = 0.5;
/** Glow ring max radius */
export const GLOW_RING_MAX_RADIUS = 80;

// ─── Game Over Tower Collapse ────────────────────────────────────
/** Delay before showing game over screen (seconds) */
export const GAME_OVER_DELAY = 1.5;
/** Tower collapse gravity */
export const COLLAPSE_GRAVITY = 600;

// ─── Audio ───────────────────────────────────────────────────────
/** Master volume (0–1) */
export const MASTER_VOLUME = 0.3;
/** Drop sound frequency */
export const DROP_SOUND_FREQ = 150;
/** Perfect chime base frequency */
export const PERFECT_CHIME_BASE_FREQ = 523;
/** Perfect chime frequency increment per combo */
export const PERFECT_CHIME_FREQ_INCREMENT = 80;
/** Game over sound start frequency */
export const GAME_OVER_FREQ_START = 400;
/** Game over sound end frequency */
export const GAME_OVER_FREQ_END = 80;

// ─── Play Area ───────────────────────────────────────────────────
/** Maximum play area width on desktop (px) */
export const MAX_PLAY_AREA_WIDTH = 500;
/** Play area aspect ratio (height / width) for the game zone */
export const PLAY_AREA_ASPECT_RATIO = 1.6;

// ─── Vibration ───────────────────────────────────────────────────
/** Vibration duration for perfect drop (ms) */
export const VIBRATE_DURATION = 50;

// ─── Animation ───────────────────────────────────────────────────
/** Score pop animation duration (seconds) */
export const SCORE_POP_DURATION = 0.3;
/** Combo text display duration (seconds) */
export const COMBO_TEXT_DURATION = 1.2;
