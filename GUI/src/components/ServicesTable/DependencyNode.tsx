import clsx from 'clsx';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineWarningAmber } from 'react-icons/md';
import { ServiceState } from 'types';
import { ServiceDependency } from 'types/service-dependency';

import DependencyCounts from './DependencyCounts';
import ServiceStatusChip from './ServiceStatusChip';

type DependencyNodeProps = {
  dependency: ServiceDependency;
  isBeingChecked: boolean;
  onOpen: (dependency: ServiceDependency) => void;
  onLocate: (dependency: ServiceDependency) => void;
  onActivate: (dependency: ServiceDependency) => void;
};

const DependencyNode = forwardRef<HTMLDivElement, DependencyNodeProps>(
  ({ dependency, isBeingChecked, onOpen, onLocate, onActivate }, ref) => {
    const { t } = useTranslation();
    const { deleted, name, state } = dependency;
    const canActivate = !deleted && state === ServiceState.Ready && !isBeingChecked;

    return (
      <div ref={ref} className={clsx('dependency-node', deleted && 'dependency-node--deleted')}>
        <div className="dependency-node__header">
          {deleted ? (
            <span className="dependency-node__name" title={name}>
              {name}
            </span>
          ) : (
            <button
              type="button"
              className="dependency-node__name dependency-node__name--link"
              title={name}
              onClick={() => onOpen(dependency)}
            >
              {name}
            </button>
          )}
          <button
            type="button"
            className="services-table__status-button"
            disabled={!canActivate}
            onClick={() => onActivate(dependency)}
          >
            <ServiceStatusChip state={deleted || !state ? 'deleted' : state} isLoading={isBeingChecked} />
          </button>
        </div>
        <div className="dependency-node__footer">
          {deleted ? (
            <span className="dependency-node__problem">
              <MdOutlineWarningAmber aria-hidden />
              {t('overview.dependencies.deletedReference')}
            </span>
          ) : (
            <DependencyCounts
              incoming={dependency.incomingCount}
              outgoing={dependency.outgoingCount}
              onClick={() => onLocate(dependency)}
            />
          )}
        </div>
      </div>
    );
  },
);

DependencyNode.displayName = 'DependencyNode';

export default DependencyNode;
