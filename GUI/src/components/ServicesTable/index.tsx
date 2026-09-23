import { PaginationState, SortingState } from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useServiceListStore from 'store/services.store';
import useToastStore from 'store/toasts.store';
import { ActivationBlocker } from 'types/activation-blocker';
import { navigateToService } from 'utils/service-navigation-utils';
import { getServiceStateLabelType } from 'utils/service-state-label';

import { Button, Card, Label, Modal, Track } from '..';
import DataTable from '../DataTable';
import { getColumns } from './columns';

import '../../styles/main.scss';
import './ServicesTable.scss';

type ServicesTableProps = {
  isCommon?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = new Set([10, 20, 30, 50]);
const PAGE_SIZE_STORAGE_KEY = 'page-size';

const getStoredPageSize = (): number => {
  const stored = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return PAGE_SIZE_OPTIONS.has(stored) ? stored : DEFAULT_PAGE_SIZE;
};

const ServicesTable: FC<ServicesTableProps> = ({ isCommon = false }) => {
  const { t } = useTranslation();
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [activationBlockers, setActivationBlockers] = useState<ActivationBlocker[] | null>(null);
  const [isCheckingActivation, setIsCheckingActivation] = useState(false);
  const services = useServiceListStore((state) => (isCommon ? state.commonServices : state.notCommonServices));
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: getStoredPageSize(),
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const loadServices = (paginationState: PaginationState, sortingState: SortingState) => {
    void useServiceListStore.getState().loadServicesList(paginationState, sortingState);
  };

  const loadCommonServices = (paginationState: PaginationState, sortingState: SortingState) => {
    void useServiceListStore.getState().loadCommonServicesList(paginationState, sortingState);
  };

  const [isDeletingService, setIsDeletingService] = useState(false);

  useEffect(() => {
    if (isCommon) {
      loadCommonServices(pagination, sorting);
    } else {
      loadServices(pagination, sorting);
    }
  }, [isCommon, pagination, sorting]);

  const changeServiceState = useCallback(
    (activate: boolean = false, draft: boolean = false) => {
      useServiceListStore
        .getState()
        .changeServiceState(
          () => {},
          t('overview.service.toast.updated'),
          t('overview.service.toast.failed.state'),
          activate,
          draft,
          pagination,
          sorting,
        )
        .then(() => {})
        .catch((e) => {
          console.error(e);
        });
    },
    [t, pagination, sorting],
  );

  const attemptActivation = useCallback(async () => {
    const service = useServiceListStore.getState().selectedService;
    if (!service || isCheckingActivation) return;

    setIsCheckingActivation(true);
    try {
      const blockers = await useServiceListStore.getState().loadActivationBlockers(service);
      if (blockers.length > 0) {
        setActivationBlockers(blockers);
      } else {
        changeServiceState(true);
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().error({ title: t('overview.service.toast.failed.state') });
    } finally {
      setIsCheckingActivation(false);
    }
  }, [changeServiceState, isCheckingActivation, t]);

  const columns = useMemo(() => {
    return getColumns({
      isCommon,
      navigate,
      hideDeletePopup: () => setIsDeletePopupVisible(true),
      showReadyPopup: () => {
        void attemptActivation();
      },
    });
  }, [isCommon, attemptActivation, navigate]);

  const deleteSelectedService = () => {
    setIsDeletingService(true);
    useServiceListStore
      .getState()
      .deleteSelectedService(
        async () => {
          setIsDeletePopupVisible(false);
          await useServiceListStore.getState().loadServicesList(pagination, sorting);
          await useServiceListStore.getState().loadCommonServicesList(pagination, sorting);
        },
        t('overview.service.toast.deleted'),
        t('overview.service.toast.failed.delete'),
        pagination,
        sorting,
      )
      .then(() => {
        setIsDeletingService(false);
      })
      .catch(() => {
        setIsDeletingService(false);
      });
  };

  return (
    <Card>
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
      {activationBlockers && activationBlockers.length > 0 && (
        <Modal
          title={t('overview.popup.activationBlocked.title')}
          onClose={() => setActivationBlockers(null)}
          footer={
            <Button appearance="primary" onClick={() => setActivationBlockers(null)}>
              {t('global.continue')}
            </Button>
          }
        >
          <ul className="activation-blockers-list">
            {activationBlockers.map((blocker) => {
              const content = (
                <Track justify="between">
                  <strong>{blocker.name}</strong>
                  <Label type={getServiceStateLabelType(blocker.state)}>
                    {t(`overview.service.states.${blocker.state}`)}
                  </Label>
                </Track>
              );

              return (
                <li key={blocker.serviceId}>
                  {blocker.state === 'missing' ? (
                    <div className="activation-blockers-list__item activation-blockers-list__item--static">
                      {content}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="activation-blockers-list__item"
                      onClick={() => {
                        setActivationBlockers(null);
                        navigateToService(blocker.serviceId, navigate);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
      <DataTable
        sortable
        data={services}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        setPagination={(state: PaginationState) => {
          if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
          if (state.pageSize !== pagination.pageSize) {
            localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(state.pageSize));
          }
          setPagination(state);
          if (isCommon) {
            loadCommonServices(state, sorting);
          } else {
            loadServices(state, sorting);
          }
        }}
        setSorting={(state: SortingState) => {
          setSorting(state);
          if (isCommon) {
            loadCommonServices(pagination, state);
          } else {
            loadServices(pagination, state);
          }
        }}
        isClientSide={false}
        pagesCount={services.at(-1)?.totalPages ?? 1}
      />
    </Card>
  );
};

export default ServicesTable;
