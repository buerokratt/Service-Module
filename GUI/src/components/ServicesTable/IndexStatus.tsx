import clsx from 'clsx';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCancel, MdCheckCircle } from 'react-icons/md';
import { ServiceIndexStatus } from 'types/service';

import { ReactComponent as RefreshIcon } from '../../static/icons/referesh.svg';

type IndexStatusProps = {
  status?: ServiceIndexStatus | null;
  canReindex: boolean;
  onReindex?: () => void;
};

const IndexStatusIcon: FC<{ status?: ServiceIndexStatus | null }> = ({ status }) => {
  const { t } = useTranslation();
  const title = t(`overview.index.status.${status ?? 'NONE'}`) ?? '';

  switch (status) {
    case 'SUCCESS':
      return (
        <MdCheckCircle className="index-status__icon index-status__icon--success" title={title} aria-label={title} />
      );
    case 'FAILED':
      return <MdCancel className="index-status__icon index-status__icon--failed" title={title} aria-label={title} />;
    case 'IN_PROGRESS':
      return (
        <span className="index-status__icon index-status__icon--processing" title={title} aria-label={title}>
          <span />
        </span>
      );
    default:
      return <span className="index-status__icon index-status__icon--none" title={title} aria-label={title} />;
  }
};

const IndexStatus: FC<IndexStatusProps> = ({ status, canReindex, onReindex }) => {
  const { t } = useTranslation();

  return (
    <span className="index-status">
      <IndexStatusIcon status={status} />
      <button
        type="button"
        className={clsx('services-table__text-action', 'index-status__reindex')}
        disabled={!canReindex}
        title={canReindex ? undefined : (t('overview.index.reindexOnlyActive') ?? '')}
        onClick={onReindex}
      >
        <RefreshIcon className="index-status__reindex-icon" aria-hidden />
        {t('overview.index.reindex')}
      </button>
    </span>
  );
};

export default IndexStatus;
