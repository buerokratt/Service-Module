import { t } from 'i18next';
import { Assign } from 'types';
import { stringToTemplate } from 'utils/string-util';
import { v4 } from 'uuid';

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

export const getBaseOptions = (): { label: string; value: BaseDate }[] =>
  baseOptionsConfig.map((option) => ({
    label: String(t(`serviceFlow.previousVariables.dateAndTime.${option.value}`)),
    value: option.value,
  }));

export type DatePart = 'YYYY' | 'MM' | 'DD';
export type Separator = '.' | '/' | '-';
export type FormatType = 'dateOnly' | 'timestamp' | 'timestampMs' | 'yearOnly' | 'custom';

export interface FormatOptions {
  type: FormatType;
  dateOrder?: [DatePart, DatePart, DatePart];
  separator?: Separator;
}

const getDatePartCode = (part: DatePart, dateVarName = 'd'): string => {
  switch (part) {
    case 'YYYY':
      return `${dateVarName}.getFullYear()`;
    case 'MM':
      return `String(${dateVarName}.getMonth() + 1).padStart(2, '0')`;
    case 'DD':
      return `String(${dateVarName}.getDate()).padStart(2, '0')`;
  }
};

const generateDateOnlyCode = (formatOptions: FormatOptions, dateVarName = 'd'): string => {
  const separator = formatOptions.separator || '-';
  const [part1, part2, part3] = formatOptions.dateOrder || ['YYYY', 'MM', 'DD'];
  return `[${getDatePartCode(part1, dateVarName)}, ${getDatePartCode(part2, dateVarName)}, ${getDatePartCode(part3, dateVarName)}].join('${separator}')`;
};

const generateDateFormatCode = (formatOptions: FormatOptions, dateVarName = 'd'): string => {
  switch (formatOptions.type) {
    case 'yearOnly':
      return `${dateVarName}.getFullYear().toString()`;
    case 'dateOnly':
      return generateDateOnlyCode(formatOptions, dateVarName);
    case 'timestamp': {
      const separator = formatOptions.separator || '-';
      const [part1, part2, part3] = formatOptions.dateOrder || ['YYYY', 'MM', 'DD'];
      const hours = `String(${dateVarName}.getHours()).padStart(2, '0')`;
      const minutes = `String(${dateVarName}.getMinutes()).padStart(2, '0')`;
      const seconds = `String(${dateVarName}.getSeconds()).padStart(2, '0')`;
      return `[${getDatePartCode(part1, dateVarName)}, ${getDatePartCode(part2, dateVarName)}, ${getDatePartCode(part3, dateVarName)}].join('${separator}') + 'T' + ${hours} + ':' + ${minutes} + ':' + ${seconds} + 'Z'`;
    }
    case 'timestampMs': {
      const separator = formatOptions.separator || '-';
      const [part1, part2, part3] = formatOptions.dateOrder || ['YYYY', 'MM', 'DD'];
      const hours = `String(${dateVarName}.getHours()).padStart(2, '0')`;
      const minutes = `String(${dateVarName}.getMinutes()).padStart(2, '0')`;
      const seconds = `String(${dateVarName}.getSeconds()).padStart(2, '0')`;
      const milliseconds = `String(${dateVarName}.getMilliseconds()).padStart(3, '0')`;
      return `[${getDatePartCode(part1, dateVarName)}, ${getDatePartCode(part2, dateVarName)}, ${getDatePartCode(part3, dateVarName)}].join('${separator}') + 'T' + ${hours} + ':' + ${minutes} + ':' + ${seconds} + '.' + ${milliseconds} + 'Z'`;
    }
    case 'custom':
      // Custom format is same as dateOnly - just date parts with separator
      return generateDateOnlyCode(formatOptions, dateVarName);
  }
};

export const generateDateCode = (
  base: BaseDate,
  options?: {
    days?: string;
    months?: string;
    years?: string;
    isTimePrecisionEnabled?: boolean;
    time?: string;
    format?: FormatOptions;
  },
): string => {
  // Get base date initialization from config
  const baseDate = baseOptionsConfig.find((option) => option.value === base)?.baseDate || 'new Date()';

  // Parse offsets
  const daysNum = parseInt(options?.days ?? '0');
  const monthsNum = parseInt(options?.months ?? '0');
  const yearsNum = parseInt(options?.years ?? '0');

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
  if (options?.isTimePrecisionEnabled && options?.time) {
    const timeParts = options.time.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0] || '0';
      const minutes = timeParts[1] || '0';
      const secondsPart = timeParts[2]?.split('.')[0] || '0';
      const milliseconds = timeParts[2]?.split('.')[1] || '0';
      operations.push(`d.setHours(${hours}, ${minutes}, ${secondsPart}, ${milliseconds})`);
    }
  }

  // Get format code
  const formatOptions = options?.format || { type: 'dateOnly', dateOrder: ['YYYY', 'MM', 'DD'], separator: '-' };
  const formatCode = generateDateFormatCode(formatOptions);

  // Build IIFE expression
  if (operations.length === 0) {
    return `(function() { const d = ${baseDate}; return ${formatCode}; })()`;
  }

  const opsString = operations.join('; ');
  return `(function() { const d = ${baseDate}; ${opsString}; return ${formatCode}; })()`;
};

export const createDateTimeDragData = (dateCode: string): Assign => ({
  id: v4(),
  key: 'dateTime',
  value: stringToTemplate(dateCode),
  data: dateCode,
});
