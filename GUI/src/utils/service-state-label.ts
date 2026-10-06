import { ServiceState } from 'types';

export type LabelType = 'waring' | 'error' | 'info' | 'success' | 'success-light' | 'warning-dark' | 'disabled';

export const getServiceStateLabelType = (serviceState: ServiceState | 'missing'): LabelType => {
  switch (serviceState) {
    case ServiceState.Ready:
      return 'warning-dark';
    case ServiceState.Active:
      return 'success-light';
    case ServiceState.Draft:
      return 'disabled';
    case ServiceState.Inactive:
      return 'warning-dark';
    case 'missing':
      return 'error';
    default:
      return 'info';
  }
};
