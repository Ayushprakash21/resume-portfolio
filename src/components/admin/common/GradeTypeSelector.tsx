import React, { useMemo } from 'react';
import { Award } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface GradeTypeSelectorProps {
  value: string;
  onChange: (gradeType: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const STANDARD_GRADES: Array<{ name: string; description: string; badge?: string }> = [
  { name: 'First Class with Distinction', description: 'Academic Honors Distinction', badge: 'Honors' },
  { name: 'First Class', description: 'Top Division Graduate', badge: 'Division 1' },
  { name: 'CGPA (out of 10.0)', description: 'Cumulative Grade Point Average', badge: 'Scale 10' },
  { name: 'GPA (out of 4.0)', description: 'Grade Point Average', badge: 'Scale 4' },
  { name: 'Percentage (%)', description: 'Overall Aggregate Marks', badge: 'Percent' },
  { name: 'Grade A+ / Magna Cum Laude', description: 'Highest Academic Honor', badge: 'Distinction' },
  { name: 'Grade A', description: 'Excellent Academic Standing' },
  { name: 'Second Division / Merit', description: 'Upper Second Division' },
  { name: 'Pass / Completed', description: 'Standard Degree Completion' },
];

export const GradeTypeSelector: React.FC<GradeTypeSelectorProps> = ({
  value,
  onChange,
  label = 'Grade / Honors Standing',
  required = false,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const list: SearchableOption[] = STANDARD_GRADES.map((g) => ({
      value: g.name,
      label: g.name,
      description: g.description,
      badge: g.badge,
      icon: <Award size={13} color="#D5D2D6" />,
    }));

    if (value && !list.some((o) => o.value.toLowerCase() === value.trim().toLowerCase())) {
      list.unshift({
        value: value.trim(),
        label: value.trim(),
        description: 'Custom academic standing',
        badge: 'Custom',
        icon: <Award size={13} color="#E098A3" />,
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
      placeholder="Select or enter grade / honors..."
      searchPlaceholder="Search grade (e.g. First Class, CGPA, Distinction)..."
      allowCustom={true}
      customPrompt="Use custom grade:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select formal academic distinction or type exact score."
    />
  );
};
