import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ExclamationBadge, Track } from '../';

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    type: string;
    readonly: boolean;
  }
}

const StepNode: FC<NodeDataProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Track style={{ width: '100%' }} direction='vertical' align='left'>
      <p>
        {!data.readonly && <ExclamationBadge></ExclamationBadge>}
        {data.label}
      </p>
      <p>Something something</p>
    </Track>
  );
};

export default memo(StepNode);
