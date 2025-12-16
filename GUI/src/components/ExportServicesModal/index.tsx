import { CellContext, createColumnHelper, PaginationState, SortingState } from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTable, FormCheckbox, FormInput, Modal, Track } from '..';
import { getAllServices } from 'resources/api-constants';
import api from 'services/api-dev';
import { Service } from 'types';
import { exportServices } from 'utils/service-export';
import './ExportServicesModal.scss';

interface ExportServicesModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const ExportServicesModal: FC<ExportServicesModalProps> = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchServices = useCallback(
    async (paginationState: PaginationState) => {
      if (!isVisible) return;

      setLoadingState('loading');
      setError(null);

      try {
        const response = await api.post(getAllServices(), {
          page: paginationState.pageIndex + 1,
          page_size: paginationState.pageSize,
          sorting: 'name asc',
        });
        const servicesData = response.data.response ?? [];
        const fetchedServices: Service[] = servicesData.map((item: Service) => ({
          name: item.name,
          serviceId: item.serviceId,
          structure: item.structure,
          totalPages: item.totalPages,
        }));

        setServices(fetchedServices);
        setLoadingState('success');
      } catch (error) {
        console.error(error);
        setError(t('overview.error.fetchingServices'));
        setLoadingState('error');
        setServices([]);
      }
    },
    [isVisible, t],
  );

  useEffect(() => {
    fetchServices(pagination);
  }, [fetchServices]);

  useEffect(() => {
    if (isVisible) {
      setSelectedServices([]);
      setSearchQuery('');
      setPagination({ pageIndex: 0, pageSize: 10 });
      setSorting([]);
    }
  }, [isVisible]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) => service.name.toLowerCase().includes(query) || service.serviceId.toLowerCase().includes(query),
    );
  }, [services, searchQuery]);

  const toggleServiceSelection = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const newSelected = [...prev];
      const index = newSelected.findIndex((s) => s.serviceId === service.serviceId);
      if (index > -1) {
        newSelected.splice(index, 1);
      } else {
        newSelected.push(service);
      }
      return newSelected;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (selectedServices.length === 0) return;

    setIsExporting(true);
    await exportServices(selectedServices);
    setIsExporting(false);
    onClose();
  }, [selectedServices, services, t, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const buildNameCell = (props: CellContext<Service, unknown>) => {
    const service = props.row.original;
    const serviceId = service.serviceId;

    if (!serviceId) return null;

    return (
      <FormCheckbox
        item={{
          label: service.name,
          value: service.serviceId,
        }}
        checked={selectedServices.some((s) => s.serviceId === serviceId)}
        onChange={() => toggleServiceSelection(service)}
      />
    );
  };

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Service>();

    return [
      columnHelper.display({
        id: 'name',
        header: t('overview.service.name') ?? 'Service Name',
        cell: (props) => buildNameCell(props),
      }),
    ];
  }, [selectedServices, toggleServiceSelection, t]);

  if (!isVisible) return null;

  return (
    <Modal title={t('overview.exportManyTitle')} onClose={handleCancel}>
      <div className="export-services-modal">
        <Track
          direction="vertical"
          gap={8}
          style={{
            margin: '-16px -16px 16px -16px',
            padding: '16px',
            borderBottom: '1px solid #D2D3D8',
          }}
        >
          <FormInput
            label={t('global.search') || 'Search'}
            name="search"
            placeholder={t('global.search') + '...'}
            hideLabel
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            disabled={loadingState === 'loading' || loadingState === 'error'}
          />
        </Track>
        {loadingState === 'loading' && (
          <Track justify="center" style={{ padding: '3rem' }}>
            <div className="loader" />
          </Track>
        )}
        {loadingState === 'error' && (
          <Track direction="vertical" gap={16} justify="center" style={{ padding: '3rem' }}>
            <label style={{ color: '#d32f2f', textAlign: 'center' }}>{error}</label>
            <Button onClick={() => fetchServices(pagination)}>{t('global.retry') || 'Retry'}</Button>
          </Track>
        )}
        {loadingState === 'success' && (
          <>
            {filteredServices.length === 0 ? (
              <Track justify="center" style={{ padding: '2rem' }}>
                <label>{t('overview.noServicesFound')}</label>
              </Track>
            ) : (
              <DataTable
                data={filteredServices}
                columns={columns}
                sortable
                pagesCount={services.at(-1)?.totalPages ?? 1}
                sorting={sorting}
                pagination={pagination}
                setPagination={(state: PaginationState) => {
                  setPagination(state);
                  fetchServices(state);
                }}
                setSorting={(state: SortingState) => {
                  setSorting(state);
                }}
                isClientSide={false}
                meta={{
                  getRowStyles: (row) => {
                    const isSelected = selectedServices.some((s) => s.serviceId === row.original.serviceId);
                    return {
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(48, 134, 83, 0.1)' : undefined,
                      borderLeft: isSelected ? '3px solid #308653' : undefined,
                    };
                  },
                  onRowClick: (row) => {
                    toggleServiceSelection(row.original);
                  },
                }}
              />
            )}
          </>
        )}
        <Track justify="end" gap={16} style={{ marginTop: '1.5rem' }}>
          <Button appearance="secondary" onClick={handleCancel}>
            {t('overview.cancel')}
          </Button>
          <Button
            appearance="primary"
            onClick={handleExport}
            disabled={selectedServices.length === 0 || isExporting || loadingState !== 'success'}
          >
            {isExporting ? t('global.loading') : t('overview.export')}
          </Button>
        </Track>
      </div>
    </Modal>
  );
};

export default ExportServicesModal;
