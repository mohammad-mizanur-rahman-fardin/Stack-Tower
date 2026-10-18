/**
 * renderer.ts — All canvas drawing.
 * Renders blocks as 3D boxes, background gradients, particles, and glow effects.
 */

import type { Block, CutPiece } from './block';
import { getBlockColor } from './block';
import { Camera } from './camera';
import { ParticleSystem } from './particles';
import {
  BLOCK_3D_TOP_RATIO,
  BLOCK_3D_SIDE_WIDTH,
  TOP_FACE_LIGHTNESS_BOOST,
  SIDE_FACE_LIGHTNESS_REDUCE,
  BG_HUE_START,
  BG_HUE_SHIFT_PER_BLOCK,
  BG_SATURATION,
  BG_LIGHTNESS_TOP,
  BG_LIGHTNESS_BOTTOM,
  SHAKE_DURATION,
  SHAKE_AMPLITUDE,
} from './config';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private shakeTime = 0;
  private shakeIntensity = 0;
  private canvas: HTMLCanvasElement;
  private playAreaWidth: number;
  private playAreaHeight: number;

  constructor(
    canvas: HTMLCanvasElement,
    playAreaWidth: number,
    playAreaHeight: number,
  ) {
    this.canvas = canvas;
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;
    this.ctx = canvas.getContext('2d')!;
  }

  /** Update play area dimensions on resize */
  updateDimensions(playAreaWidth: number, playAreaHeight: number): void {
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;
  }

  /** Trigger screen shake */
  triggerShake(intensity = 1): void {
    this.shakeTime = SHAKE_DURATION;
    this.shakeIntensity = intensity;
  }

  /** Update shake timer */
  updateShake(dt: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
  }

  /** Clear and draw everything */
  render(
    camera: Camera,
    towerBlocks: Block[],
    slidingBlock: Block | null,
    cutPieces: CutPiece[],
    particles: ParticleSystem,
    dpr: number,
    playAreaOffsetX: number,
  ): void {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw background (full canvas, no clip)
    this.drawBackground(ctx, cw / dpr, ch / dpr, towerBlocks.length);

    // Apply play area offset (centering on desktop)
    ctx.save();
    ctx.translate(playAreaOffsetX, 0);

    // Clip to play area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.playAreaWidth, this.playAreaHeight);
    ctx.clip();

    // Apply camera + shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTime > 0) {
      const shakeFactor = this.shakeTime / SHAKE_DURATION;
      shakeX = (Math.random() - 0.5) * SHAKE_AMPLITUDE * shakeFactor * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * SHAKE_AMPLITUDE * shakeFactor * this.shakeIntensity * 2;
    }
    ctx.translate(shakeX, -camera.y + shakeY);

    // Draw tower blocks
    for (const block of towerBlocks) {
      this.drawBlock(ctx, block);
    }

    // Draw sliding block
    if (slidingBlock) {
      this.drawBlock(ctx, slidingBlock);
    }

    // Draw cut pieces
    for (const piece of cutPieces) {
      this.drawCutPiece(ctx, piece);
    }

    // Draw particles
    this.drawParticles(ctx, particles);

    ctx.restore(); // un-clip
    ctx.restore(); // un-translate playAreaOffset

    // Draw side panels on desktop
    if (playAreaOffsetX > 0) {
      this.drawSidePanels(ctx, cw / dpr, ch / dpr, playAreaOffsetX, towerBlocks.length);
    }

    ctx.restore(); // un-scale dpr
  }

  /** Draw the background gradient */
  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    blockCount: number,
  ): void {
    const hue = (BG_HUE_START + blockCount * BG_HUE_SHIFT_PER_BLOCK) % 360;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `hsl(${hue}, ${BG_SATURATION}%, ${BG_LIGHTNESS_TOP}%)`);
    gradient.addColorStop(1, `hsl(${hue}, ${BG_SATURATION}%, ${BG_LIGHTNESS_BOTTOM}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /** Draw side panels for desktop */
  private drawSidePanels(
    ctx: CanvasRenderingContext2D,
    fullWidth: number,
    fullHeight: number,
    offsetX: number,
    blockCount: number,
  ): void {
    const hue = (BG_HUE_START + blockCount * BG_HUE_SHIFT_PER_BLOCK) % 360;
    // Subtle darker overlay on sides
    ctx.fillStyle = `hsla(${hue}, ${BG_SATURATION}%, 5%, 0.4)`;
    ctx.fillRect(0, 0, offsetX, fullHeight);
    ctx.fillRect(offsetX + this.playAreaWidth, 0, fullWidth - offsetX - this.playAreaWidth, fullHeight);

    // Thin border lines
    ctx.strokeStyle = `hsla(${hue}, 40%, 30%, 0.3)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, fullHeight);
    ctx.moveTo(offsetX + this.playAreaWidth, 0);
    ctx.lineTo(offsetX + this.playAreaWidth, fullHeight);
    ctx.stroke();
  }

  /** Draw a 3D block */
  private drawBlock(ctx: CanvasRenderingContext2D, block: Block): void {
    const left = block.x - block.width / 2;
    const topDepth = block.height * BLOCK_3D_TOP_RATIO;
    const sideWidth = Math.min(BLOCK_3D_SIDE_WIDTH, block.width * 0.15);

    // Front face (main)
    ctx.fillStyle = getBlockColor(block.hue);
    ctx.fillRect(left, block.y, block.width, block.height);

    // Top face (lighter)
    ctx.fillStyle = getBlockColor(block.hue, TOP_FACE_LIGHTNESS_BOOST);
    ctx.beginPath();
    ctx.moveTo(left, block.y);
    ctx.lineTo(left + sideWidth, block.y - topDepth);
    ctx.lineTo(left + block.width + sideWidth, block.y - topDepth);
    ctx.lineTo(left + block.width, block.y);
    ctx.closePath();
    ctx.fill();

    // Right side face (darker)
    ctx.fillStyle = getBlockColor(block.hue, -SIDE_FACE_LIGHTNESS_REDUCE);
    ctx.beginPath();
    ctx.moveTo(left + block.width, block.y);
    ctx.lineTo(left + block.width + sideWidth, block.y - topDepth);
    ctx.lineTo(left + block.width + sideWidth, block.y + block.height - topDepth);
    ctx.lineTo(left + block.width, block.y + block.height);
    ctx.closePath();
    ctx.fill();

    // Subtle highlight on front face
    const hlGrad = ctx.createLinearGradient(left, block.y, left, block.y + block.height);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.1)');
    hlGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    hlGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = hlGrad;
    ctx.fillRect(left, block.y, block.width, block.height);
  }

  /** Draw a falling cut piece with rotation */
  private drawCutPiece(ctx: CanvasRenderingContext2D, piece: CutPiece): void {
    ctx.save();
    ctx.translate(piece.x, piece.y + piece.height / 2);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, piece.lifetime));

    const halfW = piece.width / 2;
    const halfH = piece.height / 2;
    const topDepth = piece.height * BLOCK_3D_TOP_RATIO;
    const sideWidth = Math.min(BLOCK_3D_SIDE_WIDTH, piece.width * 0.15);

    // Front face
    ctx.fillStyle = getBlockColor(piece.hue);
    ctx.fillRect(-halfW, -halfH, piece.width, piece.height);

    // Top face
    ctx.fillStyle = getBlockColor(piece.hue, TOP_FACE_LIGHTNESS_BOOST);
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH);
    ctx.lineTo(-halfW + sideWidth, -halfH - topDepth);
    ctx.lineTo(halfW + sideWidth, -halfH - topDepth);
    ctx.lineTo(halfW, -halfH);
    ctx.closePath();
    ctx.fill();

    // Right side
    ctx.fillStyle = getBlockColor(piece.hue, -SIDE_FACE_LIGHTNESS_REDUCE);
    ctx.beginPath();
    ctx.moveTo(halfW, -halfH);
    ctx.lineTo(halfW + sideWidth, -halfH - topDepth);
    ctx.lineTo(halfW + sideWidth, halfH - topDepth);
    ctx.lineTo(halfW, halfH);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** Draw particles and glow rings */
  private drawParticles(ctx: CanvasRenderingContext2D, particles: ParticleSystem): void {
    // Draw glow rings
    for (const ring of particles.glowRings) {
      const alpha = ring.life / ring.maxLife;
      ctx.strokeStyle = `hsla(${ring.hue}, 80%, 70%, ${alpha * 0.6})`;
      ctx.lineWidth = 3 * alpha;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow
      ctx.strokeStyle = `hsla(${ring.hue}, 90%, 85%, ${alpha * 0.3})`;
      ctx.lineWidth = 8 * alpha;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw particles
    for (const p of particles.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue}, 90%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
