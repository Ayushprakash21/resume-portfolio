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
  cardHeight?: number;
  aspectRatio?: number;
  speed?: number; // Autoplay interval in seconds (default: 3.8s)
  autoplay?: boolean;
  isPaused?: boolean; // Pause when external modal is open
  captions?: boolean;
  gap?: number;
  tilt?: number; // Camera tilt in degrees (default: -1.5)
  curve?: number; // Cylinder curvature factor (default: 0.65)
  parallax?: number; // Horizontal spread factor (default: 0.95)
  cornerRadius?: number; // Border radius (default: 22)
  renderCard?: (item: T, index: number, isCenter: boolean) => React.ReactNode;
  onSelect?: (item: T, index: number) => void;
  onChange?: (item: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CircularCarousel<T = CircularCarouselItem>({
  items,
  preset = 'cylinder',
  intro = 'rise',
  cardWidth = 340,
  cardHeight = 450,
  aspectRatio = 0.75,
  speed = 3.8,
  autoplay = true,
  isPaused = false,
  captions = true,
  gap = 48,
  tilt = -1.5,
  curve = 0.65,
  parallax = 0.95,
  cornerRadius = 22,
  renderCard,
  onSelect,
  onChange,
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

  // Autoplay and interaction timers
  const autoplayIntervalMs = speed && speed > 0 && speed <= 30 ? speed * 1000 : 3800;
  const pauseUntilRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(performance.now());

  // Interaction & Visibility State
  const isHoveredRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const dragRef = useRef<{ startX: number; startY: number; startAngle: number; pointerId: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const lastDragEndTimeRef = useRef<number>(0);
  const totalDxRef = useRef<number>(0);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [, setRerenderKey] = useState<number>(0);

  // Intro mount trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  // Viewport intersection observer to conserve animation resources
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting || entry.intersectionRatio > 0;
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update layout loop (RAF)
  const updateLayout = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (n === 0) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Autoplay advance: smoothly advances targetAngle to next card every interval
      const canAutoplay =
        autoplay &&
        !isPaused &&
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        isVisibleRef.current &&
        !prefersReducedMotion &&
        now >= pauseUntilRef.current;

      if (canAutoplay) {
        if (now - lastStepTimeRef.current >= autoplayIntervalMs) {
          lastStepTimeRef.current = now;
          targetAngleRef.current =
            Math.round(targetAngleRef.current / angleStep) * angleStep + angleStep;
        }
      } else {
        if (isDraggingRef.current || isPaused || now < pauseUntilRef.current) {
          lastStepTimeRef.current = now;
        }
      }

      // Smooth spring interpolation towards targetAngle
      const cur = angleRef.current;
      const target = targetAngleRef.current;
      const tau = 0.28; // Responsive spring feel
      const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
      let next = cur + (target - cur) * k;

      if (prefersReducedMotion || Math.abs(target - next) < 0.01) {
        next = target;
      }
      angleRef.current = next;

      // Determine nearest active index (front-facing card)
      const normalizedAngle = ((next % 360) + 360) % 360;
      let nearestIdx = Math.round(normalizedAngle / angleStep) % n;
      if (nearestIdx < 0) nearestIdx += n;

      if (nearestIdx !== activeIndexRef.current) {
        activeIndexRef.current = nearestIdx;
        setActiveIndex(nearestIdx);
        onChange?.(items[nearestIdx], nearestIdx);
      }

      // Responsive card dimensions
      const containerWidth =
        containerRef.current?.clientWidth ||
        (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const isMobile = containerWidth <= 640;
      const isTablet = containerWidth > 640 && containerWidth <= 1024;

      const effectiveCardWidth = isMobile
        ? Math.min(285, Math.round(containerWidth * 0.82))
        : isTablet
        ? 310
        : cardWidth; // 340px desktop target

      const effectiveCardHeight = cardHeight
        ? isMobile
          ? 390
          : isTablet
          ? 420
          : cardHeight // 450px desktop target
        : Math.round(effectiveCardWidth / aspectRatio);

      const effectiveGap = isMobile ? 32 : isTablet ? 48 : gap;

      // Cylinder radius: complete 3D circular cylinder
      const minRadius = isMobile ? 310 : isTablet ? 380 : 440;
      const basePerimeter = Math.max(n, 4) * (effectiveCardWidth + effectiveGap);
      const radius = Math.max(minRadius, basePerimeter / (2 * Math.PI));

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // Card's baseline angle on cylinder
        const cardAngle = i * angleStep;
        let delta = cardAngle - next;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;

        const absDelta = Math.abs(delta);
        const rad = (delta * Math.PI) / 180;

        // 3D Cylinder coordinates
        const spread = isMobile ? 0.82 : parallax;
        const x = radius * Math.sin(rad) * spread;

        // Depth factor: central card front-most, adjacent and rear recede
        const depthFactor = isMobile ? 0.55 : 0.65;
        const z = radius * (Math.cos(rad) - 1) * depthFactor;

        const rotY = -delta * (isMobile ? 0.52 : curve);
        const rotX = tilt;

        // Intro animation offset
        const introY = !mounted && intro === 'rise' ? 40 : 0;

        // Normalised circular distance u in units of angleStep
        const u = absDelta / angleStep;

        let opacity: number;
        let scale: number;
        let blur: number;
        let contrast: number;

        if (u < 0.22) {
          // Central active card: 100% opacity, 1.0 scale, sharp, high contrast
          opacity = 1.0;
          scale = 1.0;
          blur = 0;
          contrast = 1.0;
        } else if (u <= 1.15) {
          // Adjacent cards: target 25–40% opacity, ~0.82–0.90 scale, slight blur, reduced contrast
          const t = Math.min(1, Math.max(0, (u - 0.22) / 0.78));
          opacity = 1.0 - t * 0.68; // 1.0 -> 0.32 (32% opacity)
          scale = 1.0 - t * 0.15;   // 1.0 -> 0.85 scale
          blur = t * 1.5;           // 0 -> 1.5px blur
          contrast = 1.0 - t * 0.2; // 1.0 -> 0.80 contrast
        } else {
          // Further / rear cards: very low opacity (0.10), distant perspective
          const t = Math.min(1, (u - 1.0) / 1.0);
          opacity = Math.max(0.08, 0.32 - t * 0.22); // 0.32 -> 0.10
          scale = Math.max(0.70, 0.85 - t * 0.15);   // 0.85 -> 0.70
          blur = 1.5 + t * 1.8;                      // 1.5 -> 3.3px blur
          contrast = 0.75;
        }

        const zIndex = Math.round(1000 - absDelta * 5);
        const isCenter = absDelta < angleStep / 2;

        el.style.width = `${effectiveCardWidth}px`;
        el.style.height = `${effectiveCardHeight}px`;
        el.style.marginLeft = `-${effectiveCardWidth / 2}px`;
        el.style.marginTop = `-${effectiveCardHeight / 2}px`;
        el.style.borderRadius = `${cornerRadius}px`;
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${introY}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(opacity.toFixed(3));
        el.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px) contrast(${contrast.toFixed(2)})` : 'none';
        el.style.zIndex = String(zIndex);
        el.style.visibility = 'visible';
        el.style.pointerEvents = absDelta < 55 ? 'auto' : 'none';

        if (isCenter) {
          el.classList.add('circular-carousel__card--center');
        } else {
          el.classList.remove('circular-carousel__card--center');
        }
      }
    },
    [angleStep, aspectRatio, autoplay, autoplayIntervalMs, cardHeight, cardWidth, cornerRadius, curve, gap, intro, isPaused, items, mounted, n, onChange, parallax, tilt]
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
    pauseUntilRef.current = performance.now() + 4000;
  }, [angleStep]);

  const next = useCallback(() => {
    targetAngleRef.current = Math.round(targetAngleRef.current / angleStep) * angleStep + angleStep;
    pauseUntilRef.current = performance.now() + 4000;
  }, [angleStep]);

  const triggerManualNav = useCallback((action: () => void) => {
    action();
    pauseUntilRef.current = performance.now() + 4000;
    setRerenderKey((k) => k + 1);
  }, []);

  // Pointer drag & touch interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
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
    const dy = e.clientY - drag.startY;
    totalDxRef.current = dx;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
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

    lastDragEndTimeRef.current = performance.now();
    dragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    pauseUntilRef.current = performance.now() + 3500;
    setRerenderKey((k) => k + 1);
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
        pauseUntilRef.current = performance.now() + 1500;
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
              onClick={(e) => {
                if (dragMovedRef.current || performance.now() - lastDragEndTimeRef.current < 250) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (!isCenter) {
                  triggerManualNav(() => snapTo(idx));
                }
                onSelect?.(item, idx);
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
          <ChevronLeft size={22} strokeWidth={2.2} />
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
          <ChevronRight size={22} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export default CircularCarousel;
