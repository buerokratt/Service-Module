import { Button, Icon, Track } from '@buerokratt-ria/header/src/components';
import { createColumnHelper } from '@tanstack/react-table';
import Label from 'components/Label';
import Tooltip from 'components/Tooltip';
import i18n from 'i18n';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoGitBranch, GoGitMerge } from 'react-icons/go';
import { IoCopyOutline } from 'react-icons/io5';
import {
  MdChevronRight,
  MdDeleteOutline,
  MdExpandMore,
  MdOutlineEdit,
  MdOutlinePushPin,
  MdPushPin,
} from 'react-icons/md';
import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from 'resources/routes-constants';
import useServiceListStore from 'store/services.store';
import useStore from 'store/store';
import useToastStore from 'store/toasts.store';
import { Service, ServiceState } from 'types';
import { togglePinnedService } from 'utils/pinned-services';
import { getDependencyCounts } from 'utils/service-dependencies';

interface GetColumnsConfig {
  navigate: NavigateFunction;
  hideDeletePopup: () => void;
  onStateClick: (service: Service) => void;
  expandedServiceIds: string[];
  onToggleExpand: (serviceId: string) => void;
  onFocusDependencies: (serviceId: string) => void;
  onPinToggle: () => void;
  pinnedServiceIds: string[];
}

export const getColumns = ({
  navigate,
  hideDeletePopup,
  onStateClick,
  expandedServiceIds,
  onToggleExpand,
  onFocusDependencies,
  onPinToggle,
  pinnedServiceIds,
}: GetColumnsConfig) => {
  const columnHelper = createColumnHelper<Service>();
  const userInfo = useStore.getState().userInfo;
  const dependencyMap = useServiceListStore.getState().dependencyMap;

  return [
    columnHelper.accessor('name', {
      header: i18n.t('overview.service.name') ?? '',
      enableSorting: true,
      meta: { size: 360 },
      cell: (props) => {
        const service = props.row.original;
        const isExpanded = expandedServiceIds.includes(service.serviceId);
        const examples = service.examples?.length ? service.examples.join('\n') : i18n.t('overview.service.noExamples');
        const keywords = service.entities?.length ? service.entities.join(', ') : i18n.t('overview.service.noKeywords');

        return (
          <Track gap={8} align="center" justify="start">
            <button
              type="button"
              className="services-table__expand-btn"
              aria-expanded={isExpanded}
              aria-label={i18n.t('overview.dependencies.toggleView') as string}
              onClick={() => onToggleExpand(service.serviceId)}
            >
              <Icon icon={isExpanded ? <MdExpandMore /> : <MdChevronRight />} size="medium" />
            </button>
            <button
              type="button"
              className="services-table__name-link"
              onClick={() => {
                useServiceListStore.getState().setSelectedService(service);
                navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, service.serviceId));
              }}
            >
              {props.cell.getValue()}
            </button>
            <Tooltip
              content={
                <Track isMultiline direction="vertical" gap={8} align="stretch">
                  <strong>{service.name}</strong>
                  <label style={{ fontSize: '14px', maxWidth: '280px', whiteSpace: 'pre-wrap' }}>
                    {service.description || i18n.t('overview.service.noDescription')}
                  </label>
                  <div>
                    <strong>{i18n.t('overview.service.examples')}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{examples}</p>
                  </div>
                  <div>
                    <strong>{i18n.t('overview.service.keywords')}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{keywords}</p>
                  </div>
                  <Button
                    appearance="text"
                    onClick={() => {
                      void navigator.clipboard.writeText(service.description ?? '');
                      useToastStore.getState().success({ title: i18n.t('overview.descriptionCopiedSuccessfully') });
                    }}
                  >
                    <Icon style={{ color: 'black' }} icon={<IoCopyOutline />} size="small" />
                  </Button>
                </Track>
              }
            >
              <div className="services-table__info-icon" style={{ display: 'inline-flex' }}>
                <Icon icon={<AiOutlineInfoCircle color="#005aa3" />} size="medium" />
              </div>
            </Tooltip>
          </Track>
        );
      },
    }),
    columnHelper.display({
      id: 'dependencies',
      header: () => (
        <Track gap={4} align="center">
          <span>{i18n.t('global.dependencies')}</span>
          <Tooltip content={i18n.t('overview.dependencies.columnTooltip') as string}>
            <span className="services-table__info-icon" style={{ display: 'inline-flex', cursor: 'help' }}>
              <Icon icon={<AiOutlineInfoCircle color="#005aa3" />} size="small" />
            </span>
          </Tooltip>
        </Track>
      ),
      meta: { size: 140 },
      cell: (props) => {
        // Figma order: fork = services used by this (outgoing), merge = services using this (incoming)
        const { incoming, outgoing } = getDependencyCounts(dependencyMap, props.row.original.serviceId);
        return (
          <Track gap={16}>
            <Tooltip content={i18n.t('overview.dependencies.outgoingTooltip') as string}>
              <button
                type="button"
                className="dependency-count-btn dependency-count-btn--outgoing"
                onClick={() => onFocusDependencies(props.row.original.serviceId)}
              >
                <span className="dependency-count-btn__count">{outgoing}</span>
                <Icon icon={<GoGitBranch />} size="medium" />
              </button>
            </Tooltip>
            <Tooltip content={i18n.t('overview.dependencies.incomingTooltip') as string}>
              <button
                type="button"
                className="dependency-count-btn dependency-count-btn--incoming"
                onClick={() => onFocusDependencies(props.row.original.serviceId)}
              >
                <span className="dependency-count-btn__count">{incoming}</span>
                <Icon icon={<GoGitMerge />} size="medium" />
              </button>
            </Tooltip>
          </Track>
        );
      },
    }),
    columnHelper.accessor('isCommon', {
      header: i18n.t('overview.service.type') ?? '',
      meta: { size: 90 },
      cell: (props) =>
        props.cell.getValue() ? (
          <Label type="info">{i18n.t('overview.service.common')}</Label>
        ) : (
          <Label type="disabled">{i18n.t('overview.service.regular')}</Label>
        ),
    }),
    columnHelper.accessor('state', {
      header: i18n.t('overview.service.state') ?? '',
      meta: { size: 120 },
      cell: (props) => (
        <Track justify="start">
          <button type="button" className="service-state-btn" onClick={() => onStateClick(props.row.original)}>
            <Label type={getLabelType(props.row.original.state)}>
              {i18n.t(`overview.service.states.${props.row.original.state}`)}
            </Label>
          </button>
        </Track>
      ),
    }),
    columnHelper.display({
      id: 'edit',
      meta: { size: 90 },
      cell: (props) => (
        <Track align="right" justify="start">
          <Button
            appearance="text"
            onClick={() => {
              useServiceListStore.getState().setSelectedService(props.row.original);
              navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, props.row.original.serviceId));
            }}
          >
            <Icon icon={<MdOutlineEdit />} size="medium" />
            {i18n.t('overview.edit')}
          </Button>
        </Track>
      ),
    }),
    columnHelper.display({
      id: 'delete',
      meta: { size: 90 },
      cell: (props) => (
        <Track align="right">
          <Button
            disabled={
              props.row.original.isCommon === true && !userInfo?.authorities.includes('ROLE_ADMINISTRATOR')
                ? true
                : props.row.original.state != ServiceState.Draft && props.row.original.state != ServiceState.Ready
            }
            appearance="text"
            onClick={() => {
              useServiceListStore.getState().setSelectedService(props.row.original);
              hideDeletePopup();
            }}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {i18n.t('overview.delete')}
          </Button>
        </Track>
      ),
    }),
    columnHelper.display({
      id: 'pin',
      meta: { size: 48 },
      cell: (props) => {
        const isPinned = pinnedServiceIds.includes(props.row.original.serviceId);
        return (
          <Button
            appearance="text"
            aria-label={isPinned ? (i18n.t('overview.unpin') as string) : (i18n.t('overview.pin') as string)}
            onClick={() => {
              togglePinnedService(props.row.original);
              onPinToggle();
            }}
          >
            <Icon
              icon={isPinned ? <MdPushPin color="#005aa3" /> : <MdOutlinePushPin />}
              size="medium"
              style={isPinned ? { transform: 'rotate(45deg)' } : undefined}
            />
          </Button>
        );
      },
    }),
  ];
};

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
