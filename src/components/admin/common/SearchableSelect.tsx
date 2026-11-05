import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  options: SearchableOption[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  customPrompt?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  style?: React.CSSProperties;
  isMulti?: boolean;
  loading?: boolean;
  emptyText?: string;
}

interface PopupPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  allowCustom = true,
  customPrompt = 'Use custom value:',
  clearable = true,
  disabled = false,
  error,
  helpText,
  style,
  isMulti = false,
  loading = false,
  emptyText = 'No matching options found.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [popupPos, setPopupPos] = useState<PopupPosition | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Selected values normalization
  const selectedValues: string[] = React.useMemo(() => {
    if (isMulti) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }, [value, isMulti]);

  // Recalculate popup position based on trigger bounding box
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    const preferredHeight = 320;

    // Flip to top if room below is tight (< 220px) and room above is larger
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

  // Update position on open, scroll, resize
  useEffect(() => {
    if (!isOpen) {
      setPopupPos(null);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setIsOpen(false);
      setSearchQuery('');
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter options
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!trimmedQuery) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(trimmedQuery) ||
        opt.value.toLowerCase().includes(trimmedQuery) ||
        (opt.description && opt.description.toLowerCase().includes(trimmedQuery)) ||
        (opt.group && opt.group.toLowerCase().includes(trimmedQuery))
    );
  }, [options, trimmedQuery]);

  const exactMatchExists = options.some(
    (opt) => opt.value.toLowerCase() === trimmedQuery || opt.label.toLowerCase() === trimmedQuery
  );

  const showCustomOption = allowCustom && trimmedQuery.length > 0 && !exactMatchExists;

  const handleSelect = (selectedValue: string) => {
    if (isMulti) {
      const exists = selectedValues.includes(selectedValue);
      const next = exists
        ? selectedValues.filter((v) => v !== selectedValue)
        : [...selectedValues, selectedValue];
      onChange(next);
      setSearchQuery('');
    } else {
      onChange(selectedValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemoveChip = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedValues.filter((v) => v !== valToRemove);
    onChange(next);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(isMulti ? [] : '');
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (showCustomOption && highlightedIndex === filteredOptions.length) {
        handleSelect(searchQuery.trim());
      } else if (trimmedQuery.length > 0 && allowCustom) {
        handleSelect(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
      triggerRef.current?.focus();
    }
  };

  // Grouping
  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: SearchableOption[] } = {};
    filteredOptions.forEach((opt) => {
      const g = opt.group || '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
    return groups;
  }, [filteredOptions]);

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: '#A7B0A9',
            }}
          >
            {label} {required && <span style={{ color: '#E06C75' }}>*</span>}
          </label>
        </div>
      )}

      {/* Trigger Box */}
      <div
        ref={triggerRef}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '42px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: disabled ? '#080C0B' : '#0E1412',
          border: error
            ? '1px solid #E06C75'
            : isOpen
            ? '1px solid #8C1524'
            : '1px solid rgba(244, 243, 238, 0.12)',
          color: selectedValues.length > 0 ? '#F4F3EE' : '#6A736E',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(140, 21, 36, 0.25)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflow: 'hidden',
            flex: 1,
            flexWrap: isMulti ? 'wrap' : 'nowrap',
          }}
        >
          {isMulti && selectedValues.length > 0 ? (
            selectedValues.map((val) => {
              const matchedOpt = options.find((o) => o.value === val);
              const labelText = matchedOpt ? matchedOpt.label : val;
              return (
                <span
                  key={val}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(140, 21, 36, 0.25)',
                    border: '1px solid rgba(140, 21, 36, 0.45)',
                    color: '#F4F3EE',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {labelText}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(val, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E098A3',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })
          ) : !isMulti && selectedValues.length > 0 ? (
            (() => {
              const currentOption = options.find((opt) => opt.value === selectedValues[0]);
              const displayLabel = currentOption ? currentOption.label : selectedValues[0];
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  {currentOption?.icon && <span>{currentOption.icon}</span>}
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 500,
                    }}
                  >
                    {displayLabel}
                  </span>
                  {currentOption?.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(120, 30, 49, 0.25)',
                        color: '#E098A3',
                        border: '1px solid rgba(120, 30, 49, 0.4)',
                      }}
                    >
                      {currentOption.badge}
                    </span>
                  )}
                </div>
              );
            })()
          ) : (
            <span style={{ color: '#6A736E' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selection"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8E948D',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            style={{
              color: '#8E948D',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          />
        </div>
      </div>

      {helpText && !error && (
        <div style={{ fontSize: '11px', color: '#8E948D', marginTop: '4px' }}>{helpText}</div>
      )}
      {error && <div style={{ fontSize: '11px', color: '#E06C75', marginTop: '4px' }}>{error}</div>}

      {/* PORTAL-BASED DROPDOWN POPUP: Rendered directly to document.body to prevent ANY modal clipping */}
      {isOpen &&
        popupPos &&
        ReactDOM.createPortal(
          <div
            ref={popupRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={isMulti}
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
            {/* Search Input Box */}
            <div
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <Search size={14} color="#8E948D" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#F4F3EE',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8E948D',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Options List (Scrollable) */}
            <div
              style={{
                overflowY: 'auto',
                flex: 1,
                padding: '4px',
              }}
            >
              {loading ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#8E948D', fontSize: '13px' }}>
                  Loading options...
                </div>
              ) : filteredOptions.length === 0 && !showCustomOption ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#8E948D', fontSize: '13px' }}>
                  {emptyText}
                </div>
              ) : (
                <>
                  {Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                    <div key={groupName || 'ungrouped'}>
                      {groupName && (
                        <div
                          style={{
                            padding: '6px 10px 2px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: '#8E948D',
                            fontWeight: 600,
                          }}
                        >
                          {groupName}
                        </div>
                      )}
                      {groupOpts.map((opt) => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                          <div
                            key={opt.value}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelect(opt.value)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '4px',
                              backgroundColor: isSelected
                                ? 'rgba(140, 21, 36, 0.22)'
                                : 'transparent',
                              color: isSelected ? '#FFFFFF' : '#F4F3EE',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background-color 0.1s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                                  'rgba(255, 255, 255, 0.06)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                                  'transparent';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              {opt.icon && <span>{opt.icon}</span>}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                                  {opt.badge && (
                                    <span
                                      style={{
                                        fontSize: '9px',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        color: '#C7CDC5',
                                      }}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                {opt.description && (
                                  <div
                                    style={{
                                      fontSize: '11px',
                                      color: '#8E948D',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      marginTop: '1px',
                                    }}
                                  >
                                    {opt.description}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isSelected && <Check size={14} color="#E098A3" />}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Custom Value Entry Option */}
                  {showCustomOption && (
                    <div
                      role="option"
                      onClick={() => handleSelect(searchQuery.trim())}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(140, 21, 36, 0.15)',
                        border: '1px dashed rgba(140, 21, 36, 0.4)',
                        color: '#F4F3EE',
                        fontSize: '13px',
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      <Plus size={14} color="#E06C75" />
                      <span>
                        {customPrompt} <strong style={{ color: '#E06C75' }}>"{searchQuery.trim()}"</strong>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Multi-Select Footer */}
            {isMulti && selectedValues.length > 0 && (
              <div
                style={{
                  padding: '6px 10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#8E948D' }}>
                  {selectedValues.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E06C75',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
