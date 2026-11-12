import React, { useEffect, useRef } from 'react';

interface GlobalFlameAtmosphereProps {
  reducedMotion?: boolean;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmplitude: number;
  phase: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  sparkleSpeed: number;
}

/**
 * GLOBAL FLAME & CRIMSON EMBER ATMOSPHERE SYSTEM
 *
 * Implements a persistent, luxury atmospheric fire & ember environment
 * across the entire public website (Hero, About, Experience, Projects,
 * Accreditations, Academics, Contact, Footer).
 *
 * Features:
 * - Deep crimson and warm embers (#FF1E42, #DC143C, #FF4500, #FF6B35)
 * - Gentle heat-like ambient crimson illumination at the bottom and section boundaries
 * - Restrained, slow upward particle drift with organic turbulence
 * - High performance: single canvas, paused when tab is hidden or reduced motion enabled
 * - Non-interactive (pointer-events: none), zero interference with clicks, scrolling, or glassmorphism
 */
export const GlobalFlameAtmosphere: React.FC<GlobalFlameAtmosphereProps> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const emberCount = isMobile ? 22 : 44;

    const emberColors = [
      '#FF1E42', // Vivid crimson
      '#DC143C', // Deep crimson
      '#FF3344', // Ruby flame
      '#FF4500', // Red-orange ember
      '#FF6B35', // Warm ember spark
      '#A8081E', // Dark velvet crimson
    ];

    const createEmber = (initialRandomY = false): Ember => {
      const size = Math.random() * (isMobile ? 1.8 : 2.4) + 0.8;
      return {
        x: Math.random() * width,
        y: initialRandomY ? Math.random() * height : height + Math.random() * 20,
        size,
        speedY: Math.random() * 0.45 + 0.22, // Slow, elegant upward movement
        speedX: (Math.random() - 0.5) * 0.2,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmplitude: Math.random() * 0.6 + 0.3,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.3,
        baseAlpha: Math.random() * 0.4 + 0.35,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        sparkleSpeed: Math.random() * 0.03 + 0.015,
      };
    };

    const embers: Ember[] = Array.from({ length: emberCount }, () => createEmber(true));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // If reduced motion is requested, render one soft static ambient glow and stop
    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      const staticGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.85,
        100,
        width * 0.5,
        height * 0.85,
        width * 0.65
      );
      staticGradient.addColorStop(0, 'rgba(168, 8, 30, 0.05)');
      staticGradient.addColorStop(1, 'rgba(5, 5, 8, 0)');
      ctx.fillStyle = staticGradient;
      ctx.fillRect(0, 0, width, height);

      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    let tick = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible) return;

      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle, slow-pulsing ambient crimson heat glow at the lower screen
      const ambientPulse = Math.sin(tick * 0.015) * 0.015 + 0.045;
      const heatGradient = ctx.createRadialGradient(
        width * 0.65,
        height * 0.95,
        50,
        width * 0.65,
        height * 0.95,
        width * 0.75
      );
      heatGradient.addColorStop(0, `rgba(180, 16, 36, ${ambientPulse * 1.2})`);
      heatGradient.addColorStop(0.5, `rgba(120, 8, 22, ${ambientPulse * 0.5})`);
      heatGradient.addColorStop(1, 'rgba(5, 5, 8, 0)');
      ctx.fillStyle = heatGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Secondary soft crimson warmth on left-center to balance section atmosphere
      const leftHeatGradient = ctx.createRadialGradient(
        width * 0.2,
        height * 0.5,
        40,
        width * 0.2,
        height * 0.5,
        width * 0.5
      );
      const leftPulse = Math.cos(tick * 0.012) * 0.01 + 0.025;
      leftHeatGradient.addColorStop(0, `rgba(160, 12, 28, ${leftPulse})`);
      leftHeatGradient.addColorStop(1, 'rgba(5, 5, 8, 0)');
      ctx.fillStyle = leftHeatGradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Render individual drifting crimson ember particles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < embers.length; i++) {
        const ember = embers[i];

        ember.y -= ember.speedY;
        ember.x += Math.sin(tick * ember.swaySpeed + ember.phase) * ember.swayAmplitude + ember.speedX;

        // Twinkle / flame breathing
        const sparkle = Math.sin(tick * ember.sparkleSpeed + ember.phase);
        const currentAlpha = Math.max(0.08, Math.min(0.85, ember.baseAlpha + sparkle * 0.22));

        // Fade out near the top
        const fadeNearTop = ember.y < 120 ? Math.max(0, ember.y / 120) : 1;
        const finalAlpha = currentAlpha * fadeNearTop;

        // Soft glowing particle
        const grad = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.size * 2.8);
        grad.addColorStop(0, ember.color);
        grad.addColorStop(0.4, ember.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Inner hot core
        ctx.fillStyle = '#FFAA99';
        ctx.globalAlpha = finalAlpha * 0.75;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Reset if drifted past top or sides
        if (ember.y < -20 || ember.x < -30 || ember.x > width + 30) {
          embers[i] = createEmber(false);
        }
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion]);

  return (
    <div
      className="global-flame-atmosphere-layer"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2, // Sits above global background, floats behind and through section surfaces
        overflow: 'hidden',
        mixBlendMode: 'screen',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
