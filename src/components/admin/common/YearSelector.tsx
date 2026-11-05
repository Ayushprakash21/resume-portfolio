import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface YearSelectorProps {
  value: string;
  onChange: (year: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  value,
  onChange,
  label = 'Year',
  required = false,
  error,
  disabled = false,
  placeholder = 'Select year...',
  minYear = 1985,
  maxYear = new Date().getFullYear() + 5,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const list: SearchableOption[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      const yearStr = y.toString();
      list.push({
        value: yearStr,
        label: yearStr,
        icon: <Calendar size={13} color="#8E948D" />,
      });
    }

    if (value && !list.some((o) => o.value === value.trim())) {
      list.unshift({
        value: value.trim(),
        label: value.trim(),
        description: 'Custom year value',
        badge: 'Custom',
        icon: <Calendar size={13} color="#E098A3" />,
      });
    }

    return list;
  }, [minYear, maxYear, value]);

  return (
    <SearchableSelect
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Type 4-digit year..."
      allowCustom={true}
      customPrompt="Use year:"
      clearable={!required}
      disabled={disabled}
      error={error}
    />
  );
};
