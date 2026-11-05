import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { cmsService } from '../../../services/cmsService';

export interface CompanySelectorProps {
  value: string;
  onChange: (companyName: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

// Authoritative companies from Ayush Prakash's resume
const RESUME_COMPANIES: Array<{ name: string; industry: string; location: string }> = [
  { name: 'Tata Consultancy Services', industry: 'Supply Chain Operations & IT Services', location: 'Indore, India' },
  { name: 'ESP Softtech Pvt. Ltd.', industry: 'Software Engineering & Project Management', location: 'Indore, India' },
  { name: 'SynergyTop Softlabs Pvt. Ltd.', industry: 'Digital Product Development', location: 'Indore, India' },
  { name: 'Accenture Solutions Pvt. Ltd.', industry: 'Consulting & Technology Delivery', location: 'Indore, India' },
  { name: 'Teleperformance', industry: 'Customer Experience & Business Operations', location: 'India' },
  { name: 'Toppr Technologies', industry: 'EdTech & Business Development', location: 'India' },
  { name: 'ICICI Bank', industry: 'Banking Operations & Relationship Management', location: 'Anand, India' },
];

// Global enterprise operations & technology directory
const GLOBAL_ENTERPRISE_COMPANIES: Array<{ name: string; industry: string }> = [
  { name: 'Google', industry: 'Cloud & AI Technology' },
  { name: 'Microsoft', industry: 'Enterprise Platforms & Cloud' },
  { name: 'Amazon', industry: 'Logistics, eCommerce & Cloud' },
  { name: 'Apple', industry: 'Hardware & Operating Systems' },
  { name: 'Meta', industry: 'AI & Social Infrastructure' },
  { name: 'Anthropic', industry: 'AI Research & Foundation Models' },
  { name: 'OpenText', industry: 'Enterprise Information Management (VIM)' },
  { name: 'SAP', industry: 'Enterprise Resource Planning (ERP)' },
  { name: 'Oracle', industry: 'Database & Cloud Applications' },
  { name: 'Salesforce', industry: 'Enterprise CRM Platforms' },
  { name: 'IBM', industry: 'Enterprise Hybrid Cloud & Consulting' },
  { name: 'Infosys', industry: 'IT & Digital Consulting' },
  { name: 'Wipro', industry: 'Technology Services & Digital Operations' },
  { name: 'Capgemini', industry: 'Consulting, Technology & Digital Services' },
  { name: 'Cognizant', industry: 'Digital Systems & Operations' },
  { name: 'Cisco Systems', industry: 'Networking & Telecommunications' },
  { name: 'Dell Technologies', industry: 'Enterprise Infrastructure & Hardware' },
  { name: 'Intel Corporation', industry: 'Semiconductors & Compute' },
  { name: 'NVIDIA', industry: 'Accelerated Computing & AI Hardware' },
];

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  value,
  onChange,
  label = 'Company / Organization',
  required = true,
  error,
  disabled = false,
}) => {
  // Aggregate companies dynamically from CMS experiences + Resume + Directory
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing CMS experiences (dynamic from Firestore / LocalStorage)
    try {
      const cmsExps = cmsService.getExperiences();
      cmsExps.forEach((exp) => {
        const name = exp.employer?.trim();
        if (name && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), {
            value: name,
            label: name,
            description: exp.jobTitle ? `Current/Previous: ${exp.jobTitle}` : 'Existing CMS record',
            badge: 'CMS Record',
            icon: <Building2 size={14} color="#6CE098" />,
          });
        }
      });
    } catch {
      // Ignore if cmsService is initializing
    }

    // 2. Authoritative Resume Companies
    RESUME_COMPANIES.forEach((c) => {
      if (!map.has(c.name.toLowerCase())) {
        map.set(c.name.toLowerCase(), {
          value: c.name,
          label: c.name,
          description: `${c.industry} • ${c.location}`,
          badge: 'Resume Organization',
          icon: <Building2 size={14} color="#D5D2D6" />,
        });
      }
    });

    // 3. Global enterprise directory
    GLOBAL_ENTERPRISE_COMPANIES.forEach((c) => {
      if (!map.has(c.name.toLowerCase())) {
        map.set(c.name.toLowerCase(), {
          value: c.name,
          label: c.name,
          description: c.industry,
          badge: 'Enterprise Directory',
          icon: <Building2 size={14} color="#7E8782" />,
        });
      }
    });

    // 4. If current value isn't in map yet, add it
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom entry',
        badge: 'Custom',
        icon: <Building2 size={14} color="#E098A3" />,
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
      placeholder="Select or enter company name..."
      searchPlaceholder="Search company (e.g. TCS, Accenture, ESP Softtech)..."
      allowCustom={true}
      customPrompt="Add custom company:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select an existing company from your resume, enterprise directory, or type a custom name."
    />
  );
};
