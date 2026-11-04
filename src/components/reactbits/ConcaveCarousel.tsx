import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ConcaveCarousel.css';

export interface ConcaveCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  startIndex?: number;
  curvature?: number; // 0 to 1, controls depth & inward angle
  distance?: number;
  tilt?: number; // Viewing angle in degrees
  gap?: number;
  dim?: number;
  reflection?: number;
  autoplay?: 'off' | 'drift' | 'step';
  speed?: number; // Drift speed
  interval?: number; // Seconds between step transitions (default 4.5)
  onSelect?: (index: number, item: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ConcaveCarousel<T>({
  items,
  renderItem,
  startIndex = 0,
  curvature = 0.5,
  tilt = 0,
  reflection = 0.08,
  autoplay = 'step',
  speed = 0.12,
  interval = 4.5,
  onSelect,
  className = '',
  style = {},
}: ConcaveCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = items.length;

  const initialIdx = Math.max(0, Math.min(startIndex, Math.max(n - 1, 0)));
  const posRef = useRef<number>(initialIdx);
  const targetRef = useRef<number>(initialIdx);
  const lastTimeRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(initialIdx);

  // Interaction & Visibility Refs for reliable autoplay control
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const dragRef = useRef<{ startX: number; startPos: number; pointerId: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const totalDxRef = useRef<number>(0);

  const [activeIndex, setActiveIndex] = useState<number>(initialIdx);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState<number>(0);

  // Modular helper that always returns a positive index in [0, n - 1]
  const modIndex = useCallback(
    (val: number) => {
      return ((Math.round(val) % n) + n) % n;
    },
    [n]
  );

  // Position spring physics & 3D Layered Layout Loop
  const updateLayout = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (n === 0) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Handle continuous drift if configured
      if (
        autoplay === 'drift' &&
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        isVisibleRef.current &&
        !prefersReducedMotion
      ) {
        targetRef.current += speed * dt;
      }

      const cur = posRef.current;
      const target = targetRef.current;
      const tau = 0.20; // 200ms silky exponential spring
      const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
      let next = cur + (target - cur) * k;

      if (prefersReducedMotion || Math.abs(target - next) < 0.001) {
        next = target;
      }
      posRef.current = next;

      // Circular wrap-around active index
      const nearestIdx = modIndex(next);
      if (nearestIdx !== activeIndexRef.current) {
        activeIndexRef.current = nearestIdx;
        setActiveIndex(nearestIdx);
        onSelect?.(nearestIdx, items[nearestIdx]);
      }

      // Responsive calculations
      const containerWidth =
        containerRef.current?.clientWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const isMobile = containerWidth <= 640;
      const isTablet = containerWidth > 640 && containerWidth <= 1024;

      // Spacing and scaling metrics
      const xStep = isMobile ? 32 : isTablet ? 260 : 350;
      const zStep = isMobile ? 70 : 120;
      const rotYStep = isMobile ? 0 : 7 * curvature;

      // Ensure normalized position for smooth modulo distances
      const normalizedNext = ((next % n) + n) % n;

      for (let i = 0; i < n; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;

        // Modular distance around the 5-item ring
        let d = i - normalizedNext;
        while (d > n / 2) d -= n;
        while (d < -n / 2) d += n;

        const absDist = Math.abs(d);

        let x = 0;
        let z = 0;
        let rotY = 0;
        let scale = 1;
        let opacity = 1;
        let blur = 0;
        let zIndex = 30;

        if (isMobile) {
          // Mobile: Center active card dominant, zero horizontal overflow
          if (absDist < 0.01) {
            x = 0;
            z = 0;
            scale = 1;
            opacity = 1;
            blur = 0;
            zIndex = 30;
          } else if (absDist <= 1) {
            x = d * xStep;
            z = -absDist * zStep;
            scale = Math.max(0.88, 1 - absDist * 0.12);
            opacity = Math.max(0, 0.12 * (1 - (absDist - 0.2)));
            blur = absDist * 1.5;
            zIndex = Math.round(20 - absDist * 10);
          } else {
            opacity = 0;
            zIndex = 5;
          }
        } else {
          // Desktop / Tablet: Premium Layered Composition (Inspired by Orion-9 Telemetry)
          if (absDist <= 1) {
            // Center card transitioning to adjacent background card
            x = d * xStep;
            z = -absDist * zStep;
            rotY = -d * rotYStep;
            scale = 1 - absDist * 0.10; // 1.0 at center -> 0.90 at adjacent
            opacity = 1 - absDist * 0.62; // 1.0 at center -> 0.38 at adjacent
            blur = absDist * 1.5;
            zIndex = Math.round(30 - absDist * 10);
          } else {
            // Cards further than adjacent: opacity is 0 so ZERO side-strips appear
            opacity = 0;
            zIndex = 5;
            scale = 0.82;
            x = Math.sign(d) * (xStep + 100);
            z = -zStep - 100;
          }
        }

        const rotX = tilt;
        el.style.transform = `translate3d(${x.toFixed(2)}px, 0px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(opacity.toFixed(3));
        el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = absDist < 0.4 ? 'auto' : 'none';
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
      }
    },
    [autoplay, curvature, items, modIndex, n, onSelect, speed, tilt]
  );

  // Single stable RAF loop using ref pattern to avoid recreation
  const updateLayoutRef = useRef(updateLayout);
  useEffect(() => {
    updateLayoutRef.current = updateLayout;
  }, [updateLayout]);

  useEffect(() => {
    let animId: number;
    lastTimeRef.current = performance.now();
    const loop = (now: number) => {
      updateLayoutRef.current(now);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Viewport visibility via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Continuous modular navigation
  const snapTo = useCallback(
    (index: number) => {
      const current = targetRef.current;
      const normalizedCurrent = ((Math.round(current) % n) + n) % n;
      let diff = index - normalizedCurrent;
      while (diff > n / 2) diff -= n;
      while (diff < -n / 2) diff += n;
      targetRef.current = current + diff;
    },
    [n]
  );

  const prev = useCallback(() => {
    targetRef.current = Math.round(targetRef.current) - 1;
  }, []);

  const next = useCallback(() => {
    targetRef.current = Math.round(targetRef.current) + 1;
  }, []);

  const triggerManualNav = useCallback((action: () => void) => {
    action();
    setAutoplayResetKey((k) => k + 1);
  }, []);

  // Autoplay step timer (4.5s progression with pause guards)
  useEffect(() => {
    if (autoplay !== 'step' || n <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalMs = (interval || 4.5) * 1000;

    const timer = setInterval(() => {
      if (!isHoveredRef.current && !isDraggingRef.current && isVisibleRef.current) {
        next();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoplay, autoplayResetKey, interval, n, next]);

  // Pointer drag & touch swipe interaction (attached strictly to stage)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startX: e.clientX,
      startPos: targetRef.current,
      pointerId: e.pointerId,
    };
    dragMovedRef.current = false;
    totalDxRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    totalDxRef.current = dx;
    if (Math.abs(dx) > 6) {
      if (!dragMovedRef.current) {
        dragMovedRef.current = true;
        try {
          stageRef.current?.setPointerCapture(drag.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      }
      const containerWidth = containerRef.current?.clientWidth || 1200;
      const sensitivity = containerWidth <= 640 ? 190 : 360;
      targetRef.current = drag.startPos - dx / sensitivity;
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (dragMovedRef.current) {
      try {
        stageRef.current?.releasePointerCapture(drag.pointerId);
      } catch {
        // Ignore pointer release errors
      }

      const dx = totalDxRef.current;
      // Swipe gesture snap: if swiped > 35px, advance cleanly in swipe direction
      if (Math.abs(dx) > 35) {
        if (dx < 0) {
          // Swiped left -> advance forward
          targetRef.current = Math.floor(drag.startPos) + 1;
        } else {
          // Swiped right -> advance backward
          targetRef.current = Math.ceil(drag.startPos) - 1;
        }
      } else {
        targetRef.current = Math.round(targetRef.current);
      }
    }

    dragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setAutoplayResetKey((k) => k + 1);
  };

  // Keyboard arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      triggerManualNav(prev);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      triggerManualNav(next);
    }
  };

  if (n === 0) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Specialized Expertise Disciplines Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`concave-carousel${isDragging ? ' concave-carousel--dragging' : ''} ${className}`.trim()}
      style={style}
    >
      {/* 3D Layered Stage */}
      <div
        ref={stageRef}
        className="concave-carousel__stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
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
                  triggerManualNav(() => snapTo(idx));
                }
              }}
            >
              {renderItem(item, idx, isActive)}
              {reflection > 0 && isActive && <div className="concave-carousel__reflection" />}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Pagination Indicators */}
      <div
        className="concave-carousel__controls"
        role="group"
        aria-label="Category navigation controls"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => triggerManualNav(prev)}
          aria-label="Previous Category"
          className="concave-carousel__btn"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <div className="concave-carousel__dots" role="tablist" aria-label="Category navigation dots">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              onClick={() => triggerManualNav(() => snapTo(idx))}
              aria-label={`Jump to category ${idx + 1} of ${n}`}
              className={`concave-carousel__dot${activeIndex === idx ? ' concave-carousel__dot--active' : ''}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => triggerManualNav(next)}
          aria-label="Next Category"
          className="concave-carousel__btn"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default ConcaveCarousel;
