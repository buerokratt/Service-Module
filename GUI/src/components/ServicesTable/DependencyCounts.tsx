import clsx from 'clsx';
import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineWarningAmber } from 'react-icons/md';

import { ReactComponent as ReferencedServicesIcon } from '../../static/icons/referenced_services.svg';
import { ReactComponent as ReferencingServicesIcon } from '../../static/icons/referencing_services.svg';

type DependencyCountsProps = {
  incoming: number;
  outgoing: number;
  problems?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const DependencyCounts: FC<DependencyCountsProps> = ({ incoming, outgoing, problems = 0, onClick }) => {
  const { t } = useTranslation();
  const label = `${t('overview.dependencies.incomingLabel')}: ${incoming}, ${t('overview.dependencies.outgoingLabel')}: ${outgoing}`;

  const counts = (
    <>
      <span className="dependency-counts__incoming">
        {incoming}
        <ReferencingServicesIcon
          className="dependency-counts__icon"
          style={{ visibility: incoming > 0 ? 'visible' : 'hidden' }}
          aria-hidden
        />
      </span>
      <span className="dependency-counts__outgoing">
        <ReferencedServicesIcon
          className="dependency-counts__icon"
          style={{ visibility: outgoing > 0 ? 'visible' : 'hidden' }}
          aria-hidden
        />
        {outgoing}
      </span>
    </>
  );

  return (
    <span className="dependency-counts">
      {onClick ? (
        <button type="button" className="dependency-counts__button" onClick={onClick} aria-label={label}>
          {counts}
        </button>
      ) : (
        <span className={clsx('dependency-counts__button', 'dependency-counts__button--static')} aria-label={label}>
          {counts}
        </span>
      )}
      {problems > 0 && (
        <MdOutlineWarningAmber
          className="dependency-counts__problem"
          title={t('overview.dependencies.problems', { count: problems }) ?? ''}
          aria-label={t('overview.dependencies.problems', { count: problems }) ?? ''}
        />
      )}
    </span>
  );
};

export default DependencyCounts;
