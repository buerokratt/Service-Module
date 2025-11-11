import { createContext } from 'react';
import { Assign } from 'types';

import { type BaseDate, type DatePart, type FormatOptions, type FormatType, type Separator } from './date-time-utils';

export interface DateTimeBuilderState {
  base: BaseDate;
  days: string;
  months: string;
  years: string;
  isTimePrecisionEnabled: boolean;
  time: string;
  formatType: FormatType;
  dateOrder: [DatePart, DatePart, DatePart];
  separator: Separator;
}

export interface DateTimeBuilderContextValue {
  // State
  state: DateTimeBuilderState;
  // Setters
  setBase: (value: BaseDate) => void;
  setDays: (value: string) => void;
  setMonths: (value: string) => void;
  setYears: (value: string) => void;
  setIsTimePrecisionEnabled: (value: boolean) => void;
  setTime: (value: string) => void;
  setFormatType: (value: FormatType) => void;
  setDateOrder: (value: [DatePart, DatePart, DatePart]) => void;
  setSeparator: (value: Separator) => void;
  // Computed values
  formatOptions: FormatOptions;
  dateCode: string;
  dragData: Assign;
  evaluatedDate: string;
  borderColor: string;
}

export const DateTimeBuilderContext = createContext<DateTimeBuilderContextValue | null>(null);
