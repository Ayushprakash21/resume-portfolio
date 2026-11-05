import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

export interface DateMonthYearPickerProps {
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  requiresDateConfirmation?: boolean;
  onChange: (updated: {
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isCurrent: boolean;
    startDate: string;
    endDate: string;
    requiresDateConfirmation: boolean;
  }) => void;
  showCurrentToggle?: boolean;
}

const MONTH_OPTIONS = [
  { value: '', label: '— Month Not Specified (Year Only) —' },
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' },
];

export const DateMonthYearPicker: React.FC<DateMonthYearPickerProps> = ({
  startMonth = '',
  startYear = '',
  endMonth = '',
  endYear = '',
  isCurrent = false,
  requiresDateConfirmation = false,
  onChange,
  showCurrentToggle = true,
}) => {
  const computeStartDate = (m: string, y: string): string => {
    const trimmedYear = y.trim();
    if (!trimmedYear) return '';
    if (m && m.trim()) {
      return `${m.slice(0, 3)} ${trimmedYear}`;
    }
    return trimmedYear;
  };

  const computeEndDate = (curr: boolean, m: string, y: string): string => {
    if (curr) return 'Present';
    const trimmedYear = y.trim();
    if (!trimmedYear) return '';
    if (m && m.trim()) {
      return `${m.slice(0, 3)} ${trimmedYear}`;
    }
    return trimmedYear;
  };

  const isMissingMonth =
    (!startMonth && !!startYear) || (!isCurrent && !endMonth && !!endYear);

  const handleUpdate = (updates: Partial<{
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isCurrent: boolean;
    requiresDateConfirmation: boolean;
  }>) => {
    const nextStartMonth = updates.startMonth !== undefined ? updates.startMonth : startMonth;
    const nextStartYear = updates.startYear !== undefined ? updates.startYear : startYear;
    const nextEndMonth = updates.endMonth !== undefined ? updates.endMonth : endMonth;
    const nextEndYear = updates.endYear !== undefined ? updates.endYear : endYear;
    const nextIsCurrent = updates.isCurrent !== undefined ? updates.isCurrent : isCurrent;

    const startDate = computeStartDate(nextStartMonth, nextStartYear);
    const endDate = computeEndDate(nextIsCurrent, nextEndMonth, nextEndYear);

    const needsConfirm =
      (!nextStartMonth && !!nextStartYear) ||
      (!nextIsCurrent && !nextEndMonth && !!nextEndYear) ||
      updates.requiresDateConfirmation === true;

    onChange({
      startMonth: nextStartMonth,
      startYear: nextStartYear,
      endMonth: nextEndMonth,
      endYear: nextEndYear,
      isCurrent: nextIsCurrent,
      startDate,
      endDate,
      requiresDateConfirmation: needsConfirm,
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#0E1412',
        border: '1px solid rgba(244, 243, 238, 0.08)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Current Role Toggle */}
      {showCurrentToggle && (
        <div>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#F4F3EE',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => handleUpdate({ isCurrent: e.target.checked })}
              style={{ accentColor: '#781E31', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>I am currently working in this role (End date will be "Present")</span>
          </label>
        </div>
      )}

      {/* Date Pickers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Start Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: '#A7B0A9',
              marginBottom: '6px',
            }}
          >
            Start Date <span style={{ color: '#E06C75' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={startMonth}
              onChange={(e) => handleUpdate({ startMonth: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(18, 18, 22, 0.85)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                color: startMonth ? '#F4F3EE' : '#9296A1',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={startYear}
              onChange={(e) => handleUpdate({ startYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="YYYY"
              maxLength={4}
              style={{
                width: '80px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(18, 18, 22, 0.85)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                color: '#F4F3EE',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: isCurrent ? '#6B7F72' : '#A7B0A9',
              marginBottom: '6px',
            }}
          >
            End Date {isCurrent && '(Present)'}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              disabled={isCurrent}
              value={isCurrent ? '' : endMonth}
              onChange={(e) => handleUpdate({ endMonth: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#111514' : 'rgba(18, 18, 22, 0.85)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                color: isCurrent ? '#6B7F72' : endMonth ? '#F4F3EE' : '#9296A1',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              disabled={isCurrent}
              value={isCurrent ? 'Present' : endYear}
              onChange={(e) => handleUpdate({ endYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="YYYY"
              maxLength={4}
              style={{
                width: '80px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: isCurrent ? '#111514' : 'rgba(18, 18, 22, 0.85)',
                border: '1px solid rgba(244, 243, 238, 0.12)',
                color: isCurrent ? '#6B7F72' : '#F4F3EE',
                fontSize: '13px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Date Confirmation Alert */}
      {(isMissingMonth || requiresDateConfirmation) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(214, 168, 84, 0.12)',
            border: '1px solid rgba(214, 168, 84, 0.35)',
            color: '#E8CE7D',
            fontSize: '12px',
          }}
        >
          <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Date Confirmation Required:</strong> Month is not specified in the source resume.
            This record will publish with authentic year-level precision (e.g.{' '}
            <em>{computeStartDate(startMonth, startYear) || '2024'} &mdash; {computeEndDate(isCurrent, endMonth, endYear) || 'Present'}</em>)
            without fabricating January or December.
          </div>
        </div>
      )}
    </div>
  );
};
