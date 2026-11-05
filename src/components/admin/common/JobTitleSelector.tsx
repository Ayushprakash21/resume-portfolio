import React, { useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';

export interface JobTitleSelectorProps {
  value: string;
  onChange: (jobTitle: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const AUTHORITATIVE_TITLES: Array<{ title: string; category: string; badge?: string }> = [
  { title: 'Operations & Systems Specialist', category: 'Operations & Systems', badge: 'Resume Exact' },
  { title: 'Lead System Architect & Founder', category: 'Leadership & Architecture', badge: 'Resume Exact' },
  { title: 'Founder & Principal Architect', category: 'Leadership & Architecture', badge: 'Executive' },
  { title: 'Enterprise Solutions Specialist', category: 'Enterprise Technology' },
  { title: 'Supply Chain Architecture Lead', category: 'Logistics & Systems', badge: 'Domain Lead' },
  { title: 'Senior Full-Stack AI Engineer', category: 'Engineering & AI' },
  { title: 'Autonomous Systems Architect', category: 'AI & Systems' },
  { title: 'Technology Consultant', category: 'Advisory & Strategy' },
  { title: 'Product Operations Lead', category: 'Product & Operations' },
  { title: 'Solutions Architect', category: 'Cloud & Infrastructure' },
  { title: 'Senior Systems Analyst', category: 'Information Systems' },
  { title: 'Logistics Systems Engineer', category: 'Operations & Supply Chain' },
  { title: 'Software Engineer', category: 'Engineering' },
  { title: 'Full-Stack Developer', category: 'Software Development' },
  { title: 'Technical Product Manager', category: 'Product Strategy' },
];

export const JobTitleSelector: React.FC<JobTitleSelectorProps> = ({
  value,
  onChange,
  label = 'Job Title',
  required = true,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing CMS experience titles
    try {
      const cmsExp = cmsService.getExperiences();
      cmsExp.forEach((exp) => {
        const title = exp.jobTitle?.trim();
        if (title && !map.has(title.toLowerCase())) {
          map.set(title.toLowerCase(), {
            value: title,
            label: title,
            description: exp.employer ? `At: ${exp.employer}` : 'Existing CMS record',
            badge: 'CMS Experience',
            icon: <Briefcase size={14} color="#6CE098" />,
          });
        }
      });
    } catch {}

    // 2. Authoritative titles
    AUTHORITATIVE_TITLES.forEach((item) => {
      if (!map.has(item.title.toLowerCase())) {
        map.set(item.title.toLowerCase(), {
          value: item.title,
          label: item.title,
          description: item.category,
          badge: item.badge,
          icon: <Briefcase size={14} color="#D5D2D6" />,
        });
      }
    });

    // 3. Custom value if present
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom job title',
        badge: 'Custom',
        icon: <Briefcase size={14} color="#E098A3" />,
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
      placeholder="Select or enter job title..."
      searchPlaceholder="Search job title (e.g. Operations & Systems Specialist)..."
      allowCustom={true}
      customPrompt="Add custom title:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select from career history or enter a specific executive role."
    />
  );
};
