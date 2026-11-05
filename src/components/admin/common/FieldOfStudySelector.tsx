import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';

export interface FieldOfStudySelectorProps {
  value: string;
  onChange: (field: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const STANDARD_FIELDS: Array<{ name: string; category: string; badge?: string }> = [
  { name: 'IT & Marketing', category: 'Business & Technology', badge: 'Resume Exact' },
  { name: 'Computer Applications', category: 'Computing & Software', badge: 'Resume Exact' },
  { name: 'Computer Science & Engineering', category: 'Engineering' },
  { name: 'Information Technology', category: 'Technology' },
  { name: 'Artificial Intelligence & Machine Learning', category: 'Advanced Computing' },
  { name: 'Business Administration & Management', category: 'Business' },
  { name: 'Finance & Financial Analytics', category: 'Commerce & Finance' },
  { name: 'Supply Chain & Operations Management', category: 'Operations' },
  { name: 'Commerce & Accounting', category: 'Commerce' },
  { name: 'Software Engineering', category: 'Engineering' },
  { name: 'Data Science & Big Data Analytics', category: 'Data' },
  { name: 'Economics & Econometrics', category: 'Social Sciences' },
  { name: 'Cybersecurity & Systems Assurance', category: 'Security' },
  { name: 'Cloud Computing & Distributed Systems', category: 'Systems' },
];

export const FieldOfStudySelector: React.FC<FieldOfStudySelectorProps> = ({
  value,
  onChange,
  label = 'Field of Study',
  required = false,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing CMS education records
    try {
      const cmsEdu = cmsService.getEducation();
      cmsEdu.forEach((edu) => {
        const field = edu.fieldOfStudy?.trim();
        if (field && !map.has(field.toLowerCase())) {
          map.set(field.toLowerCase(), {
            value: field,
            label: field,
            description: edu.degree ? `From: ${edu.degree}` : 'Existing CMS record',
            badge: 'CMS Record',
            icon: <BookOpen size={14} color="#6CE098" />,
          });
        }
      });
    } catch {}

    // 2. Curated standard fields
    STANDARD_FIELDS.forEach((item) => {
      if (!map.has(item.name.toLowerCase())) {
        map.set(item.name.toLowerCase(), {
          value: item.name,
          label: item.name,
          description: item.category,
          badge: item.badge,
          icon: <BookOpen size={14} color="#D5D2D6" />,
        });
      }
    });

    // 3. Custom value if present
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom field of study',
        badge: 'Custom',
        icon: <BookOpen size={14} color="#E098A3" />,
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
      placeholder="Select or enter field of study..."
      searchPlaceholder="Search field (e.g. IT & Marketing, Computer Applications)..."
      allowCustom={true}
      customPrompt="Add custom field:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select from standard disciplines or enter a specialized concentration."
    />
  );
};
