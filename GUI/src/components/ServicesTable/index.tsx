import { PaginationState, SortingState } from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useServiceListStore from 'store/services.store';

import { Button, Card, Modal, Track } from '..';
import DataTable from '../DataTable';
import { getColumns } from './columns';

import '../../styles/main.scss';
import './ServicesTable.scss';

type ServicesTableProps = {
  isCommon?: boolean;
};

const ServicesTable: FC<ServicesTableProps> = ({ isCommon = false }) => {
  const { t } = useTranslation();
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const services = useServiceListStore((state) => (isCommon ? state.commonServices : state.notCommonServices));
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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

  const columns = useMemo(() => {
    return getColumns({
      isCommon,
      navigate,
      hideDeletePopup: () => setIsDeletePopupVisible(true),
      showReadyPopup: () => {
        changeServiceState(true);
      },
    });
  }, [isCommon, changeServiceState, navigate]);

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
      <DataTable
        sortable
        data={services}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        setPagination={(state: PaginationState) => {
          if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
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
        pagesCount={services[services.length - 1]?.totalPages ?? 1}
      />
    </Card>
  );
};

export default ServicesTable;
