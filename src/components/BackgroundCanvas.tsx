import React, { useEffect, useRef } from 'react';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 3,
      targetX: width / 2,
      targetY: height / 3,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle nodes for subtle environmental network
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      baseAlpha: number;
    }

    const nodeCount = Math.min(Math.floor((width * height) / 22000), 55);
    const nodes: Node[] = [];

    const colors = [
      '69, 214, 255',  // Primary Cyan #45D6FF
      '138, 180, 255', // Secondary Depth Blue #8AB4FF
      '119, 123, 255', // Tertiary Indigo #777BFF
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.15,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient glow near mouse / focal zone
      const radialGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        Math.max(width * 0.45, 360)
      );
      radialGrad.addColorStop(0, 'rgba(69, 214, 255, 0.035)');
      radialGrad.addColorStop(0.5, 'rgba(119, 123, 255, 0.015)');
      radialGrad.addColorStop(1, 'rgba(7, 9, 13, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Draw connections between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 140;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.14;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(138, 180, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color}, ${node.baseAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
