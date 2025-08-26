import { Handle, Position } from '@xyflow/react';
import { FC } from 'react';

const GhostNode: FC = () => {
  return (
    <div style={{ height: '5px', width: '5px', visibility: 'hidden' }}>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ background: 'transparent' }} />
    </div>
  );
};

export default GhostNode;
