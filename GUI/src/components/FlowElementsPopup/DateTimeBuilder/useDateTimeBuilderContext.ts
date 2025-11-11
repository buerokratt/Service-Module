import { useContext } from 'react';

import { DateTimeBuilderContext, type DateTimeBuilderContextValue } from './DateTimeBuilderContext';

export const useDateTimeBuilderContext = (): DateTimeBuilderContextValue => {
  const context = useContext(DateTimeBuilderContext);
  if (!context) {
    throw new Error('useDateTimeBuilderContext must be used within DateTimeBuilderProvider');
  }
  return context;
};
