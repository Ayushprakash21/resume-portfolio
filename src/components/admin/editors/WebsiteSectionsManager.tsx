import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { SectionConfig } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';

interface WebsiteSectionsManagerProps {
  sections: SectionConfig[];
  onUpdate: (updated: SectionConfig[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WebsiteSectionsManager: React.FC<WebsiteSectionsManagerProps> = ({
  sections,
  onUpdate,
  showNotification,
}) => {
  const [list, setList] = useState<SectionConfig[]>(sections);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const copy = [...list];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-index
    copy.forEach((s, i) => {
      s.displayOrder = i + 1;
    });

    try {
      setList(copy);
      await cmsService.updateSectionsConfig(copy);
      onUpdate(copy);
      showNotification('Section display order updated on live site.');
    } catch (err: any) {
      showNotification('Update failed: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const updated = list.map((s) =>
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    );
    try {
      setList(updated);
      await cmsService.updateSectionsConfig(updated);
      onUpdate(updated);
      const item = updated.find((s) => s.id === id);
      showNotification(
        `Section "${item?.title}" is now ${item?.isVisible ? 'Visible' : 'Hidden'} on live website.`
      );
    } catch (err: any) {
      showNotification('Update failed: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleTitleChange = async (id: string, newTitle: string, newSubtitle: string) => {
    const updated = list.map((s) =>
      s.id === id ? { ...s, title: newTitle, subtitle: newSubtitle } : s
    );
    try {
      setList(updated);
      await cmsService.updateSectionsConfig(updated);
      onUpdate(updated);
    } catch (err: any) {
      showNotification('Update failed: ' + (err.message || 'Error'), 'error');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 600,
              color: '#F4F3EE',
              margin: 0,
            }}
          >
            Website Sections &amp; Display Order
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Govern the exact vertical sequence and visibility of sections across your cinematic homepage.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map((sec, idx) => (
          <div
            key={sec.id}
            style={{
              backgroundColor: '#141C19',
              border: sec.isVisible
                ? '1px solid rgba(244, 243, 238, 0.08)'
                : '1px solid rgba(244, 243, 238, 0.04)',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: sec.isVisible ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              {/* Order index */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1E2822',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: sec.isVisible ? '#6CE098' : '#8E948D',
                }}
              >
                {idx + 1}
              </div>

              {/* Title & subtitle inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, maxWidth: '520px' }}>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleTitleChange(sec.id, e.target.value, sec.subtitle)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#F4F3EE',
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    padding: '2px 0',
                  }}
                />
                <input
                  type="text"
                  value={sec.subtitle}
                  onChange={(e) => handleTitleChange(sec.id, sec.title, e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#8294A6',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    outline: 'none',
                    padding: '2px 0',
                  }}
                />
              </div>
            </div>

            {/* Controls: Up/Down + Visibility Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                title="Move Section Up"
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(244, 243, 238, 0.05)',
                  border: '1px solid rgba(244, 243, 238, 0.1)',
                  color: idx === 0 ? '#4E5A52' : '#F4F3EE',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronUp size={16} />
              </button>

              <button
                type="button"
                disabled={idx === list.length - 1}
                onClick={() => handleMove(idx, 'down')}
                title="Move Section Down"
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(244, 243, 238, 0.05)',
                  border: '1px solid rgba(244, 243, 238, 0.1)',
                  color: idx === list.length - 1 ? '#4E5A52' : '#F4F3EE',
                  cursor: idx === list.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronDown size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleToggleVisibility(sec.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: sec.isVisible
                    ? 'rgba(74, 180, 120, 0.15)'
                    : 'rgba(217, 83, 79, 0.15)',
                  border: `1px solid ${
                    sec.isVisible ? 'rgba(74, 180, 120, 0.3)' : 'rgba(217, 83, 79, 0.3)'
                  }`,
                  color: sec.isVisible ? '#6CE098' : '#E06C75',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {sec.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                {sec.isVisible ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
