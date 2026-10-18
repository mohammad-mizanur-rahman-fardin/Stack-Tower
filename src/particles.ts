/**
 * particles.ts — Particle system for visual effects.
 * Perfect-drop bursts, cut debris, and glow rings.
 */

import {
  PERFECT_PARTICLE_COUNT,
  CUT_PARTICLE_COUNT,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
  GLOW_RING_DURATION,
  GLOW_RING_MAX_RADIUS,
} from './config';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  alpha: number;
}

export interface GlowRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  hue: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  glowRings: GlowRing[] = [];

  /** Spawn a burst of particles for a perfect drop */
  spawnPerfectBurst(x: number, y: number, width: number, hue: number): void {
    for (let i = 0; i < PERFECT_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PERFECT_PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
      const speed = PARTICLE_SPEED * (0.5 + Math.random() * 0.8);
      this.particles.push({
        x: x + (Math.random() - 0.5) * width,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: PARTICLE_LIFETIME * (0.6 + Math.random() * 0.4),
        maxLife: PARTICLE_LIFETIME,
        size: 3 + Math.random() * 4,
        hue: hue + Math.random() * 40 - 20,
        alpha: 1,
      });
    }

    // Add glow ring
    this.glowRings.push({
      x,
      y,
      radius: 0,
      maxRadius: GLOW_RING_MAX_RADIUS,
      life: GLOW_RING_DURATION,
      maxLife: GLOW_RING_DURATION,
      hue,
    });
  }

  /** Spawn debris particles when a block is cut */
  spawnCutDebris(x: number, y: number, width: number, hue: number, direction: number): void {
    for (let i = 0; i < CUT_PARTICLE_COUNT; i++) {
      const angle = direction > 0
        ? -Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 2
        : -Math.PI * 3 / 4 + (Math.random() - 0.5) * Math.PI / 2;
      const speed = PARTICLE_SPEED * (0.3 + Math.random() * 0.5);
      this.particles.push({
        x: x + (Math.random() - 0.5) * width * 0.5,
        y: y + Math.random() * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: PARTICLE_LIFETIME * 0.6,
        maxLife: PARTICLE_LIFETIME * 0.6,
        size: 2 + Math.random() * 3,
        hue,
        alpha: 1,
      });
    }
  }

  /** Spawn particles for game over tower collapse */
  spawnCollapseParticles(x: number, y: number, width: number, hue: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = PARTICLE_SPEED * (0.2 + Math.random() * 0.4);
      this.particles.push({
        x: x + (Math.random() - 0.5) * width,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: PARTICLE_LIFETIME * 1.2,
        maxLife: PARTICLE_LIFETIME * 1.2,
        size: 2 + Math.random() * 3,
        hue,
        alpha: 1,
      });
    }
  }

  /** Update all particles */
  update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += 400 * dt; // gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      p.size *= 0.99;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update glow rings
    for (let i = this.glowRings.length - 1; i >= 0; i--) {
      const ring = this.glowRings[i];
      ring.life -= dt;
      const progress = 1 - ring.life / ring.maxLife;
      ring.radius = ring.maxRadius * progress;
      if (ring.life <= 0) {
        this.glowRings.splice(i, 1);
      }
    }
  }

  /** Clear all effects */
  clear(): void {
    this.particles.length = 0;
    this.glowRings.length = 0;
  }
}
