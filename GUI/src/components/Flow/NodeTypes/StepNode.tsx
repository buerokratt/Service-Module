import { memo } from 'react';
import { Handle, Position, NodeProps, BuiltInNode } from '@xyflow/react';

const StepNode = ({ id, data }: NodeProps<BuiltInNode>) => {

  return (
    <div title="click to add a child node">
      {data.label}
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export default memo(StepNode);
