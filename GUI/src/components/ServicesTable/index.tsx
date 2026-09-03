import { PaginationState, Row, SortingState } from '@tanstack/react-table';
import { type CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import useServiceListStore from 'store/services.store';
import { Service } from 'types';
import { getPinnedServiceIds, mergePinnedWithPageServices, syncPinnedServiceSnapshots } from 'utils/pinned-services';

import { Button, Card, FormInput, Icon, Modal, Track } from '..';
import DataTable from '../DataTable';
import { getColumns } from './columns';
import DependencyExpandedView from './DependencyExpandedView';
import { getStateModalConfig, StateModalAction } from './service-table-utils';
import TablePagination from '../DataTable/Pagination';

import '../../styles/main.scss';
import './ServicesTable.scss';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = new Set([10, 20, 30, 50]);
const PAGE_SIZE_STORAGE_KEY = 'page-size';
const SEARCH_DEBOUNCE_MS = 300;

const getStoredPageSize = (): number => {
  const stored = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return PAGE_SIZE_OPTIONS.has(stored) ? stored : DEFAULT_PAGE_SIZE;
};

const ServicesTable: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const services = useServiceListStore((state) => state.services);
  const expandedServiceIds = useServiceListStore((state) => state.expandedServiceIds);
  const focusedServiceId = useServiceListStore((state) => state.focusedServiceId);
  const searchQuery = useServiceListStore((state) => state.searchQuery);

  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [isStatePopupVisible, setIsStatePopupVisible] = useState(false);
  const [stateModalAction, setStateModalAction] = useState<StateModalAction | null>(null);
  const [stateModalTitle, setStateModalTitle] = useState('');
  const [stateModalConfirmLabel, setStateModalConfirmLabel] = useState('');
  const [isChangingState, setIsChangingState] = useState(false);
  const [pinnedServiceIds, setPinnedServiceIdsState] = useState<string[]>(() => getPinnedServiceIds());
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: getStoredPageSize(),
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);

  const loadServices = useCallback((paginationState: PaginationState, sortingState: SortingState, search?: string) => {
    void useServiceListStore.getState().loadServicesList(paginationState, sortingState, search);
  }, []);

  useEffect(() => {
    void useServiceListStore.getState().loadDependencyMap();
  }, []);

  useEffect(() => {
    loadServices(pagination, sorting, searchQuery);
  }, [loadServices, pagination, sorting, searchQuery]);

  useEffect(() => {
    syncPinnedServiceSnapshots(services);
  }, [services]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        useServiceListStore.getState().setSearchQuery(localSearch);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  useEffect(() => {
    if (!focusedServiceId || !contentRef.current) return;
    const focusedRow = contentRef.current.querySelector(`[data-service-id="${focusedServiceId}"]`);
    focusedRow?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedServiceId, expandedServiceIds]);

  const changeServiceState = useCallback(
    (activate: boolean = false, draft: boolean = false) => {
      setIsChangingState(true);
      return useServiceListStore
        .getState()
        .changeServiceState(
          () => {
            setIsStatePopupVisible(false);
            setIsChangingState(false);
          },
          t('overview.service.toast.updated'),
          t('overview.service.toast.failed.state'),
          activate,
          draft,
          pagination,
          sorting,
          searchQuery,
        )
        .catch(() => {
          setIsChangingState(false);
        });
    },
    [t, pagination, sorting, searchQuery],
  );

  const handleStateClick = useCallback(
    (service: Service) => {
      useServiceListStore.getState().setSelectedService(service);
      const config = getStateModalConfig(service.state, t);
      if (!config) return;
      setStateModalTitle(config.title);
      setStateModalAction(config.action);
      setStateModalConfirmLabel(config.confirmLabel);
      setIsStatePopupVisible(true);
    },
    [t],
  );

  const confirmStateChange = useCallback(() => {
    if (!stateModalAction) return;
    switch (stateModalAction) {
      case 'activate':
        void changeServiceState(true);
        break;
      case 'draft':
        void changeServiceState(false, true);
        break;
      case 'ready':
        void changeServiceState(false, false);
        break;
      case 'deactivate':
        void changeServiceState(false, false);
        break;
    }
  }, [stateModalAction, changeServiceState]);

  const handleToggleExpand = useCallback((serviceId: string) => {
    const { expandedServiceIds: current } = useServiceListStore.getState();
    const next = current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId];
    useServiceListStore.getState().setExpandedServiceIds(next);
  }, []);

  const handleFocusDependencies = useCallback((serviceId: string) => {
    const { expandedServiceIds, focusedServiceId } = useServiceListStore.getState();
    const isExpanded = expandedServiceIds.includes(serviceId);
    const isOnlyFocused = focusedServiceId === serviceId && expandedServiceIds.length === 1 && isExpanded;

    if (isOnlyFocused) {
      useServiceListStore.getState().setExpandedServiceIds([]);
      useServiceListStore.getState().setFocusedServiceId(null);
      return;
    }

    useServiceListStore.getState().setExpandedServiceIds([serviceId]);
    useServiceListStore.getState().setFocusedServiceId(serviceId);
  }, []);

  const handlePinToggle = useCallback(() => {
    setPinnedServiceIdsState(getPinnedServiceIds());
  }, []);

  const columns = useMemo(
    () =>
      getColumns({
        navigate,
        hideDeletePopup: () => setIsDeletePopupVisible(true),
        onStateClick: handleStateClick,
        expandedServiceIds,
        onToggleExpand: handleToggleExpand,
        onFocusDependencies: handleFocusDependencies,
        onPinToggle: handlePinToggle,
        pinnedServiceIds,
      }),
    [
      navigate,
      handleStateClick,
      expandedServiceIds,
      handleToggleExpand,
      handleFocusDependencies,
      handlePinToggle,
      pinnedServiceIds,
    ],
  );

  const tableData = useMemo(
    () => mergePinnedWithPageServices(services, pinnedServiceIds),
    [services, pinnedServiceIds],
  );

  const pinnedCount = useMemo(
    () => tableData.filter((service) => pinnedServiceIds.includes(service.serviceId)).length,
    [tableData, pinnedServiceIds],
  );

  const pageCount = Math.max(services.at(-1)?.totalPages ?? 1, 1);
  const hasResults = tableData.length > 0;

  const renderBeforeRow = useCallback(
    (row: Row<Service>, index: number) => {
      const isPinned = pinnedServiceIds.includes(row.original.serviceId);
      const prevRow = index > 0 ? tableData[index - 1] : undefined;
      const prevIsPinned = prevRow ? pinnedServiceIds.includes(prevRow.serviceId) : false;
      const columnCount = columns.length;

      if (index === 0 && isPinned && pinnedCount > 0) {
        return (
          <tr className="services-table__section-row">
            <td colSpan={columnCount}>{t('overview.pinnedServices')}</td>
          </tr>
        );
      }

      if (isPinned && !prevIsPinned && index > 0) {
        return (
          <tr className="services-table__section-row">
            <td colSpan={columnCount}>{t('overview.pinnedServices')}</td>
          </tr>
        );
      }

      return null;
    },
    [columns.length, pinnedCount, pinnedServiceIds, tableData, t],
  );

  const deleteSelectedService = () => {
    setIsDeletingService(true);
    useServiceListStore
      .getState()
      .deleteSelectedService(
        () => setIsDeletePopupVisible(false),
        t('overview.service.toast.deleted'),
        t('overview.service.toast.failed.delete'),
        pagination,
        sorting,
        searchQuery,
      )
      .then(() => setIsDeletingService(false))
      .catch(() => setIsDeletingService(false));
  };

  const getRowStyles = useCallback(
    (row: Row<Service>) => {
      const styles: CSSProperties = {};
      if (row.original.serviceId === focusedServiceId) {
        styles.backgroundColor = '#eef4fa';
        styles.boxShadow = 'inset 3px 0 0 #005aa3';
      } else if (pinnedServiceIds.includes(row.original.serviceId)) {
        styles.backgroundColor = '#f5f8fc';
      }
      return styles;
    },
    [focusedServiceId, pinnedServiceIds],
  );

  const renderSubRow = useCallback(
    (row: Row<Service>) => {
      if (!expandedServiceIds.includes(row.original.serviceId)) return null;
      return (
        <div className="services-table__dependency-panel">
          <DependencyExpandedView
            row={row}
            navigate={navigate}
            onFocusService={handleFocusDependencies}
            onStateClick={handleStateClick}
          />
        </div>
      );
    },
    [expandedServiceIds, navigate, handleFocusDependencies, handleStateClick],
  );

  return (
    <Card isScrollable>
      {isDeletePopupVisible && (
        <Modal title={t('overview.popup.delete')} onClose={() => setIsDeletePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsDeletePopupVisible(false)}>
              {t('overview.cancel')}
            </Button>
            <Button appearance={!isDeletingService ? 'error' : 'loading'} onClick={deleteSelectedService}>
              {t('overview.delete')}
            </Button>
          </Track>
        </Modal>
      )}
      {isStatePopupVisible && (
        <Modal title={stateModalTitle} onClose={() => setIsStatePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsStatePopupVisible(false)}>
              {t('overview.cancel')}
            </Button>
            <Button appearance={isChangingState ? 'loading' : 'primary'} onClick={confirmStateChange}>
              {stateModalConfirmLabel}
            </Button>
          </Track>
        </Modal>
      )}
      <div className="services-table">
        <div className="services-table__search">
          <span className="services-table__search-icon" aria-hidden="true">
            <Icon icon={<MdSearch color="#8f91a8" />} size="medium" />
          </span>
          <FormInput
            name="serviceSearch"
            hideLabel
            label={t('overview.searchPlaceholder') as string}
            placeholder={t('overview.searchPlaceholder') as string}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              className="services-table__search-clear"
              aria-label={t('overview.clearSearch') as string}
              onClick={() => setLocalSearch('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="services-table__content" ref={contentRef}>
          <DataTable
            sortable
            data={tableData}
            columns={columns}
            pagination={pagination}
            sorting={sorting}
            withScrollWrapper={false}
            stickyHeader
            hidePagination
            emptyMessage={t('overview.noServicesFound') as string}
            renderSubRow={renderSubRow}
            renderBeforeRow={renderBeforeRow}
            meta={
              {
                getRowStyles,
                getRowProps: (row: Row<Service>) => ({ 'data-service-id': row.original.serviceId }),
              } as Record<string, unknown>
            }
            setPagination={(state: PaginationState) => {
              if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
              if (state.pageSize !== pagination.pageSize) {
                localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(state.pageSize));
              }
              setPagination(state);
              loadServices(state, sorting, searchQuery);
            }}
            setSorting={(state: SortingState) => {
              setSorting(state);
              loadServices(pagination, state, searchQuery);
            }}
            isClientSide={false}
            pagesCount={pageCount}
          />
        </div>
        {hasResults && (
          <TablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pageCount}
            onPageChange={(pageIndex) => {
              const next = { ...pagination, pageIndex };
              setPagination(next);
              loadServices(next, sorting, searchQuery);
            }}
            onPageSizeChange={(pageSize) => {
              localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(pageSize));
              const next = { pageIndex: 0, pageSize };
              setPagination(next);
              loadServices(next, sorting, searchQuery);
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default ServicesTable;
