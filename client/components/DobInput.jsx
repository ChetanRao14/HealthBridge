import React, { useMemo, useState, useEffect } from 'react';

export function DobInput({ value, onChange, required, max, className }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  useEffect(() => {
    if (!value) {
      setYear('');
      setMonth('');
      setDay('');
      return;
    }
    const parts = value.split('-');
    if (parts.length === 3) {
      setYear(parts[0]);
      setMonth(parts[1]);
      setDay(parts[2]);
    }
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 130 }, (_, i) => currentYear - i), [currentYear]);
  
  const months = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
  ];

  const daysInMonth = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  }, [year, month]);
  
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0')), [daysInMonth]);

  const handleChange = (y, m, d) => {
    setYear(y);
    setMonth(m);
    setDay(d);
    if (y && m && d) {
      onChange({ target: { value: `${y}-${m}-${d}` } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`flex gap-2 ${className || 'mt-1'}`}>
      <select className="hb-input flex-1" required={required} value={day} onChange={(e) => handleChange(year, month, e.target.value)}>
        <option value="">Day</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="hb-input flex-1" required={required} value={month} onChange={(e) => handleChange(year, e.target.value, day)}>
        <option value="">Month</option>
        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select className="hb-input flex-1" required={required} value={year} onChange={(e) => handleChange(e.target.value, month, day)}>
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
