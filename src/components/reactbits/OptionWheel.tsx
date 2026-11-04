import React, { useRef, useState, useCallback, useEffect, CSSProperties } from 'react';
import './OptionWheel.css';

export type OptionWheelSide = 'left' | 'right' | 'center';

export interface OptionWheelItemObject {
  id?: string;
  label: string;
  targetId?: string;
  badge?: string;
  description?: string;
  [key: string]: any;
}

export type OptionWheelItemInput = string | OptionWheelItemObject;

export interface OptionWheelProps {
  items?: OptionWheelItemInput[];
  defaultSelected?: number;
  onChange?: (index: number, item: OptionWheelItemInput) => void;
  onSelect?: (item: OptionWheelItemInput, index: number) => void;
  textColor?: string;
  activeColor?: string;
  side?: OptionWheelSide;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  soundUrl?: string;
  soundVolume?: number;
  className?: string;
  style?: CSSProperties;
  height?: string | number;
  label?: string;
}

interface WheelConfig {
  count: number;
  items: OptionWheelItemInput[];
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: OptionWheelSide;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  soundUrl: string;
  soundVolume: number;
}

/**
 * Official Portfolio-wide navigation items mapped to real published CMS sections
 */
export const DEFAULT_NAV_WHEEL_ITEMS: OptionWheelItemObject[] = [
  { id: 'work', label: 'Work', targetId: 'projects', badge: 'Projects', description: 'Selected Engineering & Product Implementations' },
  { id: 'orion9', label: 'Orion-9', targetId: 'orion-9', badge: 'OS', description: 'Autonomous Supply Chain Architecture' },
  { id: 'experience', label: 'Experience', targetId: 'experience', badge: 'Career', description: 'Enterprise Operations Leadership' },
  { id: 'about', label: 'About', targetId: 'about', badge: 'Bio', description: 'Background & Strategic Positioning' },
  { id: 'opentowork', label: 'Open to Work', targetId: 'opentowork', badge: 'Active', description: 'Role & Location Preferences' },
  { id: 'contact', label: 'Contact', targetId: 'contact', badge: 'Direct', description: 'Communication & Secure Messaging' },
];

export const DEFAULT_ORION9_ITEMS: OptionWheelItemObject[] = [
  { id: 'overview', label: 'Orion-9 Overview', targetId: 'orion-9', badge: 'OS', description: 'Autonomous Supply Chain Architecture' },
  { id: 'control-tower', label: 'Control Tower', targetId: 'orion-9', badge: 'Live', description: 'Real-time Telemetry & Global Operations' },
  { id: 'inventory', label: 'Inventory Intelligence', targetId: 'orion-9', badge: 'Auto', description: 'Predictive Stock & Automated Reordering' },
  { id: 'analytics', label: 'Supply Chain Analytics', targetId: 'orion-9', badge: 'Data', description: 'Freight Logistics & Cost Forecasting' },
  { id: 'copilot', label: 'AI Copilot', targetId: 'orion-9', badge: 'LLM', description: 'Generative Decision Support System' },
  { id: 'architecture', label: 'Architecture', targetId: 'orion-9', badge: 'Spec', description: 'Distributed Cloud & Edge Nodes' },
  { id: 'case-study', label: 'Case Study', targetId: 'orion-9', badge: 'Full', description: 'End-to-End Enterprise Implementation' },
];

export const OptionWheel: React.FC<OptionWheelProps> = ({
  items = DEFAULT_NAV_WHEEL_ITEMS,
  defaultSelected = 0,
  onChange,
  onSelect,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'right',
  fontSize = 1.55,
  spacing = 1.65,
  curve = 1,
  tilt = 6,
  blur = 1.5,
  fade = 0.25,
  minOpacity = 0.08,
  smoothing = 200,
  inset = 12,
  loop = false,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = '',
  style,
  height = '100%',
  label = 'Portfolio Navigation Wheel',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const validItems = items && items.length > 0 ? items : [];
  const initialIdx = validItems.length > 0 ? Math.max(0, Math.min(defaultSelected, validItems.length - 1)) : 0;
  const posRef = useRef(initialIdx);
  const targetRef = useRef(initialIdx);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<WheelConfig>({} as WheelConfig);
  const onChangeRef = useRef(onChange);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(initialIdx);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(initialIdx);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined'
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16;

  onChangeRef.current = onChange;
  onSelectRef.current = onSelect;

  cfgRef.current = {
    count: validItems.length,
    items: validItems,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

  const getItemLabel = (item: OptionWheelItemInput): string => {
    return typeof item === 'string' ? item : item.label;
  };

  // Single rAF loop that eases the wheel position toward its target with
  // frame-rate independent exponential smoothing, then lays every option out
  // along the curve based on its distance from the current position.
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    if (cfg.count === 0) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = targetRef.current;
    const cur = posRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = prefersReducedMotion ? 1 : 1 - Math.exp(-dt / tau);
    let next = cur + (target - cur) * k;
    const settled = prefersReducedMotion || Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === 'right' ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }

      if (cfg.side === 'center') {
        el.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      } else {
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      }

      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 && dist > 0.1 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // Optional tick sound on selection change
  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = soundUrl;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(soundVolume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      if (cfg.count === 0) return;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        const item = cfg.items[idx];
        onChangeRef.current?.(idx, item);
        if (snap) {
          onSelectRef.current?.(item, idx);
        }
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick]
  );

  // Sync when defaultSelected prop changes
  useEffect(() => {
    if (validItems.length === 0) return;
    const clamped = Math.max(0, Math.min(defaultSelected, validItems.length - 1));
    applyTarget(clamped, true);
  }, [defaultSelected, validItems.length, applyTarget]);

  // Clamp target if items length changes
  useEffect(() => {
    if (validItems.length === 0) return;
    const maxIdx = validItems.length - 1;
    if (targetRef.current > maxIdx) {
      applyTarget(maxIdx, true);
    }
  }, [validItems.length, applyTarget]);

  // Wheel scroll interaction
  const handleWheel = useCallback(
    (e: React.WheelEvent | WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current;
      if (cfg.count === 0) return;
      const delta = (e as WheelEvent).deltaMode === 1 ? (e as WheelEvent).deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    },
    [applyTarget]
  );

  // Native non-passive wheel attachment for smooth gestures (only when pointer is over the wheel)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [handleWheel]);

  // Pointer drag interaction
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) {
        applyTarget(drag.start - dy / cfgRef.current.rowH, false);
      }
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.id && rootRef.current?.hasPointerCapture?.(drag.id)) {
      try {
        rootRef.current.releasePointerCapture(drag.id);
      } catch {
        // Pointer capture cleanup safe
      }
    }
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) {
      applyTarget(targetRef.current, true);
    }
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      if (cfg.count === 0) return;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
      const chosen = cfg.items[index];
      onChangeRef.current?.(index, chosen);
      onSelectRef.current?.(chosen, index);
    },
    [applyTarget]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cfg = cfgRef.current;
      if (cfg.count === 0) return;

      if (e.key === 'Home') {
        e.preventDefault();
        applyTarget(0, true);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        applyTarget(cfg.count - 1, true);
        return;
      }

      let delta: number | null = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta != null) {
        e.preventDefault();
        applyTarget(Math.round(targetRef.current) + delta, true);
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const chosen = cfg.items[selectedIndex];
        onChangeRef.current?.(selectedIndex, chosen);
        onSelectRef.current?.(chosen, selectedIndex);
      }
    },
    [applyTarget, selectedIndex]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  if (validItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-roledescription="cylindrical option wheel"
      aria-activedescendant={`ow-item-${selectedIndex}`}
      className={`option-wheel${side === 'right' ? ' option-wheel--right' : side === 'center' ? ' option-wheel--center' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`,
        height,
        ...style,
      } as CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {/* Center Target Slot Marker */}
      <div className="option-wheel__slot-indicator" />

      {/* Curved 3D Option Elements */}
      {validItems.map((item, index) => {
        const labelText = getItemLabel(item);
        const isSelected = selectedIndex === index;
        return (
          <div
            key={`${labelText}-${index}`}
            id={`ow-item-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="option"
            aria-selected={isSelected}
            className={`option-wheel__item${isSelected ? ' option-wheel__item--selected' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            {labelText}
          </div>
        );
      })}
    </div>
  );
};

export default OptionWheel;
