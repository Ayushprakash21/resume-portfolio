import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';

export interface OptionWheelItem {
  id: string;
  label: string;
  targetId: string;
  badge?: string;
}

interface OptionWheelProps {
  items?: OptionWheelItem[];
  onSelect?: (item: OptionWheelItem) => void;
  className?: string;
  compactOnMobile?: boolean;
}

const DEFAULT_ORION9_ITEMS: OptionWheelItem[] = [
  { id: 'overview', label: 'Orion-9 Overview', targetId: 'orion-9', badge: 'OS' },
  { id: 'control-tower', label: 'Control Tower', targetId: 'orion-9', badge: 'Live' },
  { id: 'inventory', label: 'Inventory Intelligence', targetId: 'orion-9', badge: 'Auto' },
  { id: 'analytics', label: 'Supply Chain Analytics', targetId: 'orion-9', badge: 'Data' },
  { id: 'copilot', label: 'AI Copilot', targetId: 'orion-9', badge: 'LLM' },
  { id: 'architecture', label: 'Architecture', targetId: 'orion-9', badge: 'Spec' },
  { id: 'case-study', label: 'Case Study', targetId: 'orion-9', badge: 'Full' },
];

export const OptionWheel: React.FC<OptionWheelProps> = ({
  items = DEFAULT_ORION9_ITEMS,
  onSelect,
  className = '',
  compactOnMobile = true,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedItem = items[selectedIndex] || items[0];

  const handleSelect = useCallback(
    (index: number) => {
      const idx = (index + items.length) % items.length;
      setSelectedIndex(idx);
      const chosen = items[idx];
      if (onSelect) {
        onSelect(chosen);
      } else if (chosen.targetId) {
        const el = document.getElementById(chosen.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [items, onSelect]
  );

  // Wheel scroll interaction
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleSelect(selectedIndex + 1);
    } else {
      handleSelect(selectedIndex - 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleSelect(selectedIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSelect(selectedIndex - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(selectedIndex);
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`option-wheel-wrapper ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label="Orion-9 Navigation Control Instrument"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        outline: 'none',
      }}
    >
      {/* Mechanical Instrument Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onWheel={handleWheel}
        title="Orion-9 Control Instrument (Scroll wheel or click to navigate)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'rgba(18, 18, 22, 0.72)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(217, 221, 227, 0.18)',
          borderRadius: '20px',
          color: '#F2F2F4',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'rgba(217, 221, 227, 0.12)',
            border: '1px solid rgba(217, 221, 227, 0.3)',
            transform: `rotate(${selectedIndex * 51.4}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.2, 1)',
          }}
        >
          <Compass size={11} color="#C8C8CE" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: '85px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#929299',
              lineHeight: 1,
            }}
          >
            Orion-9
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 500,
              color: '#F2F2F4',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px',
            }}
          >
            {selectedItem.label}
          </span>
        </div>

        <ChevronDown
          size={12}
          color="#929299"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Expanded Curved Reel / Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            backgroundColor: 'rgba(10, 10, 14, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(217, 221, 227, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(217, 221, 227, 0.08)',
            padding: '6px',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#C8C8CE',
              }}
            >
              Orion-9 Modules
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                color: '#777F8A',
              }}
            >
              Scroll / Click
            </span>
          </div>

          <div
            onWheel={handleWheel}
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px 0',
            }}
          >
            {items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    handleSelect(idx);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(217, 221, 227, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '2px solid #D9DDE3' : '2px solid transparent',
                    color: isSelected ? '#FFFFFF' : '#929299',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '9px',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        backgroundColor: isSelected
                          ? 'rgba(217, 221, 227, 0.2)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#F2F2F4' : '#777F8A',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
