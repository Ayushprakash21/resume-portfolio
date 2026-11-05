import React, { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';

export interface InstitutionSelectorProps {
  value: string;
  onChange: (institution: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

// Authoritative institutions from resume + premier universities
const CURATED_INSTITUTIONS: Array<{ name: string; location: string; badge?: string }> = [
  { name: 'Devi Ahilya University, Indore (IPS Academy)', location: 'Indore, Madhya Pradesh, India', badge: 'Resume MBA' },
  { name: 'Rani Durgavati University, Jabalpur (GS College)', location: 'Jabalpur, Madhya Pradesh, India', badge: 'Resume B.Com' },
  { name: 'IPS Academy, Indore', location: 'Indore, Madhya Pradesh, India' },
  { name: 'GS College of Commerce and Economics, Jabalpur', location: 'Jabalpur, Madhya Pradesh, India' },
  { name: 'Indian Institute of Management Indore (IIM Indore)', location: 'Indore, India' },
  { name: 'Indian Institute of Technology Bombay (IIT Bombay)', location: 'Mumbai, India' },
  { name: 'Indian Institute of Technology Delhi (IIT Delhi)', location: 'New Delhi, India' },
  { name: 'Birla Institute of Technology and Science (BITS Pilani)', location: 'Pilani, India' },
  { name: 'Stanford University', location: 'Stanford, CA, USA' },
  { name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA, USA' },
];

export const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({
  value,
  onChange,
  label = 'School / University / Institute',
  required = true,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing CMS education records
    try {
      const cmsEdu = cmsService.getEducation();
      cmsEdu.forEach((edu) => {
        const inst = edu.institution?.trim();
        if (inst && !map.has(inst.toLowerCase())) {
          map.set(inst.toLowerCase(), {
            value: inst,
            label: inst,
            description: edu.degree ? `Degree: ${edu.degree}` : 'Existing CMS record',
            badge: 'CMS Record',
            icon: <GraduationCap size={14} color="#6CE098" />,
          });
        }
      });
    } catch {}

    // 2. Curated institutions
    CURATED_INSTITUTIONS.forEach((item) => {
      if (!map.has(item.name.toLowerCase())) {
        map.set(item.name.toLowerCase(), {
          value: item.name,
          label: item.name,
          description: item.location,
          badge: item.badge || 'University',
          icon: <GraduationCap size={14} color="#D5D2D6" />,
        });
      }
    });

    // 3. Current value if custom
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom entry',
        badge: 'Custom',
        icon: <GraduationCap size={14} color="#E098A3" />,
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
      placeholder="Select or enter institution name..."
      searchPlaceholder="Search university or college (e.g. Devi Ahilya, Rani Durgavati)..."
      allowCustom={true}
      customPrompt="Add custom institution:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select an established academic institution or enter your custom university."
    />
  );
};
