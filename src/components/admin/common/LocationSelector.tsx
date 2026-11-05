import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { MapPin, Check, X, Plus, Loader2 } from 'lucide-react';

export interface LocationParts {
  city?: string;
  stateProvince?: string;
  countryRegion?: string;
  formattedLocation: string;
}

export interface LocationSelectorProps {
  value: string;
  onChange: (location: string, parts?: LocationParts) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  helpText?: string;
}

interface LocationItem {
  city: string;
  state: string;
  country: string;
  formatted: string;
  badge?: string;
}

interface PopupPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
}

// Curated baseline database of key Indian locations & global tech/business hubs
const CURATED_LOCATIONS: LocationItem[] = [
  // Madhya Pradesh & Gujarat (Resume specific)
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', formatted: 'Indore, Madhya Pradesh, India', badge: 'Primary Base' },
  { city: 'Anand', state: 'Gujarat', country: 'India', formatted: 'Anand, Gujarat, India', badge: 'Resume Location' },
  { city: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', formatted: 'Jabalpur, Madhya Pradesh, India', badge: 'Education Base' },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', formatted: 'Bhopal, Madhya Pradesh, India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', formatted: 'Ahmedabad, Gujarat, India' },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', formatted: 'Vadodara, Gujarat, India' },

  // Major Indian Metros & Tech Hubs
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', formatted: 'Bengaluru, Karnataka, India', badge: 'Tech Hub' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', formatted: 'Mumbai, Maharashtra, India', badge: 'Financial Hub' },
  { city: 'Pune', state: 'Maharashtra', country: 'India', formatted: 'Pune, Maharashtra, India' },
  { city: 'New Delhi', state: 'Delhi', country: 'India', formatted: 'New Delhi, Delhi, India' },
  { city: 'Gurgaon', state: 'Haryana', country: 'India', formatted: 'Gurgaon, Haryana, India' },
  { city: 'Noida', state: 'Uttar Pradesh', country: 'India', formatted: 'Noida, Uttar Pradesh, India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', formatted: 'Hyderabad, Telangana, India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', formatted: 'Chennai, Tamil Nadu, India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', formatted: 'Kolkata, West Bengal, India' },

  // Global Business & Tech Hubs
  { city: 'London', state: 'England', country: 'United Kingdom', formatted: 'London, England, United Kingdom', badge: 'Global Hub' },
  { city: 'San Francisco', state: 'California', country: 'United States', formatted: 'San Francisco, CA, United States', badge: 'Silicon Valley' },
  { city: 'New York', state: 'New York', country: 'United States', formatted: 'New York, NY, United States' },
  { city: 'Seattle', state: 'Washington', country: 'United States', formatted: 'Seattle, WA, United States' },
  { city: 'Zurich', state: 'Zurich', country: 'Switzerland', formatted: 'Zurich, Switzerland' },
  { city: 'Geneva', state: 'Geneva', country: 'Switzerland', formatted: 'Geneva, Switzerland' },
  { city: 'Singapore', state: 'Central', country: 'Singapore', formatted: 'Singapore, Singapore', badge: 'APAC Hub' },
  { city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', formatted: 'Dubai, United Arab Emirates', badge: 'MENA Hub' },
  { city: 'Toronto', state: 'Ontario', country: 'Canada', formatted: 'Toronto, Ontario, Canada' },
  { city: 'Berlin', state: 'Berlin', country: 'Germany', formatted: 'Berlin, Germany' },
  { city: 'Amsterdam', state: 'North Holland', country: 'Netherlands', formatted: 'Amsterdam, Netherlands' },
  { city: 'Dublin', state: 'Leinster', country: 'Ireland', formatted: 'Dublin, Ireland' },
  { city: 'Sydney', state: 'New South Wales', country: 'Australia', formatted: 'Sydney, NSW, Australia' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan', formatted: 'Tokyo, Japan' },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  label = 'Location',
  required = false,
  placeholder = 'Select or enter location (e.g. Indore, Madhya Pradesh, India)...',
  error,
  disabled = false,
  helpText = 'Search city, state, or country, or type a custom location.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<LocationItem[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [popupPos, setPopupPos] = useState<PopupPosition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Position calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    const preferredHeight = 300;

    const shouldFlip = spaceBelow < 220 && spaceAbove > spaceBelow;
    const width = Math.min(rect.width, windowWidth - 16);
    const left = Math.max(8, Math.min(rect.left, windowWidth - width - 8));

    if (shouldFlip) {
      const maxHeight = Math.min(preferredHeight, Math.max(120, spaceAbove - 16));
      setPopupPos({
        bottom: windowHeight - rect.top + 4,
        left,
        width,
        maxHeight,
        placement: 'top',
      });
    } else {
      const maxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow - 16));
      setPopupPos({
        top: rect.bottom + 4,
        left,
        width,
        maxHeight,
        placement: 'bottom',
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPopupPos(null);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Debounced geocoding search using free OpenStreetMap Nominatim with graceful fallback
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setLiveResults([]);
      setIsLoadingLive(false);
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      setIsLoadingLive(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: LocationItem[] = data.map((item: any) => {
              const addr = item.address || {};
              const city =
                addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
              const state = addr.state || addr.region || '';
              const country = addr.country || '';

              const parts = [city, state, country].filter(Boolean);
              const formatted = parts.length > 0 ? parts.join(', ') : item.display_name;

              return {
                city,
                state,
                country,
                formatted,
                badge: 'Live Geocode',
              };
            });
            setLiveResults(mapped);
          }
        }
      } catch {
        // Fallback silently to curated database when offline
      } finally {
        setIsLoadingLive(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Combined suggestions: Curated + Live geocoded
  const suggestions = useMemo<LocationItem[]>(() => {
    const lower = query.trim().toLowerCase();
    const map = new Map<string, LocationItem>();

    // 1. Live geocode results first if searching
    liveResults.forEach((item) => {
      if (item.formatted && !map.has(item.formatted.toLowerCase())) {
        map.set(item.formatted.toLowerCase(), item);
      }
    });

    // 2. Curated database matching
    CURATED_LOCATIONS.forEach((loc) => {
      if (
        !lower ||
        loc.formatted.toLowerCase().includes(lower) ||
        loc.city.toLowerCase().includes(lower) ||
        loc.state.toLowerCase().includes(lower) ||
        loc.country.toLowerCase().includes(lower)
      ) {
        if (!map.has(loc.formatted.toLowerCase())) {
          map.set(loc.formatted.toLowerCase(), loc);
        }
      }
    });

    return Array.from(map.values());
  }, [query, liveResults]);

  const handleSelect = (item: LocationItem) => {
    onChange(item.formatted, {
      city: item.city,
      stateProvince: item.state,
      countryRegion: item.country,
      formattedLocation: item.formatted,
    });
    setIsOpen(false);
    setQuery('');
  };

  const handleCustomSubmit = (raw: string) => {
    if (!raw.trim()) return;
    const parts = raw.split(',').map((p) => p.trim());
    let city: string | undefined;
    let stateProvince: string | undefined;
    let countryRegion: string | undefined;

    if (parts.length >= 3) {
      city = parts[0];
      stateProvince = parts[1];
      countryRegion = parts[2];
    } else if (parts.length === 2) {
      city = parts[0];
      countryRegion = parts[1];
    } else {
      city = parts[0];
    }

    onChange(raw.trim(), {
      city,
      stateProvince,
      countryRegion,
      formattedLocation: raw.trim(),
    });
    setIsOpen(false);
    setQuery('');
  };

  const exactMatchExists = suggestions.some(
    (s) => s.formatted.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={containerRef}>
      {label && (
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: '#A7B0A9',
            marginBottom: '6px',
          }}
        >
          {label} {required && <span style={{ color: '#E06C75' }}>*</span>}
        </label>
      )}

      {/* Trigger & Direct Input */}
      <div
        ref={triggerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? '#080C0B' : '#0E1412',
          border: error
            ? '1px solid #E06C75'
            : isOpen
            ? '1px solid #8C1524'
            : '1px solid rgba(244, 243, 238, 0.12)',
          borderRadius: '6px',
          padding: '2px 10px',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(140, 21, 36, 0.25)' : 'none',
        }}
      >
        <MapPin size={16} color="#8E948D" style={{ marginRight: '8px', flexShrink: 0 }} />
        <input
          type="text"
          disabled={disabled}
          value={isOpen ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery(value || '');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length > 0 && !query.trim()) {
                handleSelect(suggestions[0]);
              } else if (query.trim()) {
                handleCustomSubmit(query.trim());
              }
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#F4F3EE',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
          }}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setQuery('');
            }}
            title="Clear location"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8E948D',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* PORTAL-BASED Dropdown Suggestions: Rendered in document.body to prevent ANY modal clipping */}
      {isOpen &&
        popupPos &&
        ReactDOM.createPortal(
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              top: popupPos.top !== undefined ? `${popupPos.top}px` : undefined,
              bottom: popupPos.bottom !== undefined ? `${popupPos.bottom}px` : undefined,
              left: `${popupPos.left}px`,
              width: `${popupPos.width}px`,
              maxHeight: `${popupPos.maxHeight}px`,
              zIndex: 999999,
              backgroundColor: '#0F1216',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '8px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            {/* Status bar */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#14181F',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#8E948D',
              }}
            >
              <span>Location Suggestions</span>
              {isLoadingLive && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6CE098' }}>
                  <Loader2 size={12} className="animate-spin" /> Fetching live...
                </span>
              )}
            </div>

            {/* List items */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
              {suggestions.map((loc, idx) => {
                const isSelected = loc.formatted === value;
                return (
                  <div
                    key={loc.formatted + '-' + idx}
                    onClick={() => handleSelect(loc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: isSelected ? '#FFFFFF' : '#D5D2D6',
                      backgroundColor: isSelected ? 'rgba(120, 30, 49, 0.28)' : 'transparent',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected
                        ? 'rgba(120, 30, 49, 0.28)'
                        : 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <MapPin size={13} color="#8E948D" />
                      <div>
                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{loc.formatted}</span>
                        {loc.badge && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#A7B0A9',
                            }}
                          >
                            {loc.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="#6CE098" />}
                  </div>
                );
              })}

              {/* Custom Entry Option */}
              {query.trim().length > 0 && !exactMatchExists && (
                <div
                  onClick={() => handleCustomSubmit(query)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(120, 30, 49, 0.16)',
                    color: '#F4F3EE',
                  }}
                >
                  <Plus size={14} color="#E098A3" />
                  <span>
                    Use custom location: <strong>"{query.trim()}"</strong>
                  </span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {helpText && !error && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: '#7E8782',
            marginTop: '4px',
          }}
        >
          {helpText}
        </span>
      )}
      {error && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: '#E06C75',
            marginTop: '4px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
