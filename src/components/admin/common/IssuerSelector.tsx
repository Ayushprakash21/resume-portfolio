import React, { useMemo } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { VERIFIED_ISSUERS_DIRECTORY } from '../../../services/issuerService';
import { cmsService } from '../../../services/cmsService';
import { IssuerRecord } from '../../../types/cms';

export interface IssuerSelectorProps {
  value: string;
  onChange: (issuerName: string, selectedRecord?: Partial<IssuerRecord>) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const IssuerSelector: React.FC<IssuerSelectorProps> = ({
  value,
  onChange,
  label = 'Issuing Organization',
  required = true,
  error,
  disabled = false,
}) => {
  const options = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();

    // 1. Existing verified directory
    (VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]).forEach((iss) => {
      map.set(iss.issuerName.toLowerCase(), {
        value: iss.issuerName,
        label: iss.issuerName,
        description: iss.issuerWebsite || iss.issuerDomain,
        badge: 'Verified Issuer',
        icon: <ShieldCheck size={14} color="#6CE098" />,
      });
    });

    // 2. Issuers from certifications in CMS
    try {
      const cmsCerts = cmsService.getCertifications();
      cmsCerts.forEach((c) => {
        const name = c.issuer?.trim();
        if (name && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), {
            value: name,
            label: name,
            description: c.title ? `Associated: ${c.title}` : 'CMS Accreditation Body',
            badge: 'CMS Issuer',
            icon: <CheckCircle2 size={14} color="#D5D2D6" />,
          });
        }
      });
    } catch {}

    // 3. Custom entry if not in map
    if (value && !map.has(value.trim().toLowerCase())) {
      map.set(value.trim().toLowerCase(), {
        value: value.trim(),
        label: value.trim(),
        description: 'Custom issuer body',
        badge: 'Custom',
        icon: <ShieldCheck size={14} color="#E098A3" />,
      });
    }

    return Array.from(map.values());
  }, [value]);

  const handleChange = (selectedName: string) => {
    const verified = (VERIFIED_ISSUERS_DIRECTORY as IssuerRecord[]).find(
      (iss) => iss.issuerName.toLowerCase() === selectedName.trim().toLowerCase()
    );
    onChange(selectedName, verified);
  };

  return (
    <SearchableSelect
      label={label}
      required={required}
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select or enter issuing organization..."
      searchPlaceholder="Search issuer (e.g. Anthropic, Google, DeepLearning.AI)..."
      allowCustom={true}
      customPrompt="Add custom issuer:"
      clearable={true}
      disabled={disabled}
      error={error}
      helpText="Select verified accreditation authority or enter custom organization."
    />
  );
};
