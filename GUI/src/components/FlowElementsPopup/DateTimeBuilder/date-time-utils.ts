export type BaseDate = 'startOfDay' | 'startOfMonth' | 'startOfYear' | 'endOfDay' | 'endOfMonth' | 'endOfYear' | 'now';

export const baseOptionsConfig: Array<{ value: BaseDate; baseDate: string }> = [
  { value: 'now', baseDate: 'new Date()' },
  {
    value: 'startOfDay',
    baseDate: 'new Date(new Date().setHours(0, 0, 0, 0))',
  },
  {
    value: 'startOfMonth',
    baseDate: 'new Date(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0))',
  },
  {
    value: 'startOfYear',
    baseDate: 'new Date(new Date(new Date().setMonth(0, 1)).setHours(0, 0, 0, 0))',
  },
  {
    value: 'endOfDay',
    baseDate: 'new Date(new Date().setHours(23, 59, 59, 999))',
  },
  {
    value: 'endOfMonth',
    baseDate: 'new Date(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).setHours(23, 59, 59, 999))',
  },
  {
    value: 'endOfYear',
    baseDate: 'new Date(new Date(new Date().getFullYear(), 11, 31).setHours(23, 59, 59, 999))',
  },
];

export const generateDateCode = (
  base: BaseDate,
  days: string,
  months: string,
  years: string,
  isTimePrecisionEnabled: boolean,
  time: string,
): string => {
  // Get base date initialization from config
  const baseDate = baseOptionsConfig.find((option) => option.value === base)?.baseDate || 'new Date()';

  // Parse offsets
  const daysNum = parseInt(days) || 0;
  const monthsNum = parseInt(months) || 0;
  const yearsNum = parseInt(years) || 0;

  // Build operations using IIFE to avoid nested new Date() calls
  const operations: string[] = [];

  if (daysNum !== 0) {
    const milliseconds = daysNum * 86400000;
    operations.push(`d = new Date(d.getTime() + ${milliseconds})`);
  }
  if (monthsNum !== 0) {
    operations.push(`d.setMonth(d.getMonth() + ${monthsNum})`);
  }
  if (yearsNum !== 0) {
    operations.push(`d.setFullYear(d.getFullYear() + ${yearsNum})`);
  }
  if (isTimePrecisionEnabled && time) {
    const timeParts = time.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0] || '0';
      const minutes = timeParts[1] || '0';
      const secondsPart = timeParts[2]?.split('.')[0] || '0';
      const milliseconds = timeParts[2]?.split('.')[1] || '0';
      operations.push(`d.setHours(${hours}, ${minutes}, ${secondsPart}, ${milliseconds})`);
    }
  }

  // Build IIFE expression
  if (operations.length === 0) {
    return `${baseDate}.toISOString()`;
  }

  const opsString = operations.join('; ');
  return `(function() { const d = ${baseDate}; ${opsString}; return d.toISOString(); })()`;
};
