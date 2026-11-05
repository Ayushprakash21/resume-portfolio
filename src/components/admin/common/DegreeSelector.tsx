import React, { useMemo } from 'react';
import { Award } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface DegreeSelectorProps {
  value: string;
  onChange: (degree: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const STANDARD_DEGREES: Array<{ name: string; category: string; badge?: string }> = [
  { name: 'Master of Business Administration (MBA)', category: 'Postgraduate Business', badge: 'Resume Master' },
  { name: 'Master of Business Administration (MBA) - IT & Marketing', category: 'Postgraduate Business & Tech', badge: 'Resume Exact' },
  { name: 'Bachelor of Commerce (B.Com.)', category: 'Undergraduate Commerce', badge: 'Resume Bachelor' },
  { name: 'Bachelor of Commerce (B.Com.) - Computer Applications', category: 'Undergraduate Commerce & Tech', badge: 'Resume Exact' },
  { name: 'Bachelor of Technology (B.Tech)', category: 'Undergraduate Engineering' },
  { name: 'Bachelor of Engineering (B.E.)', category: 'Undergraduate Engineering' },
  { name: 'Bachelor of Science (B.Sc.)', category: 'Undergraduate Science' },
  { name: 'Master of Science (M.S. / M.Sc.)', category: 'Postgraduate Science & Engineering' },
  { name: 'Master of Technology (M.Tech)', category: 'Postgraduate Engineering' },
  { name: 'Post Graduate Diploma in Management (PGDM)', category: 'Postgraduate Management' },
  { name: 'Bachelor of Business Administration (BBA)', category: 'Undergraduate Business' },
  { name: 'Doctor of Philosophy (Ph.D.)', category: 'Doctorate' },
];

export const DegreeSelector: React.FC<DegreeSelectorProps> = ({
  value,
  onChange,
  label = 'Degree / Qualification',
  required = true,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    STANDARD_DEGREES.forEach((deg) => {
      map.set(deg.name.toLowerCase(), {
        value: deg.name,
        label: deg.name,
        description: deg.category,
        badge: deg.badge,
        icon: <Award size={14} color="#D5D2D6" />,
      });
    });

    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom degree qualification',
        badge: 'Custom',
        icon: <Award size={14} color="#E098A3" />,
      });
    }

    return Array.from(map.values());
  }, [value]);

  return (
    <SearchableSelect
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select or enter degree qualification..."
      searchPlaceholder="Search degree (e.g. MBA, B.Com, B.Tech)..."
      allowCustom={true}
      customPrompt="Add custom degree:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select standard qualification or type custom qualification."
    />
  );
};
