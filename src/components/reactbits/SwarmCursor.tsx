import React, { useEffect, useRef } from 'react';

interface SwarmCursorProps {
  particleCount?: number;
  color?: string;
  maxRadius?: number;
  interactiveElementsSelector?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  speed: number;
  friction: number;
  angle: number;
  angularSpeed: number;
  orbitRadius: number;
}

export const SwarmCursor: React.FC<SwarmCursorProps> = ({
  particleCount = 28,
  color = '217, 221, 227', // Metallic Silver #D9DDE3
  maxRadius = 1.8,
  interactiveElementsSelector = 'button, a, input, textarea, select, [role="button"], .interactive-target',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Check for reduced motion and pointer capabilities
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchOnly = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion || isTouchOnly) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates with inertia
    let mouse = { x: width / 2, y: height / 2 };
    let smoothMouse = { x: width / 2, y: height / 2 };
    let isMoving = false;
    let mouseTimer: any = null;
    let isHoveringInteractive = false;
    let isTabVisible = true;

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Pointer move handler with throttle
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMoving = true;

      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        isMoving = false;
      }, 120);

      // Check if hovering interactive element subtly
      const target = e.target as HTMLElement | null;
      if (target && target.closest(interactiveElementsSelector)) {
        isHoveringInteractive = true;
      } else {
        isHoveringInteractive = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle tab visibility
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize Particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const dist = 6 + Math.random() * 18;
      particles.push({
        x: mouse.x,
        y: mouse.y,
        vx: 0,
        vy: 0,
        originX: mouse.x + Math.cos(angle) * dist,
        originY: mouse.y + Math.sin(angle) * dist,
        size: 0.8 + Math.random() * (maxRadius - 0.8),
        alpha: 0.15 + Math.random() * 0.45,
        targetAlpha: 0.2 + Math.random() * 0.5,
        speed: 0.08 + Math.random() * 0.08,
        friction: 0.86 + Math.random() * 0.05,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.035,
        orbitRadius: 10 + Math.random() * 22,
      });
    }

    // Render loop
    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation (inertia)
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.16;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.16;

      const spreadMultiplier = isHoveringInteractive ? 1.6 : 1.0;
      const speedMultiplier = isMoving ? 1.3 : 0.7;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Orbit calculation around smooth cursor
        p.angle += p.angularSpeed * speedMultiplier;
        const targetX = smoothMouse.x + Math.cos(p.angle) * p.orbitRadius * spreadMultiplier;
        const targetY = smoothMouse.y + Math.sin(p.angle) * p.orbitRadius * spreadMultiplier;

        // Spring physics toward target
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        p.vx += dx * p.speed;
        p.vy += dy * p.speed;
        p.vx *= p.friction;
        p.vy *= p.friction;

        p.x += p.vx;
        p.y += p.vy;

        // Subtle alpha pulsation
        p.alpha += (p.targetAlpha - p.alpha) * 0.08;
        if (Math.random() < 0.02) {
          p.targetAlpha = 0.15 + Math.random() * 0.5;
        }

        // Draw refined metallic particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha * (isMoving ? 0.9 : 0.6)})`;
        ctx.fill();

        // Very subtle connector line to adjacent particle if close
        if (i > 0) {
          const prev = particles[i - 1];
          const distSq = (p.x - prev.x) ** 2 + (p.y - prev.y) ** 2;
          if (distSq < 400) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(prev.x, prev.y);
            ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - distSq / 400)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(mouseTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, color, maxRadius, interactiveElementsSelector]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2, // Behind interactive elements (which have z-index >= 10)
        opacity: 0.92,
      }}
      aria-hidden="true"
    />
  );
};
