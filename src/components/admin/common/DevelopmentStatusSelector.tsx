import React from 'react';
import { Activity, CheckCircle2, FlaskConical, Rocket, Archive } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';

export interface DevelopmentStatusSelectorProps {
  value: string;
  onChange: (status: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const STATUS_OPTIONS: SearchableOption[] = [
  {
    value: 'Active Architectural Prototype & Research',
    label: 'Active Architectural Prototype & Research',
    description: 'Ongoing technical prototype and architecture validation',
    badge: 'Research',
    icon: <FlaskConical size={13} color="#E098A3" />,
  },
  {
    value: 'Active Independent Product Development',
    label: 'Active Independent Product Development',
    description: 'Active commercial product engineering & rollout',
    badge: 'Active',
    icon: <Activity size={13} color="#6CE098" />,
  },
  {
    value: 'Production System',
    label: 'Production System',
    description: 'Live deployment servicing enterprise workloads',
    badge: 'Production',
    icon: <Rocket size={13} color="#64B5F6" />,
  },
  {
    value: 'Concept & Specification',
    label: 'Concept & Specification',
    description: 'High-level architectural blueprint and formal spec',
    badge: 'Concept',
    icon: <CheckCircle2 size={13} color="#FFB74D" />,
  },
  {
    value: 'Completed',
    label: 'Completed',
    description: 'Finished system successfully delivered',
    badge: 'Finished',
    icon: <Archive size={13} color="#8E948D" />,
  },
];

export const DevelopmentStatusSelector: React.FC<DevelopmentStatusSelectorProps> = ({
  value,
  onChange,
  label = 'Development Status',
  required = false,
  error,
  disabled = false,
}) => {
  return (
    <SearchableSelect
      label={label}
      required={required}
      options={STATUS_OPTIONS}
      value={value || 'Active Architectural Prototype & Research'}
      onChange={onChange}
      placeholder="Select status..."
      searchPlaceholder="Filter development status..."
      allowCustom={true}
      clearable={false}
      disabled={disabled}
      error={error}
    />
  );
};
