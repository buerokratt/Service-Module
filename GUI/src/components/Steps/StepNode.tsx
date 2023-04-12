import { FC, memo } from 'react';

import { Track } from '../';

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    type: string;
  }
}

const StepNode: FC<NodeDataProps> = ({ data }) => {

  return (
    <Track style={{width: '100%'}} direction='vertical' align='left'>
      {'label' in data && (<p>{data.label}</p>)}
        <p>hello</p>
    </Track>
  );
};

export default memo(StepNode);
