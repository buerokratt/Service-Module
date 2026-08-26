import { Icon, Track } from '@buerokratt-ria/header/src/components';
import { Row } from '@tanstack/react-table';
import Label from 'components/Label';
import i18n from 'i18n';
import { FC } from 'react';
import { MdLoop } from 'react-icons/md';
import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from 'resources/routes-constants';
import useServiceListStore from 'store/services.store';
import { Service, ServiceState } from 'types';
import { DependencyReference, hasLoopbackReference } from 'utils/service-dependencies';

import './DependencyExpandedView.scss';

const MAX_VISIBLE_NODES = 5;
const NODE_HEIGHT = 44;
const NODE_GAP = 8;

interface DependencyExpandedViewProps {
  readonly row: Row<Service>;
  readonly navigate: NavigateFunction;
  readonly onFocusService: (serviceId: string) => void;
  readonly onStateClick: (service: Service) => void;
}

const getLabelType = (serviceState: ServiceState) => {
  switch (serviceState) {
    case ServiceState.Ready:
      return 'warning-dark';
    case ServiceState.Active:
      return 'success-light';
    case ServiceState.Draft:
      return 'disabled';
    case ServiceState.Inactive:
      return 'warning-dark';
    default:
      return 'info';
  }
};

const toService = (node: DependencyReference): Service => ({
  serviceId: node.serviceId,
  name: node.name,
  state: (node.state as ServiceState) ?? ServiceState.Draft,
  isCommon: node.isCommon ?? false,
  type: 'POST',
  id: 0,
  slot: '',
  examples: [],
  entities: [],
  totalPages: 1,
  endpoints: [],
});

const DependencyNode: FC<{
  readonly node: DependencyReference;
  readonly navigate: NavigateFunction;
  readonly onFocusService: (serviceId: string) => void;
  readonly onStateClick?: (service: Service) => void;
  readonly dependencyMap: ReturnType<typeof useServiceListStore.getState>['dependencyMap'];
  readonly isCurrent?: boolean;
}> = ({ node, navigate, onFocusService, onStateClick, dependencyMap, isCurrent = false }) => {
  const isDeleted = node.status === 'deleted';
  const isLoopback = node.isSelfReference;
  const incomingCount = dependencyMap[node.serviceId]?.incoming.length ?? 0;
  const outgoingCount = dependencyMap[node.serviceId]?.outgoing.length ?? 0;

  const handleNameClick = () => {
    if (isDeleted) return;
    useServiceListStore.getState().setSelectedService(toService(node));
    navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, node.serviceId));
  };

  return (
    <div
      className={`dependency-node${isDeleted ? ' dependency-node--deleted' : ''}${isLoopback ? ' dependency-node--loopback' : ''}${isCurrent ? ' dependency-node--current' : ''}`}
    >
      {isLoopback && (
        <Icon icon={<MdLoop />} size="small" aria-label={i18n.t('overview.dependencies.loopback') as string} />
      )}
      <button type="button" className="dependency-node__name" onClick={handleNameClick} disabled={isDeleted}>
        {node.name}
      </button>
      {isDeleted ? (
        <Label type="error">{i18n.t('overview.service.deleted')}</Label>
      ) : (
        node.state && (
          <Track onClick={() => onStateClick?.(toService(node))}>
            <Label type={getLabelType(node.state as ServiceState)}>
              {i18n.t(`overview.service.states.${node.state}`)}
            </Label>
          </Track>
        )
      )}
      <Track gap={8} className="dependency-node__counts">
        <button
          type="button"
          className="dependency-node__count"
          disabled={isDeleted}
          onClick={() => !isDeleted && onFocusService(node.serviceId)}
          aria-label={i18n.t('overview.dependencies.incoming', { count: incomingCount }) as string}
          title={i18n.t('overview.dependencies.incomingTooltip') as string}
        >
          {incomingCount}
        </button>
        <button
          type="button"
          className="dependency-node__count"
          disabled={isDeleted}
          onClick={() => !isDeleted && onFocusService(node.serviceId)}
          aria-label={i18n.t('overview.dependencies.outgoing', { count: outgoingCount }) as string}
          title={i18n.t('overview.dependencies.outgoingTooltip') as string}
        >
          {outgoingCount}
        </button>
      </Track>
    </div>
  );
};

const FlowLine: FC<{ direction: 'incoming' | 'outgoing' }> = ({ direction }) => (
  <div className={`dependency-flow-line dependency-flow-line--${direction}`} aria-hidden="true">
    <span className="dependency-flow-line__shaft" />
    <span className="dependency-flow-line__arrow" />
  </div>
);

const NodeStack: FC<{
  readonly title: string;
  readonly nodes: DependencyReference[];
  readonly emptyLabel: string;
  readonly navigate: NavigateFunction;
  readonly onFocusService: (serviceId: string) => void;
  readonly onStateClick: (service: Service) => void;
  readonly dependencyMap: ReturnType<typeof useServiceListStore.getState>['dependencyMap'];
}> = ({ title, nodes, emptyLabel, navigate, onFocusService, onStateClick, dependencyMap }) => {
  const needsScroll = nodes.length > MAX_VISIBLE_NODES;

  return (
    <div className="dependency-column">
      <p className="dependency-column__title">{title}</p>
      <div className={`dependency-column__nodes${needsScroll ? ' dependency-column__nodes--scroll' : ''}`}>
        {nodes.length === 0 ? (
          <p className="dependency-column__empty">{emptyLabel}</p>
        ) : (
          nodes.map((node) => (
            <DependencyNode
              key={`${node.serviceId}-${node.name}`}
              node={node}
              navigate={navigate}
              onFocusService={onFocusService}
              onStateClick={onStateClick}
              dependencyMap={dependencyMap}
            />
          ))
        )}
      </div>
    </div>
  );
};

const DependencyExpandedView: FC<DependencyExpandedViewProps> = ({ row, navigate, onFocusService, onStateClick }) => {
  const dependencyMap = useServiceListStore((state) => state.dependencyMap);
  const service = row.original;
  const dependencies = dependencyMap[service.serviceId] ?? { incoming: [], outgoing: [] };
  const isLoopback = hasLoopbackReference(dependencyMap, service.serviceId);

  const currentNode: DependencyReference = {
    serviceId: service.serviceId,
    name: service.name,
    state: service.state,
    isCommon: service.isCommon,
    status: 'active',
  };

  const rowCount = Math.max(dependencies.incoming.length, dependencies.outgoing.length, 1);

  return (
    <div className={`dependency-expanded-view${isLoopback ? ' dependency-expanded-view--loopback' : ''}`}>
      <NodeStack
        title={i18n.t('overview.dependencies.servicesUsingThis') as string}
        nodes={dependencies.incoming}
        emptyLabel={i18n.t('overview.dependencies.noneUsingThis') as string}
        navigate={navigate}
        onFocusService={onFocusService}
        onStateClick={onStateClick}
        dependencyMap={dependencyMap}
      />

      <div
        className="dependency-flow-lines dependency-flow-lines--incoming"
        style={{ minHeight: rowCount * NODE_HEIGHT + (rowCount - 1) * NODE_GAP }}
      >
        {dependencies.incoming.length > 0
          ? dependencies.incoming.map((node) => <FlowLine key={`in-${node.serviceId}`} direction="incoming" />)
          : rowCount > 0 && <div className="dependency-flow-line dependency-flow-line--spacer" />}
      </div>

      <div className="dependency-column dependency-column--current">
        <p className="dependency-column__title">{i18n.t('overview.dependencies.currentService')}</p>
        <div className="dependency-column__nodes dependency-column__nodes--centered">
          <DependencyNode
            node={currentNode}
            navigate={navigate}
            onFocusService={onFocusService}
            onStateClick={onStateClick}
            dependencyMap={dependencyMap}
            isCurrent
          />
        </div>
        {isLoopback && (
          <p className="dependency-column__loopback-note">{i18n.t('overview.dependencies.loopbackNote')}</p>
        )}
      </div>

      <div
        className="dependency-flow-lines dependency-flow-lines--outgoing"
        style={{ minHeight: rowCount * NODE_HEIGHT + (rowCount - 1) * NODE_GAP }}
      >
        {dependencies.outgoing.length > 0
          ? dependencies.outgoing.map((node) => <FlowLine key={`out-${node.serviceId}`} direction="outgoing" />)
          : rowCount > 0 && <div className="dependency-flow-line dependency-flow-line--spacer" />}
      </div>

      <NodeStack
        title={i18n.t('overview.dependencies.servicesUsedByThis') as string}
        nodes={dependencies.outgoing}
        emptyLabel={i18n.t('overview.dependencies.noneUsedByThis') as string}
        navigate={navigate}
        onFocusService={onFocusService}
        onStateClick={onStateClick}
        dependencyMap={dependencyMap}
      />
    </div>
  );
};

export default DependencyExpandedView;
