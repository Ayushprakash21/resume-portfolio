import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';

export interface ProjectCategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const STANDARD_CATEGORIES: Array<{ name: string; description: string; badge?: string }> = [
  { name: 'Enterprise AI & Systems', description: 'Enterprise-grade applied AI architecture', badge: 'Featured' },
  { name: 'Supply Chain Operating System', description: 'Real-time logistics & supply chain platform', badge: 'Core' },
  { name: 'Autonomous Platforms & Agents', description: 'Autonomous agentic frameworks & workflows', badge: 'AI Agents' },
  { name: 'Cloud Architecture & Infrastructure', description: 'Distributed systems & zero-trust infrastructure' },
  { name: 'Full-Stack Web Application', description: 'Production full-stack web platforms' },
  { name: 'Developer Tooling & CLI', description: 'Automation and developer productivity systems' },
  { name: 'API & Microservices Architecture', description: 'High-throughput enterprise service bus' },
  { name: 'Open Source System', description: 'Public open-source architectural frameworks' },
  { name: 'Research & Technical Specification', description: 'Applied computing and technical architecture prototypes' },
];

export const ProjectCategorySelector: React.FC<ProjectCategorySelectorProps> = ({
  value,
  onChange,
  label = 'Category',
  required = false,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing CMS project categories
    try {
      const cmsProjects = cmsService.getProjects();
      cmsProjects.forEach((proj) => {
        const cat = proj.category?.trim();
        if (cat && !map.has(cat.toLowerCase())) {
          map.set(cat.toLowerCase(), {
            value: cat,
            label: cat,
            description: `From project: ${proj.name}`,
            badge: 'CMS Project',
            icon: <Layers size={14} color="#6CE098" />,
          });
        }
      });
    } catch {}

    // 2. Standard categories
    STANDARD_CATEGORIES.forEach((item) => {
      if (!map.has(item.name.toLowerCase())) {
        map.set(item.name.toLowerCase(), {
          value: item.name,
          label: item.name,
          description: item.description,
          badge: item.badge,
          icon: <Layers size={14} color="#D5D2D6" />,
        });
      }
    });

    // 3. Custom value if present
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom category',
        badge: 'Custom',
        icon: <Layers size={14} color="#E098A3" />,
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
      placeholder="Select or enter project category..."
      searchPlaceholder="Search project category..."
      allowCustom={true}
      customPrompt="Add custom category:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Categorize this technical project within the portfolio showcase."
    />
  );
};
