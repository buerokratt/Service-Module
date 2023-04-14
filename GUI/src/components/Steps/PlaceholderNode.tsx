import {  FC } from 'react';
import { Handle, Position } from 'reactflow';

const PlaceholderNode: FC = () => {

  return (
    <>
      <Handle
        type='target'
        position={Position.Top}
      />
      <p style={{textAlign: 'center'}}>{t('serviceFlow.placeholderNode')}</p>
    </>
  );
};

export default PlaceholderNode;
