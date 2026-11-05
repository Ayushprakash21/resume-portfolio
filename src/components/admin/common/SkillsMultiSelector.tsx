import React, { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';
import { SkillRecord } from '../../../types/cms';

export interface SkillsMultiSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  allSkills?: SkillRecord[];
}

export const SkillsMultiSelector: React.FC<SkillsMultiSelectorProps> = ({
  value = [],
  onChange,
  label = 'Associated Skills & Competencies',
  required = false,
  error,
  disabled = false,
  placeholder = 'Select skills or type custom skill...',
  helpText = 'Search verified skills or type to add custom capabilities.',
  allSkills,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Provided allSkills or from cmsService
    const skillsList = allSkills || (typeof window !== 'undefined' ? cmsService.getSkills() : []);
    skillsList.forEach((sk) => {
      const name = sk.name?.trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          value: name,
          label: name,
          description: sk.category || 'Skill',
          badge: sk.category ? sk.category.split(' ')[0] : undefined,
          icon: <Tag size={13} color="#D5D2D6" />,
        });
      }
    });

    // 2. Any currently selected values that aren't in the list
    (value || []).forEach((val) => {
      const trimmed = val?.trim();
      if (trimmed && !map.has(trimmed.toLowerCase())) {
        map.set(trimmed.toLowerCase(), {
          value: trimmed,
          label: trimmed,
          description: 'Custom added skill',
          badge: 'Custom',
          icon: <Tag size={13} color="#E098A3" />,
        });
      }
    });

    return Array.from(map.values());
  }, [allSkills, value]);

  return (
    <SearchableSelect
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Type skill name to search or add..."
      allowCustom={true}
      customPrompt="Add custom skill:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText={helpText}
      isMulti={true}
    />
  );
};
