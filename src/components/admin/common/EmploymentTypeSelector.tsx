import React, { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface EmploymentTypeSelectorProps {
  value: string;
  onChange: (employmentType: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
}

const EMPLOYMENT_TYPES: Array<{ name: string; description: string; badge?: string }> = [
  { name: 'Full-time', description: 'Permanent full-time commitment', badge: 'Standard' },
  { name: 'Part-time', description: 'Regular part-time schedule' },
  { name: 'Contract', description: 'Fixed-term or project contract', badge: 'Contractor' },
  { name: 'Freelance', description: 'Independent consulting / project-based' },
  { name: 'Internship', description: 'Apprentice / training engagement' },
  { name: 'Self-employed', description: 'Independent principal / consultant' },
  { name: 'Founder', description: 'Founder / Co-founder of venture', badge: 'Executive' },
  { name: 'Founder / Self-employed', description: 'Venture founder and independent operator', badge: 'Leadership' },
  { name: 'Apprenticeship', description: 'Structured industry training' },
];

export const EmploymentTypeSelector: React.FC<EmploymentTypeSelectorProps> = ({
  value,
  onChange,
  label = 'Role Classification / Employment Type',
  required = false,
  error,
  disabled = false,
  allowEmpty = true,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const list: SearchableOption[] = EMPLOYMENT_TYPES.map((t) => ({
      value: t.name,
      label: t.name,
      description: t.description,
      badge: t.badge,
      icon: <Tag size={13} color="#D5D2D6" />,
    }));

    if (value && !list.some((o) => o.value.toLowerCase() === value.trim().toLowerCase())) {
      list.unshift({
        value: value.trim(),
        label: value.trim(),
        description: 'Custom classification',
        badge: 'Custom',
        icon: <Tag size={13} color="#E098A3" />,
      });
    }

    return list;
  }, [value]);

  return (
    <SearchableSelect
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={allowEmpty ? 'None / Not Specified (No Badge)' : 'Select employment type...'}
      searchPlaceholder="Search employment type (e.g. Full-time, Contract, Founder)..."
      allowCustom={true}
      customPrompt="Use custom classification:"
      clearable={allowEmpty}
      disabled={disabled}
      error={error}
      helpText="Leave empty to hide badge on the public portfolio."
    />
  );
};
