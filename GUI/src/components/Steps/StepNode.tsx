import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';

import { Switch, Track } from '../';

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    type: string;
  }
}

const StepNode: FC<NodeDataProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Track style={{ width: '100%' }} direction='vertical' align='left'>
      {'label' in data && (<p>{data.label}</p>)}
    </Track>
  );
};

export default memo(StepNode);
