import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ConcaveCarousel.css';

export interface ConcaveCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  startIndex?: number;
  curvature?: number; // 0 (flat) to 1 (tight drum), default 0.68
  distance?: number; // Distance in panel heights, default 3.8
  tilt?: number; // Viewing angle in degrees, default 0
  gap?: number; // Gap in pixels between cards, default 20
  dim?: number; // Edge dimming factor, default 0.4
  reflection?: number; // Floor reflection strength, default 0.08
  autoplay?: 'off' | 'drift' | 'step';
  speed?: number; // Drift speed in panels per second
  interval?: number; // Seconds between step transitions
  onSelect?: (index: number, item: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ConcaveCarousel<T>({
  items,
  renderItem,
  startIndex = 0,
  curvature = 0.68,
  distance = 3.8,
  tilt = 0,
  gap = 20,
  dim = 0.38,
  reflection = 0.08,
  autoplay = 'off',
  speed = 0.12,
  interval = 4,
  onSelect,
  className = '',
  style = {},
}: ConcaveCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = items.length;

  const initialIdx = Math.max(0, Math.min(startIndex, Math.max(n - 1, 0)));
  const posRef = useRef(initialIdx);
  const targetRef = useRef(initialIdx);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const isHoveredRef = useRef(false);

  const dragRef = useRef<{ startX: number; startPos: number; pointerId: number } | null>(null);
  const dragMovedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(initialIdx);
  const [isDragging, setIsDragging] = useState(false);

  // Position spring & layout physics loop
  const updateLayout = useCallback(
    (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (n === 0) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Handle continuous drift if enabled and not hovered or dragging
      if (autoplay === 'drift' && !isHoveredRef.current && !dragRef.current && !prefersReducedMotion) {
        targetRef.current = (targetRef.current + speed * dt) % n;
      }

      const cur = posRef.current;
      const target = targetRef.current;
      const tau = 0.18; // 180ms exponential smoothing
      const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
      let next = cur + (target - cur) * k;

      if (prefersReducedMotion || Math.abs(target - next) < 0.001) {
        next = target;
      }
      posRef.current = next;

      // Wrap-around active index
      const nearestIdx = ((Math.round(next) % n) + n) % n;
      if (nearestIdx !== activeIndex) {
        setActiveIndex(nearestIdx);
        onSelect?.(nearestIdx, items[nearestIdx]);
      }

      // Panel Dimensions & Math
      const panelWidth = 540;
      const stepAngle = Math.max(0.18, 0.42 * curvature);
      const radius = ((panelWidth + gap) / stepAngle) * (1 / Math.max(curvature, 0.1));

      for (let i = 0; i < n; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;

        let d = i - next;
        // Loop wrap distance if more than 3 items
        if (n > 2) {
          while (d > n / 2) d -= n;
          while (d < -n / 2) d += n;
        }

        const absDist = Math.abs(d);
        const theta = d * stepAngle;

        // Inward concave arc coordinates
        // Z pushes inward (negative) for adjacent cards curving around viewer
        const x = radius * Math.sin(theta);
        const z = -radius * (1 - Math.cos(theta)) * curvature - absDist * 20;
        const rotY = (theta * 180) / Math.PI * curvature;
        const rotX = tilt;

        // Scale & Opacity
        const scale = Math.max(0.72, 1 - absDist * 0.1);
        const opacity = Math.max(0.2, 1 - absDist * dim);
        const blur = absDist > 1.2 ? (absDist - 1.2) * 1.5 : 0;
        const zIndex = Math.round(100 - absDist * 10);

        el.style.transform = `translate3d(${x.toFixed(2)}px, 0px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(opacity.toFixed(3));
        el.style.filter = blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none';
        el.style.zIndex = String(zIndex);
      }

      rafRef.current = requestAnimationFrame(updateLayout);
    },
    [activeIndex, autoplay, curvature, dim, gap, items, n, onSelect, speed, tilt]
  );

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(updateLayout);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateLayout]);

  const snapTo = useCallback(
    (index: number) => {
      targetRef.current = Math.max(0, Math.min(index, n - 1));
    },
    [n]
  );

  const prev = useCallback(() => {
    snapTo(Math.round(targetRef.current) - 1);
  }, [snapTo]);

  const next = useCallback(() => {
    snapTo(Math.round(targetRef.current) + 1);
  }, [snapTo]);

  // Pointer drag interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: e.clientX,
      startPos: targetRef.current,
      pointerId: e.pointerId,
    };
    dragMovedRef.current = false;
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) {
      dragMovedRef.current = true;
    }
    const sensitivity = 380; // Pixels per card shift
    targetRef.current = drag.startPos - dx / sensitivity;
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    try {
      containerRef.current?.releasePointerCapture(drag.pointerId);
    } catch {
      // Ignore pointer release errors
    }
    dragRef.current = null;
    setIsDragging(false);
    snapTo(Math.round(targetRef.current));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  if (n === 0) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Concave Project Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => (isHoveredRef.current = true)}
      onMouseLeave={() => (isHoveredRef.current = false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={`concave-carousel${isDragging ? ' concave-carousel--dragging' : ''} ${className}`.trim()}
      style={style}
    >
      {/* 3D Curved Concave Stage */}
      <div className="concave-carousel__stage">
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={idx}
              ref={(el) => {
                panelRefs.current[idx] = el;
              }}
              className={`concave-carousel__panel${isActive ? ' concave-carousel__panel--active' : ''}`}
              onClick={() => {
                if (!dragMovedRef.current) {
                  snapTo(idx);
                }
              }}
            >
              {renderItem(item, idx, isActive)}
              {reflection > 0 && isActive && <div className="concave-carousel__reflection" />}
            </div>
          );
        })}
      </div>

      {/* Discreet Navigation Controls */}
      <div className="concave-carousel__controls">
        <button
          onClick={prev}
          aria-label="Previous Project"
          className="concave-carousel__btn"
          disabled={activeIndex === 0}
          style={{ opacity: activeIndex === 0 ? 0.35 : 1 }}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <div className="concave-carousel__dots">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => snapTo(idx)}
              aria-label={`Jump to project ${idx + 1}`}
              className={`concave-carousel__dot${activeIndex === idx ? ' concave-carousel__dot--active' : ''}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next Project"
          className="concave-carousel__btn"
          disabled={activeIndex === n - 1}
          style={{ opacity: activeIndex === n - 1 ? 0.35 : 1 }}
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default ConcaveCarousel;
