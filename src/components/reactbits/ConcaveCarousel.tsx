import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ConcaveCarousel.css';

export interface ConcaveCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  startIndex?: number;
  curvature?: number; // Kept for API compatibility
  distance?: number;
  tilt?: number; // Kept for API compatibility
  gap?: number;
  dim?: number;
  reflection?: number; // Kept for API compatibility
  autoplay?: 'off' | 'drift' | 'step';
  speed?: number;
  interval?: number; // Seconds between step transitions (default 4.5)
  onSelect?: (index: number, item: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface LayoutMetrics {
  panelWidth: number;
  panelGap: number;
  isCompact: boolean;
}

function getLayoutMetrics(containerWidth: number, customGap?: number): LayoutMetrics {
  const safeWidth = containerWidth > 0 ? containerWidth : 1200;
  if (safeWidth <= 640) {
    return {
      panelWidth: Math.max(240, Math.min(400, safeWidth)),
      panelGap: 16,
      isCompact: true,
    };
  }
  if (safeWidth <= 1024) {
    return {
      panelWidth: Math.min(540, Math.round(safeWidth * 0.78)),
      panelGap: 22,
      isCompact: false,
    };
  }
  return {
    panelWidth: Math.min(620, Math.round(safeWidth * 0.56)),
    panelGap: customGap ?? 28,
    isCompact: false,
  };
}

export function ConcaveCarousel<T>({
  items,
  renderItem,
  startIndex = 0,
  gap,
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
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = items.length;

  const initialIdx = Math.max(0, Math.min(startIndex, Math.max(n - 1, 0)));
  const posRef = useRef<number>(initialIdx);
  const targetRef = useRef<number>(initialIdx);
  const lastTimeRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(initialIdx);

  // Interaction & Visibility Refs for reliable autoplay and drag control
  const isHoveredRef = useRef<boolean>(false);
  const isFocusedRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPos: number;
    pointerId: number;
    pointerType: string;
    directionLocked: 'horizontal' | 'vertical' | null;
    lastX: number;
    lastTime: number;
    velocityPxPerMs: number;
  } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const totalDxRef = useRef<number>(0);

  const [activeIndex, setActiveIndex] = useState<number>(initialIdx);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [uniformHeight, setUniformHeight] = useState<number>(0);

  const metrics = getLayoutMetrics(containerWidth, gap);

  const measurePanels = useCallback(() => {
    let maxH = 0;
    for (let i = 0; i < n; i++) {
      const el = measureRefs.current[i];
      if (el) {
        // offsetHeight / scrollHeight report unscaled layout dimensions accurately
        const h = Math.ceil(Math.max(el.offsetHeight, el.scrollHeight));
        if (h > maxH) maxH = h;
      }
    }
    if (maxH > 0) {
      setUniformHeight((prevH) => (prevH !== maxH ? maxH : prevH));
    }
  }, [n]);

  // Observe container width & natural content height across all panels so cards stay identical height with zero internal scrollbars
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMeasure = () => {
      const width = container.clientWidth || window.innerWidth || 1200;
      setContainerWidth((prevWidth) => (prevWidth !== width ? width : prevWidth));
      measurePanels();
    };

    handleMeasure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(handleMeasure);
      });
      ro.observe(container);
      measureRefs.current.forEach((el) => {
        if (el) ro.observe(el);
      });
      return () => ro.disconnect();
    }

    window.addEventListener('resize', handleMeasure);
    return () => window.removeEventListener('resize', handleMeasure);
  }, [measurePanels, items]);

  // Re-measure right after panelWidth updates across breakpoints
  useEffect(() => {
    const raf = requestAnimationFrame(measurePanels);
    return () => cancelAnimationFrame(raf);
  }, [measurePanels, metrics.panelWidth]);

  // Ensure re-measure once webfonts settle
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (!cancelled) measurePanels();
      });
      return () => {
        cancelled = true;
      };
    }
  }, [measurePanels]);

  const modIndex = useCallback(
    (val: number) => {
      return ((Math.round(val) % n) + n) % n;
    },
    [n]
  );

  // Horizontal spring physics & clean non-overlapping card layout loop
  const updateLayout = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (n === 0) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (
        autoplay === 'drift' &&
        !isHoveredRef.current &&
        !isFocusedRef.current &&
        !isDraggingRef.current &&
        isVisibleRef.current &&
        !prefersReducedMotion
      ) {
        targetRef.current += speed * dt;
      }

      const cur = posRef.current;
      const target = targetRef.current;
      const tau = isDraggingRef.current ? 0.04 : 0.12;
      const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
      let next = cur + (target - cur) * k;

      if (prefersReducedMotion || Math.abs(target - next) < 0.002) {
        next = target;
      }
      posRef.current = next;

      const nearestIdx = modIndex(next);
      if (nearestIdx !== activeIndexRef.current) {
        activeIndexRef.current = nearestIdx;
        setActiveIndex(nearestIdx);
        onSelect?.(nearestIdx, items[nearestIdx]);
      }

      const liveWidth =
        containerRef.current?.clientWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const currentMetrics = getLayoutMetrics(liveWidth, gap);
      const stepPx = currentMetrics.panelWidth + currentMetrics.panelGap;
      const normalizedNext = ((next % n) + n) % n;

      for (let i = 0; i < n; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;

        let d = i - normalizedNext;
        while (d > n / 2) d -= n;
        while (d < -n / 2) d += n;

        const absDist = Math.abs(d);
        const x = d * stepPx;

        let scale = 1;
        let opacity = 1;
        let zIndex = 10;

        if (currentMetrics.isCompact) {
          // Mobile: centered active panel, smooth horizontal transition with zero stacked ghost cards
          scale = Math.max(0.96, 1 - Math.min(absDist, 1) * 0.04);
          opacity = absDist <= 1.05 ? Math.max(0, 1 - absDist * 0.72) : 0;
          zIndex = absDist < 0.5 ? 20 : 10;
        } else {
          // Desktop / Tablet: crisp Apple-style horizontal alignment without overlapping panels
          scale = 1 - Math.min(absDist, 1.35) * 0.055; // 1.0 center -> ~0.945 adjacent
          if (absDist <= 1) {
            opacity = 1 - absDist * 0.56; // 1.0 center -> 0.44 adjacent
          } else if (absDist <= 1.45) {
            const fadeT = (absDist - 1) / 0.45;
            opacity = Math.max(0, 0.44 * (1 - fadeT));
          } else {
            opacity = 0;
          }
          zIndex = absDist < 0.5 ? 20 : 10;
        }

        el.style.width = `${currentMetrics.panelWidth}px`;
        el.style.marginLeft = `${-currentMetrics.panelWidth / 2}px`;
        el.style.transform = `translate3d(${x.toFixed(2)}px, 0px, 0px) scale(${scale.toFixed(4)})`;
        el.style.opacity = String(opacity.toFixed(3));
        el.style.filter = 'none';
        el.style.zIndex = String(zIndex);
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        el.style.pointerEvents = (
          currentMetrics.isCompact ? absDist < 0.45 : absDist <= 1.08 && opacity > 0.15
        )
          ? 'auto'
          : 'none';
      }
    },
    [autoplay, gap, items, modIndex, n, onSelect, speed]
  );

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

  const snapTo = useCallback(
    (index: number) => {
      const current = targetRef.current;
      const normalizedCurrent = ((Math.round(current) % n) + n) % n;
      let diff = index - normalizedCurrent;
      while (diff > n / 2) diff -= n;
      while (diff < -n / 2) diff += n;
      targetRef.current = Math.round(current) + diff;
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

  // Autoplay step timer (paused cleanly on hover, focus, drag, or reduced motion)
  useEffect(() => {
    if (autoplay !== 'step' || n <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalMs = (interval || 4.5) * 1000;

    const timer = setInterval(() => {
      if (!isHoveredRef.current && !isFocusedRef.current && !isDraggingRef.current && isVisibleRef.current) {
        next();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoplay, autoplayResetKey, interval, n, next]);

  // 1:1 Pointer Drag & Touch Swipe with Vertical Scroll Lock Guard
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: posRef.current,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      directionLocked: null,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocityPxPerMs: 0,
    };
    dragMovedRef.current = false;
    totalDxRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.directionLocked === 'vertical') return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    totalDxRef.current = dx;

    if (!drag.directionLocked) {
      if (drag.pointerType === 'touch' && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        drag.directionLocked = 'vertical';
        dragRef.current = null;
        isDraggingRef.current = false;
        setIsDragging(false);
        return;
      }

      if (Math.abs(dx) > 6 && (drag.pointerType !== 'touch' || Math.abs(dx) >= Math.abs(dy))) {
        drag.directionLocked = 'horizontal';
        dragMovedRef.current = true;
        isDraggingRef.current = true;
        setIsDragging(true);
        try {
          stageRef.current?.setPointerCapture(drag.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      } else {
        return;
      }
    }

    const now = performance.now();
    const dtMs = Math.max(1, now - drag.lastTime);
    const instantVel = (e.clientX - drag.lastX) / dtMs;
    drag.velocityPxPerMs = drag.velocityPxPerMs * 0.65 + instantVel * 0.35;
    drag.lastX = e.clientX;
    drag.lastTime = now;

    const liveWidth = containerRef.current?.clientWidth || containerWidth || 1200;
    const currentMetrics = getLayoutMetrics(liveWidth, gap);
    const stepPx = currentMetrics.panelWidth + currentMetrics.panelGap;
    targetRef.current = drag.startPos - dx / stepPx;
  };

  const handlePointerEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;

    if (dragMovedRef.current) {
      try {
        stageRef.current?.releasePointerCapture(drag.pointerId);
      } catch {
        // Ignore pointer release errors
      }

      const dx = totalDxRef.current;
      const liveWidth = containerRef.current?.clientWidth || containerWidth || 1200;
      const currentMetrics = getLayoutMetrics(liveWidth, gap);
      const stepPx = currentMetrics.panelWidth + currentMetrics.panelGap;
      const startSnap = Math.round(drag.startPos);
      const currentSnap = Math.round(targetRef.current);

      if (currentSnap !== startSnap) {
        targetRef.current = currentSnap;
      } else if (Math.abs(drag.velocityPxPerMs) > 0.28 || Math.abs(dx) > Math.min(64, stepPx * 0.16)) {
        targetRef.current = startSnap + (dx < 0 ? 1 : -1);
      } else {
        targetRef.current = startSnap;
      }
    }

    dragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setAutoplayResetKey((k) => k + 1);
  };

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
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          isFocusedRef.current = false;
        }
      }}
      className={`concave-carousel${isDragging ? ' concave-carousel--dragging' : ''}${
        metrics.isCompact ? ' concave-carousel--compact' : ''
      } ${className}`.trim()}
      style={style}
    >
      {/* Clean Horizontal Centered Track Stage */}
      <div
        ref={stageRef}
        className="concave-carousel__stage"
        style={uniformHeight > 0 ? { height: `${uniformHeight}px` } : undefined}
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
              style={{
                width: `${metrics.panelWidth}px`,
                marginLeft: `${-metrics.panelWidth / 2}px`,
                height: uniformHeight > 0 ? `${uniformHeight}px` : undefined,
              }}
              aria-hidden={!isActive}
              onClick={() => {
                if (!dragMovedRef.current && idx !== activeIndex) {
                  triggerManualNav(() => snapTo(idx));
                }
              }}
            >
              <div
                ref={(el) => {
                  measureRefs.current[idx] = el;
                }}
                className="concave-carousel__panel-measure"
              >
                {renderItem(item, idx, isActive)}
              </div>
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
          <ChevronLeft size={19} strokeWidth={2} />
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
          <ChevronRight size={19} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default ConcaveCarousel;
