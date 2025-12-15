import { createColumnHelper, PaginationState, SortingState } from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTable, FormInput, Modal, Track } from '..';
import { getAllServices } from 'resources/api-constants';
import api from 'services/api-dev';
import { Service, ServiceState } from 'types';
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
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isExportAllModalVisible, setIsExportAllModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch services when modal opens
  const fetchServices = useCallback(async () => {
    if (!isVisible) return;

    setLoadingState('loading');
    setError(null);

    try {
      const response = await api.get(getAllServices());
      const servicesData = response.data.response || [];

      const fetchedServices: Service[] = servicesData.map((item: any, index: number) => ({
        id: index,
        name: item.name || '',
        serviceId: item.service_id || `service-${index}`,
        state: ServiceState.Draft,
        type: (item.type || 'POST') as 'GET' | 'POST',
        isCommon: false,
        slot: '',
        examples: [],
        entities: [],
        endpoints: [],
        linkedIntent: '',
        totalPages: 1,
        description: item.description || '',
      }));

      setServices(fetchedServices);
      setLoadingState('success');
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err?.message || t('overview.error.fetchingServices') || 'Failed to fetch services');
      setLoadingState('error');
      setServices([]);
    }
  }, [isVisible, t]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setSelectedServices(new Set());
      setSearchQuery('');
      setPagination({ pageIndex: 0, pageSize: 10 });
      setSorting([]);
    }
  }, [isVisible]);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const query = searchQuery.toLowerCase();
    return services.filter((service) => service.name.toLowerCase().includes(query) || service.serviceId.toLowerCase().includes(query));
  }, [services, searchQuery]);

  const toggleServiceSelection = useCallback((serviceId: string) => {
    setSelectedServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (selectedServices.size === 0) return;

    setIsExporting(true);
    const servicesToExport = services.filter((service) => selectedServices.has(service.serviceId));
    await exportServices(servicesToExport, t, false);
    setIsExporting(false);
    onClose();
  }, [selectedServices, services, t, onClose]);

  const handleExportAll = useCallback(async () => {
    setIsExportAllModalVisible(false);
    setIsExporting(true);
    await exportServices(services, t, true);
    setIsExporting(false);
    onClose();
  }, [services, t, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Service>();

    return [
      columnHelper.display({
        id: 'checkbox',
        header: '',
        meta: {
          size: 50,
        },
        cell: (props) => {
          const service = props.row.original;
          const serviceId = service.serviceId;
          if (!serviceId) return null;
          
          const isSelected = selectedServices.has(serviceId);
          const checkboxId = `export-checkbox-${serviceId}-${props.row.index}`;
          
          const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation();
            e.preventDefault();
            toggleServiceSelection(serviceId);
          };

          const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
            e.stopPropagation();
          };

          const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            if (e.target === e.currentTarget || (e.target as HTMLElement).tagName !== 'INPUT') {
              toggleServiceSelection(serviceId);
            }
          };
          
          return (
            <div
              key={checkboxId}
              onClick={handleDivClick}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
            >
              <input
                type="checkbox"
                id={checkboxId}
                checked={isSelected}
                onChange={handleCheckboxChange}
                onClick={handleCheckboxClick}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                data-service-id={serviceId}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        header: t('overview.service.name') ?? 'Name',
        meta: {
          size: 300,
        },
        cell: (props) => (
          <label style={{ fontWeight: 500, paddingLeft: '8px' }}>{props.cell.getValue()}</label>
        ),
      }),
      columnHelper.accessor('description', {
        header: t('overview.service.description') ?? 'Description',
        meta: {
          size: 400,
        },
        cell: (props) => (
          <label style={{ color: '#666', fontSize: '0.875rem', paddingLeft: '8px' }}>
            {props.cell.getValue() || '-'}
          </label>
        ),
      }),
      columnHelper.accessor('type', {
        header: t('overview.service.type') ?? 'Type',
        meta: {
          size: 100,
        },
        cell: (props) => (
          <label style={{ paddingLeft: '8px' }}>{props.cell.getValue()}</label>
        ),
      }),
      columnHelper.accessor('state', {
        header: t('overview.service.state') ?? 'State',
        meta: {
          size: 120,
        },
        cell: (props) => (
          <label style={{ paddingLeft: '8px' }}>
            {t(`overview.service.states.${props.cell.getValue()}`)}
          </label>
        ),
      }),
    ];
  }, [selectedServices, toggleServiceSelection, t]);

  if (!isVisible) return null;

  return (
    <>
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
              placeholder={t('global.search') + '...' || 'Search by name...'}
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
              <label style={{ color: '#d32f2f', textAlign: 'center' }}>
                {error || t('overview.error.fetchingServices') || 'Failed to fetch services'}
              </label>
              <Button appearance="primary" onClick={fetchServices}>
                {t('global.retry') || 'Retry'}
              </Button>
            </Track>
          )}
          {loadingState === 'success' && (
            <>
              {filteredServices.length === 0 ? (
                <Track justify="center" style={{ padding: '2rem' }}>
                  <label>{t('overview.noServicesFound') || 'No services found'}</label>
                </Track>
              ) : (
                <DataTable
                  data={filteredServices}
                  columns={columns}
                  sortable
                  sorting={sorting}
                  pagination={pagination}
                  setPagination={(state: PaginationState) => {
                    setPagination(state);
                  }}
                  setSorting={(state: SortingState) => {
                    setSorting(state);
                  }}
                  isClientSide={true}
                  meta={{
                    getRowStyles: (row) => {
                      const isSelected = selectedServices.has(row.original.serviceId);
                      return {
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(48, 134, 83, 0.1)' : undefined,
                        borderLeft: isSelected ? '3px solid #308653' : undefined,
                      };
                    },
                    onRowClick: (row) => {
                      const serviceId = row.original.serviceId;
                      if (serviceId) {
                        toggleServiceSelection(serviceId);
                      }
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
              onClick={() => setIsExportAllModalVisible(true)}
              disabled={services.length === 0 || loadingState !== 'success'}
            >
              {t('overview.exportAll')}
            </Button>
            <Button
              appearance="primary"
              onClick={handleExport}
              disabled={selectedServices.size === 0 || isExporting || loadingState !== 'success'}
            >
              {isExporting ? t('global.loading') : t('overview.export')}
            </Button>
          </Track>
        </div>
      </Modal>
      {isExportAllModalVisible && (
        <Modal title={t('overview.exportAll')} onClose={() => setIsExportAllModalVisible(false)}>
          <Track direction="vertical" gap={16}>
            <label>{t('overview.exportAllConfirmation')}</label>
            <Track justify="end" gap={16}>
              <Button appearance="secondary" onClick={() => setIsExportAllModalVisible(false)}>
                {t('overview.cancel')}
              </Button>
              <Button appearance="primary" onClick={handleExportAll} disabled={isExporting}>
                {isExporting ? t('global.loading') : t('overview.export')}
              </Button>
            </Track>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default ExportServicesModal;

