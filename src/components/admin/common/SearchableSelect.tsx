import React, { useState, useRef, useEffect, useId } from 'react';
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
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  customPrompt?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  style?: React.CSSProperties;
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter options
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(trimmedQuery) ||
      opt.value.toLowerCase().includes(trimmedQuery) ||
      (opt.description && opt.description.toLowerCase().includes(trimmedQuery)) ||
      (opt.group && opt.group.toLowerCase().includes(trimmedQuery))
  );

  const exactMatchExists = options.some(
    (opt) => opt.value.toLowerCase() === trimmedQuery || opt.label.toLowerCase() === trimmedQuery
  );

  const showCustomOption = allowCustom && trimmedQuery.length > 0 && !exactMatchExists;

  const currentOption = options.find((opt) => opt.value === value);
  const displayLabel = currentOption ? currentOption.label : value;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
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
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', ...style }} ref={containerRef}>
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
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: disabled ? '#080C0B' : '#0E1412',
          border: error
            ? '1px solid #E06C75'
            : isOpen
            ? '1px solid #8C1524'
            : '1px solid rgba(244, 243, 238, 0.12)',
          color: displayLabel ? '#F4F3EE' : '#6A736E',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(140, 21, 36, 0.25)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
          {currentOption?.icon && <span>{currentOption.icon}</span>}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: currentOption ? 500 : 400,
            }}
          >
            {displayLabel || placeholder}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
          {clearable && value && !disabled && (
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            backgroundColor: '#0F1216',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '8px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#14181F',
            }}
          >
            <Search size={14} color="#8E948D" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F4F3EE',
                fontSize: '13px',
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
                  padding: '2px',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {filteredOptions.length === 0 && !showCustomOption && (
              <div
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#8E948D',
                }}
              >
                No matching options found.
              </div>
            )}

            {filteredOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={opt.value + '-' + idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: isHighlighted
                      ? 'rgba(120, 30, 49, 0.28)'
                      : isSelected
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#D5D2D6',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {opt.icon && <span>{opt.icon}</span>}
                      <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#A7B0A9',
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <span style={{ fontSize: '11px', color: '#7E8782' }}>{opt.description}</span>
                    )}
                  </div>
                  {isSelected && <Check size={14} color="#6CE098" />}
                </div>
              );
            })}

            {/* Custom Entry Option */}
            {showCustomOption && (
              <div
                role="option"
                onClick={() => handleSelect(searchQuery.trim())}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor:
                    highlightedIndex === filteredOptions.length
                      ? 'rgba(120, 30, 49, 0.35)'
                      : 'rgba(120, 30, 49, 0.12)',
                  color: '#F4F3EE',
                }}
              >
                <Plus size={14} color="#E098A3" />
                <span>
                  {customPrompt} <strong>"{searchQuery.trim()}"</strong>
                </span>
              </div>
            )}
          </div>
        </div>
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
