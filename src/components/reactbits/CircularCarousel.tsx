import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CircularCarousel.css';

export interface CircularCarouselItem {
  src?: string;
  title?: string;
  subtitle?: string;
  alt?: string;
  [key: string]: any;
}

export interface CircularCarouselProps<T = CircularCarouselItem> {
  items: T[];
  preset?: 'cylinder' | 'orbit' | 'wheel' | 'panorama';
  intro?: 'rise' | 'assemble' | 'spin' | 'none';
  cardWidth?: number;
  aspectRatio?: number;
  speed?: number; // degrees per second drift (default: 6)
  captions?: boolean;
  gap?: number;
  tilt?: number; // degrees (default: -1)
  curve?: number; // 0 to 1 (default: 0.81)
  parallax?: number; // 0 to 1 (default: 0.63)
  cornerRadius?: number; // border radius (default: 23)
  renderCard?: (item: T, index: number, isCenter: boolean) => React.ReactNode;
  onSelect?: (item: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CircularCarousel<T = CircularCarouselItem>({
  items,
  preset = 'cylinder',
  intro = 'rise',
  cardWidth = 268,
  aspectRatio = 1,
  speed = 6,
  captions = true,
  gap = 52,
  tilt = -1,
  curve = 0.81,
  parallax = 0.63,
  cornerRadius = 23,
  renderCard,
  onSelect,
  className = '',
  style = {},
}: CircularCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const n = items.length;
  const angleStep = n > 0 ? 360 / n : 360;

  // Rotation angles in degrees
  const angleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);

  // Interaction & Visibility State
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const dragRef = useRef<{ startX: number; startAngle: number; pointerId: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const totalDxRef = useRef<number>(0);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState<number>(0);

  // Intro mount trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  // Viewport intersection observer
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

  // Update layout loop
  const updateLayout = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (n === 0) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Autoplay drift: advances targetAngle when not hovered or dragging
      if (
        speed > 0 &&
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        isVisibleRef.current &&
        !prefersReducedMotion
      ) {
        targetAngleRef.current += speed * dt;
      }

      const cur = angleRef.current;
      const target = targetAngleRef.current;
      const tau = 0.22; // smooth spring
      const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
      let next = cur + (target - cur) * k;

      if (prefersReducedMotion || Math.abs(target - next) < 0.01) {
        next = target;
      }
      angleRef.current = next;

      // Determine nearest active index (front-facing card)
      // Normalize rotation angle
      const normalizedAngle = ((next % 360) + 360) % 360;
      let nearestIdx = Math.round(normalizedAngle / angleStep) % n;
      if (nearestIdx < 0) nearestIdx += n;

      if (nearestIdx !== activeIndexRef.current) {
        activeIndexRef.current = nearestIdx;
        setActiveIndex(nearestIdx);
        onSelect?.(items[nearestIdx], nearestIdx);
      }

      // Responsive card dimensions
      const containerWidth =
        containerRef.current?.clientWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const isMobile = containerWidth <= 640;
      const isTablet = containerWidth > 640 && containerWidth <= 1024;

      const effectiveCardWidth = isMobile
        ? Math.min(220, containerWidth * 0.72)
        : isTablet
        ? Math.min(248, containerWidth * 0.45)
        : cardWidth;
      const effectiveCardHeight = effectiveCardWidth / aspectRatio;
      const effectiveGap = isMobile ? 22 : isTablet ? 36 : gap;

      // Cylinder radius: based on perimeter or minimum depth
      const perimeter = Math.max(n * (effectiveCardWidth + effectiveGap), 1100);
      const radius = Math.max(380, perimeter / (2 * Math.PI));

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // Card's baseline angle
        const cardAngle = i * angleStep;
        let delta = cardAngle - next;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;

        const absDelta = Math.abs(delta);
        const rad = (delta * Math.PI) / 180;

        // Cylinder coordinates
        const x = radius * Math.sin(rad) * (isMobile ? 0.75 : parallax);
        const z = radius * (Math.cos(rad) - 1);
        const rotY = -delta * curve;
        const rotX = tilt;

        // Intro 'rise' animation offset
        const introY = !mounted && intro === 'rise' ? 40 : 0;
        const scale = Math.max(0.78, 1 - (absDelta / 180) * 0.22);

        // Opacity: front cards 1.0, sides fade smoothly, back-facing cards hidden
        let opacity = 1;
        if (absDelta <= 40) {
          opacity = 1;
        } else if (absDelta <= 110) {
          opacity = Math.max(0.18, 1 - ((absDelta - 40) / 70) * 0.82);
        } else {
          opacity = 0;
        }

        const blur = absDelta > 45 ? Math.min(3, (absDelta - 45) * 0.05) : 0;
        const zIndex = Math.round(100 - absDelta);
        const isCenter = absDelta < angleStep / 2;

        el.style.width = `${effectiveCardWidth}px`;
        el.style.height = `${effectiveCardHeight}px`;
        el.style.marginLeft = `-${effectiveCardWidth / 2}px`;
        el.style.marginTop = `-${effectiveCardHeight / 2}px`;
        el.style.borderRadius = `${cornerRadius}px`;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${introY}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(opacity.toFixed(3));
        el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
        el.style.zIndex = String(zIndex);
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        el.style.pointerEvents = absDelta < 50 ? 'auto' : 'none';

        if (isCenter) {
          el.classList.add('circular-carousel__card--center');
        } else {
          el.classList.remove('circular-carousel__card--center');
        }
      }
    },
    [angleStep, aspectRatio, cardWidth, cornerRadius, curve, gap, intro, items, mounted, n, onSelect, parallax, speed, tilt]
  );

  // Single stable RAF loop
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

  // Jump smoothly to index
  const snapTo = useCallback(
    (index: number) => {
      const cur = targetAngleRef.current;
      const targetCardAngle = index * angleStep;
      let diff = targetCardAngle - (((cur % 360) + 360) % 360);
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      targetAngleRef.current = cur + diff;
    },
    [angleStep]
  );

  const prev = useCallback(() => {
    targetAngleRef.current = Math.round(targetAngleRef.current / angleStep) * angleStep - angleStep;
  }, [angleStep]);

  const next = useCallback(() => {
    targetAngleRef.current = Math.round(targetAngleRef.current / angleStep) * angleStep + angleStep;
  }, [angleStep]);

  const triggerManualNav = useCallback((action: () => void) => {
    action();
    setAutoplayResetKey((k) => k + 1);
  }, []);

  // Pointer drag & touch interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startX: e.clientX,
      startAngle: targetAngleRef.current,
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
          // ignore
        }
      }
      // Drag sensitivity: convert dx pixels to rotational degrees
      const sensitivity = 0.35;
      targetAngleRef.current = drag.startAngle - dx * sensitivity;
    }
  };

  const handlePointerEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;

    if (dragMovedRef.current) {
      try {
        stageRef.current?.releasePointerCapture(drag.pointerId);
      } catch {
        // ignore
      }

      // Snap to nearest card position
      targetAngleRef.current = Math.round(targetAngleRef.current / angleStep) * angleStep;
    }

    dragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setAutoplayResetKey((k) => k + 1);
  };

  // Keyboard navigation
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
      aria-label="Verified Accreditations & Certifications Circular Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`circular-carousel${isDragging ? ' circular-carousel--dragging' : ''} ${className}`.trim()}
      style={style}
    >
      {/* 3D Cylindrical Stage */}
      <div
        ref={stageRef}
        className="circular-carousel__stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {items.map((item, idx) => {
          const isCenter = activeIndex === idx;
          const castItem = item as CircularCarouselItem;
          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className={`circular-carousel__card${isCenter ? ' circular-carousel__card--center' : ''}`}
              onClick={() => {
                if (!dragMovedRef.current) {
                  triggerManualNav(() => snapTo(idx));
                  onSelect?.(item, idx);
                }
              }}
            >
              {renderCard ? (
                renderCard(item, idx, isCenter)
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    background: 'linear-gradient(145deg, rgba(18, 20, 26, 0.95) 0%, rgba(10, 11, 15, 0.98) 100%)',
                    borderRadius: `${cornerRadius}px`,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                  }}
                >
                  {castItem.src && (
                    <img
                      src={castItem.src}
                      alt={castItem.alt || castItem.title || 'Carousel Image'}
                      style={{
                        maxHeight: '70%',
                        maxWidth: '80%',
                        objectFit: 'contain',
                        marginBottom: '10px',
                      }}
                    />
                  )}
                  {captions && (castItem.title || castItem.subtitle) && (
                    <div style={{ textAlign: 'center' }}>
                      {castItem.title && (
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {castItem.title}
                        </div>
                      )}
                      {castItem.subtitle && (
                        <div style={{ fontSize: '11px', color: '#A7B0A9', marginTop: '2px' }}>
                          {castItem.subtitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isCenter && <div className="circular-carousel__reflection" />}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Indicators */}
      <div
        className="circular-carousel__controls"
        role="group"
        aria-label="Certification carousel navigation controls"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => triggerManualNav(prev)}
          aria-label="Previous Certification"
          className="circular-carousel__btn"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        <div className="circular-carousel__dots" role="tablist" aria-label="Certification indicators">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              onClick={() => triggerManualNav(() => snapTo(idx))}
              aria-label={`Jump to certification ${idx + 1} of ${n}`}
              className={`circular-carousel__dot${activeIndex === idx ? ' circular-carousel__dot--active' : ''}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => triggerManualNav(next)}
          aria-label="Next Certification"
          className="circular-carousel__btn"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default CircularCarousel;
