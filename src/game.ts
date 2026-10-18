/**
 * game.ts — Game loop, state machine, and core gameplay coordination.
 * States: menu → playing → paused → gameover → menu (cycle)
 */

import type { Block, CutPiece } from './block';
import {
  createBaseBlock,
  createSlidingBlock,
  calculateDrop,
  updateCutPiece,
} from './block';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { Input } from './input';
import { Audio } from './audio';
import { ParticleSystem } from './particles';
import { UI } from './ui';
import { getBestScore, setBestScore } from './storage';
import {
  BLOCK_WIDTH_RATIO,
  BLOCK_HEIGHT_RATIO,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MAX_SPEED,
  SLIDE_OVERSHOOT,
  POINTS_PER_BLOCK,
  POINTS_PERFECT_BONUS,
  PERFECT_STREAK_FOR_GROWTH,
  PERFECT_GROWTH_AMOUNT,
  MAX_PLAY_AREA_WIDTH,
  GAME_OVER_DELAY,
  COLLAPSE_GRAVITY,
  SCORE_POP_DURATION,
} from './config';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

/** Collapsing block for game over animation */
interface CollapsingBlock {
  block: Block;
  vy: number;
  vx: number;
  rotation: number;
  rotationSpeed: number;
}

export class Game {
  // ─── Canvas & rendering ────────────────────────────────────────
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private camera: Camera;
  private particles: ParticleSystem;
  private input: Input;
  private audio: Audio;
  private ui: UI;

  // ─── Play area dimensions (in CSS pixels) ─────────────────────
  private playAreaWidth = 0;
  private playAreaHeight = 0;
  private playAreaOffsetX = 0; // centering offset for desktop
  private dpr = 1;

  // ─── Game state ────────────────────────────────────────────────
  state: GameState = 'menu';
  private towerBlocks: Block[] = [];
  private slidingBlock: Block | null = null;
  private cutPieces: CutPiece[] = [];
  private direction = 1; // 1 = right, -1 = left
  private speed = INITIAL_SPEED;
  private blockIndex = 0;

  // ─── Scoring ───────────────────────────────────────────────────
  private score = 0;
  private bestScore = 0;
  private perfectStreak = 0;
  private currentBlockWidth = 0; // tracks width across placements
  private startingBlockWidth = 0;

  // ─── Game over animation ───────────────────────────────────────
  private gameOverTimer = 0;
  private collapsingBlocks: CollapsingBlock[] = [];
  private gameOverShown = false;

  // ─── Animation timing ─────────────────────────────────────────
  private lastTime = 0;
  private _scorePop = 0; // for future use

  // ─── Scale factor for physics that should adapt to screen size ─
  private scaleFactor = 1;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.audio = new Audio();
    this.ui = new UI();

    // Initial sizing
    this.resize();
    this.renderer = new Renderer(this.canvas, this.playAreaWidth, this.playAreaHeight);

    // Input
    this.input = new Input(this.canvas);
    this.input.setEnabled(false);
    this.input.onDrop(() => this.handleDrop());
    this.input.onPause(() => this.handlePause());

    // UI callbacks
    this.ui.onPlay = () => this.startGame();
    this.ui.onResume = () => this.resumeGame();
    this.ui.onRestart = () => this.startGame();
    this.ui.onMainMenu = () => this.goToMenu();
    this.ui.onToggleSound = () => this.toggleSound();
    this.ui.onShowHowToPlay = () => this.ui.showScreen('howToPlay');
    this.ui.onPause = () => this.handlePause();

    // Visibility change → auto-pause
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') {
        this.pauseGame();
      }
    });

    // Window resize
    window.addEventListener('resize', () => this.resize());

    // Load best score and show menu
    this.bestScore = getBestScore();
    this.ui.setBestScoreStart(this.bestScore);
    this.ui.updateSoundButtons(this.audio.enabled);
    this.ui.showScreen('start');

    // Start the loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /** Recalculate play area and canvas dimensions */
  private resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    // Play area: constrained width on desktop, full width on mobile
    this.playAreaWidth = Math.min(cssWidth, MAX_PLAY_AREA_WIDTH);
    this.playAreaHeight = cssHeight;
    this.playAreaOffsetX = (cssWidth - this.playAreaWidth) / 2;

    // Scale factor: how this play area compares to the "reference" 400px width
    this.scaleFactor = this.playAreaWidth / 400;

    // Canvas fills the window
    this.canvas.width = cssWidth * this.dpr;
    this.canvas.height = cssHeight * this.dpr;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    if (this.renderer) {
      this.renderer.updateDimensions(this.playAreaWidth, this.playAreaHeight);
    }
  }

  /** Main game loop */
  private loop(time: number): void {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  /** Update game logic */
  private update(dt: number): void {
    if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'gameover') {
      this.updateGameOver(dt);
    }

    // Always update particles and shake (they may be active during game over)
    this.particles.update(dt);
    this.renderer.updateShake(dt);

    // Score pop timer
    if (this._scorePop > 0) {
      this._scorePop = Math.max(0, this._scorePop - dt);
    }
  }

  /** Update during playing state */
  private updatePlaying(dt: number): void {
    if (!this.slidingBlock) return;

    // Move sliding block
    this.slidingBlock.x += this.speed * this.direction * this.scaleFactor * dt;

    // Bounce off edges
    const halfW = this.slidingBlock.width / 2;
    const overshoot = SLIDE_OVERSHOOT * this.playAreaWidth;
    if (this.direction > 0 && this.slidingBlock.x - halfW > this.playAreaWidth + overshoot) {
      this.slidingBlock.x = -halfW - overshoot;
    } else if (this.direction < 0 && this.slidingBlock.x + halfW < -overshoot) {
      this.slidingBlock.x = this.playAreaWidth + halfW + overshoot;
    }

    // Update camera
    const topBlock = this.towerBlocks[this.towerBlocks.length - 1];
    if (topBlock) {
      const blockH = topBlock.height;
      this.camera.setTarget(topBlock.y - blockH, this.playAreaHeight, blockH);
      this.camera.update(dt);
    }

    // Update cut pieces
    for (let i = this.cutPieces.length - 1; i >= 0; i--) {
      updateCutPiece(this.cutPieces[i], dt);
      if (this.cutPieces[i].lifetime <= 0) {
        this.cutPieces.splice(i, 1);
      }
    }
  }

  /** Update during game over state */
  private updateGameOver(dt: number): void {
    this.gameOverTimer -= dt;

    // Update collapsing blocks
    for (const cb of this.collapsingBlocks) {
      cb.vy += COLLAPSE_GRAVITY * dt;
      cb.block.y += cb.vy * dt;
      cb.block.x += cb.vx * dt;
      cb.rotation += cb.rotationSpeed * dt;
    }

    // Update cut pieces
    for (let i = this.cutPieces.length - 1; i >= 0; i--) {
      updateCutPiece(this.cutPieces[i], dt);
      if (this.cutPieces[i].lifetime <= 0) {
        this.cutPieces.splice(i, 1);
      }
    }

    // Camera still updates
    this.camera.update(dt);

    if (this.gameOverTimer <= 0 && !this.gameOverShown) {
      this.gameOverShown = true;
      this.showGameOverScreen();
    }
  }

  /** Render the current frame */
  private render(): void {
    // If game over with collapsing blocks, render those instead of tower
    let blocksToRender = this.towerBlocks;
    if (this.state === 'gameover' && this.collapsingBlocks.length > 0) {
      blocksToRender = this.collapsingBlocks.map((cb) => {
        // We'd need rotation rendering, but for simplicity just use position offset
        return cb.block;
      });
    }

    this.renderer.render(
      this.camera,
      blocksToRender,
      this.state === 'playing' ? this.slidingBlock : null,
      this.cutPieces,
      this.particles,
      this.dpr,
      this.playAreaOffsetX,
    );
  }

  /** Start / restart the game */
  private startGame(): void {
    // Initialize audio on first user gesture
    this.audio.init();

    // Reset state
    this.state = 'playing';
    this.towerBlocks = [];
    this.cutPieces = [];
    this.collapsingBlocks = [];
    this.particles.clear();
    this.score = 0;
    this.perfectStreak = 0;
    this.blockIndex = 0;
    this.direction = 1;
    this.speed = INITIAL_SPEED;
    this.gameOverTimer = 0;
    this.gameOverShown = false;

    // Calculate block dimensions based on play area
    this.startingBlockWidth = this.playAreaWidth * BLOCK_WIDTH_RATIO;
    this.currentBlockWidth = this.startingBlockWidth;
    const blockHeight = this.playAreaWidth * BLOCK_HEIGHT_RATIO;

    // Create base block
    const base = createBaseBlock(
      this.playAreaWidth,
      this.playAreaHeight,
      this.startingBlockWidth,
      blockHeight,
    );
    this.towerBlocks.push(base);
    this.blockIndex = 1;

    // Set camera to ground
    this.camera.setTarget(base.y, this.playAreaHeight, blockHeight);
    this.camera.snap();

    // Create first sliding block
    this.spawnSlidingBlock();

    // Update UI
    this.ui.showScreen('hud');
    this.ui.setScore(0);
    this.ui.hideCombo();
    this.ui.setPauseButtonVisible(true);
    this.input.setEnabled(true);
  }

  /** Spawn the next sliding block */
  private spawnSlidingBlock(): void {
    const topBlock = this.towerBlocks[this.towerBlocks.length - 1];
    const overshoot = SLIDE_OVERSHOOT * this.playAreaWidth;

    this.slidingBlock = createSlidingBlock(
      topBlock,
      this.currentBlockWidth,
      this.blockIndex,
      this.direction,
      this.playAreaWidth,
      overshoot,
    );
  }

  /** Handle the drop action */
  private handleDrop(): void {
    if (this.state !== 'playing' || !this.slidingBlock) return;

    const topBlock = this.towerBlocks[this.towerBlocks.length - 1];
    const result = calculateDrop(this.slidingBlock, topBlock, this.scaleFactor);

    if (!result.placed) {
      // Total miss — game over
      if (result.cutPiece) {
        this.cutPieces.push(result.cutPiece);
      }
      this.audio.playGameOver();
      this.triggerGameOver();
      return;
    }

    // Place the block
    this.towerBlocks.push(result.placed);
    this.score += POINTS_PER_BLOCK;

    if (result.isPerfect) {
      // Perfect drop!
      this.perfectStreak++;
      this.score += POINTS_PERFECT_BONUS;
      this.audio.playPerfect(this.perfectStreak);

      // Particles
      this.particles.spawnPerfectBurst(
        result.placed.x,
        result.placed.y,
        result.placed.width,
        result.placed.hue,
      );

      // Width growth after streak
      if (this.perfectStreak >= PERFECT_STREAK_FOR_GROWTH) {
        this.currentBlockWidth = Math.min(
          this.startingBlockWidth,
          this.currentBlockWidth + this.startingBlockWidth * PERFECT_GROWTH_AMOUNT,
        );
      }

      // Show combo
      this.ui.showCombo(this.perfectStreak);
    } else {
      // Normal drop
      this.perfectStreak = 0;
      this.currentBlockWidth = result.placed.width;
      this.audio.playDrop();

      // Screen shake on cut
      this.renderer.triggerShake(0.5);

      // Cut piece
      if (result.cutPiece) {
        this.cutPieces.push(result.cutPiece);
        // Cut debris particles
        this.particles.spawnCutDebris(
          result.cutPiece.x,
          result.cutPiece.y,
          result.cutPiece.width,
          result.cutPiece.hue,
          result.cutPiece.vx > 0 ? 1 : -1,
        );
      }

      this.ui.hideCombo();
    }

    // Update score display
    this.ui.setScore(this.score);
    this._scorePop = SCORE_POP_DURATION;

    // Increase speed
    this.speed = Math.min(MAX_SPEED, INITIAL_SPEED + this.blockIndex * SPEED_INCREMENT);

    // Alternate direction
    this.direction *= -1;
    this.blockIndex++;

    // Spawn next sliding block
    this.spawnSlidingBlock();
  }

  /** Trigger game over state */
  private triggerGameOver(): void {
    this.state = 'gameover';
    this.slidingBlock = null;
    this.input.setEnabled(false);
    this.ui.setPauseButtonVisible(false);
    this.gameOverTimer = GAME_OVER_DELAY;
    this.gameOverShown = false;

    // Create collapsing blocks from tower
    this.collapsingBlocks = this.towerBlocks.map((block, i) => {
      const delay = (this.towerBlocks.length - i) * 0.05;
      return {
        block: { ...block },
        vy: -50 - Math.random() * 100 * delay,
        vx: (Math.random() - 0.5) * 80,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 4,
      };
    });

    // Spawn collapse particles
    for (const block of this.towerBlocks.slice(-5)) {
      this.particles.spawnCollapseParticles(
        block.x, block.y, block.width, block.hue,
      );
    }

    // Shake screen
    this.renderer.triggerShake(1.5);
  }

  /** Show the game over screen */
  private showGameOverScreen(): void {
    // Check for new best
    const isNewBest = this.score > this.bestScore;
    if (isNewBest) {
      this.bestScore = this.score;
      setBestScore(this.bestScore);
    }

    this.ui.setGameOverStats(this.score, this.bestScore, isNewBest);
    this.ui.showScreen('gameOver');
  }

  /** Pause the game */
  private pauseGame(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.setEnabled(false);
    this.ui.showScreen('pause');
  }

  /** Resume the game */
  private resumeGame(): void {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.input.setEnabled(true);
    this.lastTime = performance.now(); // prevent time jump
    this.ui.showScreen('hud');
    this.ui.setPauseButtonVisible(true);
  }

  /** Handle pause input */
  private handlePause(): void {
    if (this.state === 'playing') {
      this.pauseGame();
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
  }

  /** Go back to main menu */
  private goToMenu(): void {
    this.state = 'menu';
    this.input.setEnabled(false);
    this.towerBlocks = [];
    this.cutPieces = [];
    this.collapsingBlocks = [];
    this.particles.clear();
    this.slidingBlock = null;
    this.bestScore = getBestScore();
    this.ui.setBestScoreStart(this.bestScore);
    this.ui.showScreen('start');
  }

  /** Toggle sound */
  private toggleSound(): void {
    this.audio.init(); // ensure context is created
    const enabled = this.audio.toggle();
    this.ui.updateSoundButtons(enabled);
  }
}
