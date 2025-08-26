import { FC } from 'react';
import { Handle, Position } from '@xyflow/react';

const GhostNode: FC = () => {
  return (
    <div style={{ height: '5px', width: '5px', visibility: 'hidden' }}>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'transparent' }} />
    </div>
  );
};

export default GhostNode;
