import { createColumnHelper } from '@tanstack/react-table';
import { Button, Icon, Tooltip, Track } from 'components';
import { format } from 'date-fns';
import { TFunction } from 'i18next';
import { MdCheck, MdClose } from 'react-icons/md';
import { VerificationMetadata } from 'store/api-registry.store';
import { EndpointData } from 'types/endpoint';

const NAME_MAX = 30;
const ELLIPSIS = '…';

export function truncateName(label: string): string {
  if (label && label.length <= NAME_MAX) return label;
  if (label) return label.slice(0, 29) + ELLIPSIS;
  return '—';
}

export function formatLastTest(lastTestAt: string | null): string {
  if (lastTestAt) {
    try {
      const d = new Date(lastTestAt);
      return format(d, 'dd.MM.yyyy HH:mm');
    } catch {
      // fallthrough
    }
  }
  return '—';
}

export function formatStatus(meta: VerificationMetadata | undefined): { icon: React.ReactNode; text: string } {
  if (meta?.verificationStatus === 'verified') {
    return { icon: <MdCheck />, text: String(meta.lastStatusCode ?? '2xx') };
  }
  if (meta?.verificationStatus === 'failed') {
    return { icon: <MdClose />, text: String(meta.lastStatusCode ?? '—') };
  }
  return { icon: <MdClose />, text: '—' };
}

export function getApiRegistryColumns(config: {
  t: TFunction;
  onEdit: (endpoint: EndpointData) => void;
  onDelete: (endpoint: EndpointData) => void;
  testingId: string | null;
  onTest: (endpoint: EndpointData) => void;
  onCopy: (endpoint: EndpointData) => void;
  verificationMap: Record<string, VerificationMetadata>;
}) {
  const { t, verificationMap } = config;
  const columnHelper = createColumnHelper<EndpointData>();

  return [
    columnHelper.accessor((row) => row.definitions?.[0]?.label ?? row.name ?? '', {
      id: 'name',
      header: String(t('apiRegistry.columns.name')),
      cell: ({ row }) => {
        const endpoint = row.original;
        const def = endpoint.definitions?.[0];
        const label = def?.label ?? endpoint.name ?? '';
        const fullName = label;
        const description = def?.description ?? '—';
        const method = def?.methodType ?? '—';
        const url = def?.url ?? def?.openApiUrl ?? def?.path ?? '—';
        return (
          <Tooltip
            content={
              <Track direction="vertical" gap={4}>
                <span>
                  <strong>{t('apiRegistry.tooltip.fullName')}:</strong> {fullName}
                </span>
                <span>
                  <strong>{t('apiRegistry.tooltip.description')}:</strong> {description}
                </span>
                <span>
                  <strong>{t('apiRegistry.tooltip.method')}:</strong> {method}
                </span>
                <span>
                  <strong>{t('apiRegistry.tooltip.url')}:</strong> {url}
                </span>
              </Track>
            }
          >
            <span>{truncateName(label)}</span>
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor((row) => verificationMap[row.endpointId]?.lastTestAt ?? null, {
      id: 'lastTest',
      header: String(t('apiRegistry.columns.lastTest')),
      cell: ({ row }) => formatLastTest(verificationMap[row.original.endpointId]?.lastTestAt ?? null),
    }),
    columnHelper.accessor((row) => verificationMap[row.endpointId]?.verificationStatus ?? 'unverified', {
      id: 'status',
      header: String(t('apiRegistry.columns.status')),
      cell: ({ row }) => {
        const meta = verificationMap[row.original.endpointId];
        const { icon, text } = formatStatus(meta);
        return (
          <Track gap={8} align="center">
            <Icon icon={icon} size="small" />
            <span>{text}</span>
          </Track>
        );
      },
    }),
    columnHelper.accessor((row) => verificationMap[row.endpointId]?.schemaCaptured ?? false, {
      id: 'schema',
      header: String(t('apiRegistry.columns.schema')),
      cell: ({ row }) => {
        const captured = verificationMap[row.original.endpointId]?.schemaCaptured ?? false;
        return captured ? t('global.yes') : t('apiRegistry.noSchema');
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: String(t('apiRegistry.columns.actions')),
      cell: ({ row }) => {
        const endpoint = row.original;
        const isTesting = config.testingId === endpoint.endpointId;
        return (
          <Track gap={8}>
            <Button appearance="secondary" size="s" onClick={() => config.onCopy(endpoint)}>
              {t('apiRegistry.actions.copy')}
            </Button>
            <Button
              appearance="secondary"
              size="s"
              onClick={() => config.onTest(endpoint)}
              disabled={isTesting}
              style={isTesting ? { opacity: 0.7 } : undefined}
            >
              {isTesting ? t('global.loading') : t('apiRegistry.actions.test')}
            </Button>
            <Button appearance="secondary" size="s" onClick={() => config.onEdit(endpoint)}>
              {t('apiRegistry.actions.edit')}
            </Button>
            <Button appearance="secondary" size="s" onClick={() => config.onDelete(endpoint)}>
              {t('apiRegistry.actions.delete')}
            </Button>
          </Track>
        );
      },
    }),
  ];
}
