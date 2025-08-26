import { FC, useEffect, useMemo, useState } from 'react';
import { createColumnHelper, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MdOutlineArrowForward } from 'react-icons/md';
import useServiceStore from 'store/services.store';
import { Button, DataTable, Dialog, FormInput, Icon, Modal, Track } from 'components';
import { Intent } from 'types/Intent';
import i18n from 'i18n';
import { Link } from 'react-router-dom';

type ConnectServiceToIntentModelProps = {
  onModalClose: () => void;
  onConnect: () => void;
  canCancel?: boolean;
  canSkip?: boolean;
  onSkip?: () => void;
};

const ConnectServiceToIntentModel: FC<ConnectServiceToIntentModelProps> = ({
  onModalClose,
  onConnect,
  canCancel = true,
  canSkip = false,
  onSkip,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [intents, setIntents] = useState<Intent[] | undefined>(undefined);
  const [selectedIntent, setSelectedIntent] = useState<Intent>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const loadAvailableIntents = (pagination: PaginationState, sorting: SortingState, search: string) => {
    useServiceStore
      .getState()
      .loadAvailableIntentsList(
        (requests: Intent[]) => setIntents(requests),
        t('overview.service.toast.failed.availableIntents'),
        pagination,
        sorting,
        search,
      );
  };

  useEffect(() => {
    const intialPagination = { pageIndex: 0, pageSize: 10 };
    loadAvailableIntents(filter ? intialPagination : pagination, sorting, filter);
  }, [filter]);

  const intentColumns = useMemo(
    () =>
      getColumns((intent) => {
        setSelectedIntent(intent);
        setShowConfirmationModal(true);
      }),
    [],
  );

  return (
    <Dialog title={t('overview.popup.connectServiceToIntent')} onClose={onModalClose} size="large">
      <Track
        direction="vertical"
        gap={8}
        style={{
          margin: '-16px -16px 0',
          padding: '16px',
          borderBottom: '1px solid #D2D3D8',
        }}
      >
        <FormInput
          label={t('overview.popup.searchIntents').toString()}
          name="search"
          placeholder={t('overview.popup.searchIntents') + '...'}
          hideLabel
          onChange={(e) => setFilter(e.target.value)}
        />
      </Track>
      {!intents && (
        <Track justify="center" gap={16} direction="vertical">
          <div className="loader" style={{ marginTop: 10 }} />
        </Track>
      )}
      {intents && intents.length === 0 && (
        <Track justify="center" gap={16} direction="vertical">
          <label style={{ margin: 30 }}>{t('overview.popup.noIntentsAvailable')}</label>
        </Track>
      )}
      {intents && intents.length > 0 && (
        <DataTable
          data={intents}
          columns={intentColumns}
          sortable
          sorting={sorting}
          pagination={pagination}
          setPagination={(state: PaginationState) => {
            if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
            setPagination(state);
            loadAvailableIntents(state, sorting, filter);
          }}
          setSorting={(state: SortingState) => {
            setSorting(state);
            loadAvailableIntents(pagination, state, filter);
          }}
          isClientSide={false}
          pagesCount={intents[intents.length - 1]?.totalPages ?? 1}
        />
      )}
      <Track
        justify="between"
        style={{
          margin: '10px -16px 0 -16px',
          padding: '16px 25px 0 25px',
          borderTop: '1px solid #D2D3D8',
        }}
      >
        <Link style={{ color: '#005aa3' }} to={import.meta.env.REACT_APP_INTENT_CREATION_PATH}>
          {`+ ${t('overview.popup.createNewIntent')}`}
        </Link>
        <Track gap={15}>
          {canCancel && (
            <Button appearance="error" onClick={onModalClose}>
              {t('global.cancel')}
            </Button>
          )}
          {canSkip && <Button onClick={onSkip}>{t('global.skip')}</Button>}
        </Track>
      </Track>
      {showConfirmationModal && (
        <Modal title={t('overview.popup.connectionQuestion')} onClose={() => setShowConfirmationModal(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setShowConfirmationModal(false)}>
              {t('global.no')}
            </Button>
            <Button
              appearance={!isConnecting ? 'primary' : 'loading'}
              onClick={() => {
                if (selectedIntent) {
                  setIsConnecting(true);
                  useServiceStore
                    .getState()
                    .requestServiceIntentConnection(
                      () => setShowConfirmationModal(false),
                      t('overview.service.toast.connectedToIntentSuccessfully'),
                      t('overview.service.toast.failed.failedToConnectToIntent'),
                      selectedIntent.intent,
                      pagination,
                      sorting,
                    )
                    .then(() => {
                      setIsConnecting(false);
                      onConnect();
                    })
                    .catch((e) => {
                      console.error('Error connecting to intent:', e);
                      setIsConnecting(false);
                    });
                }
              }}
            >
              {t('global.yes')}
            </Button>
          </Track>
        </Modal>
      )}
    </Dialog>
  );
};

const getColumns = (onClick: (intent: Intent) => void) => {
  const columnHelper = createColumnHelper<Intent>();

  return [
    columnHelper.accessor('intent', {
      header: i18n.t('overview.popup.intent') ?? '',
    }),
    columnHelper.display({
      id: 'connect',
      cell: (props) => (
        <Button appearance="text" onClick={() => onClick(props.row.original)}>
          <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
          {i18n.t('overview.popup.connect')}
        </Button>
      ),
      meta: {
        size: '1%',
      },
    }),
  ];
};

export default ConnectServiceToIntentModel;
