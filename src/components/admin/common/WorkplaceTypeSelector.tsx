import React from 'react';
import { Building2, Laptop, Globe2 } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface WorkplaceTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const WORKPLACE_OPTIONS: SearchableOption[] = [
  {
    value: 'On-site',
    label: 'On-site',
    description: 'Work conducted physically at company premises',
    badge: 'Physical',
    icon: <Building2 size={13} color="#D5D2D6" />,
  },
  {
    value: 'Hybrid',
    label: 'Hybrid',
    description: 'Flexible split between on-site and remote work',
    badge: 'Flexible',
    icon: <Laptop size={13} color="#6CE098" />,
  },
  {
    value: 'Remote',
    label: 'Remote',
    description: 'Fully distributed, location-independent work',
    badge: 'Global',
    icon: <Globe2 size={13} color="#8294A6" />,
  },
];

export const WorkplaceTypeSelector: React.FC<WorkplaceTypeSelectorProps> = ({
  value,
  onChange,
  label = 'Workplace Type',
  required = false,
  error,
  disabled = false,
}) => {
  return (
    <SearchableSelect
      label={label}
      required={required}
      options={WORKPLACE_OPTIONS}
      value={value || 'Hybrid'}
      onChange={onChange}
      placeholder="Select workplace type..."
      searchPlaceholder="Search workplace arrangement..."
      allowCustom={false}
      clearable={false}
      disabled={disabled}
      error={error}
    />
  );
};
