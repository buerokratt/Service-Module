import { memo } from 'react';
import { Handle, Position, NodeProps, BuiltInNode } from '@xyflow/react';

const PlaceholderNode = ({ id, data }: NodeProps<BuiltInNode>) => {

  return (
    <div  style={{textAlign:'center'}} >
      {data.label}
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export default memo(PlaceholderNode);
