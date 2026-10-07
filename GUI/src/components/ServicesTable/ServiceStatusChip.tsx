import clsx from 'clsx';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceState } from 'types';

type ServiceStatusChipProps = {
  readonly state: ServiceState | 'deleted';
  readonly isLoading?: boolean;
};

const ServiceStatusChip: FC<ServiceStatusChipProps> = ({ state, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <span className={clsx('service-status-chip', `service-status-chip--${state}`)}>
      <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>{t(`overview.service.states.${state}`)}</span>
      {isLoading && <span className="service-state-spinner" />}
    </span>
  );
};

export default ServiceStatusChip;
