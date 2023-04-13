import { FC, memo } from 'react';

import { ExclamationBadge, Track } from '../';
import { StepType } from '../../types/step';

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    type: string;
    stepType: StepType;
    readonly: boolean;
    message?: string;
  }
}

const StepNode: FC<NodeDataProps> = ({ data }) => {

  const createMarkup = (text: string) => {
    return {
      __html: text
    };
  };

  return (
    <Track style={{ width: '100%' }} direction='vertical' align='left'>
      <p>
        {!(data.readonly || !!data.message?.length) && <ExclamationBadge></ExclamationBadge>}
        {data.label}
      </p>
      <div dangerouslySetInnerHTML={createMarkup(data.message ?? '')}></div>
    </Track>
  );
};

export default memo(StepNode);
