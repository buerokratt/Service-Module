import { Handle, NodeProps, Position, useUpdateNodeInternals } from '@xyflow/react';
import { FC, useEffect } from 'react';
import useServiceStore from 'store/services.store';

const GhostNode: FC<NodeProps> = (props) => {
  const { id } = props;
  const orientation = useServiceStore((state) => state.orientation);

  const handlePosition = orientation === 'vertical' ? Position.Top : Position.Left;

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, orientation]);

  return (
    <div style={{ height: '5px', width: '5px', visibility: 'hidden' }}>
      <Handle type="target" position={handlePosition} isConnectable={false} style={{ background: 'transparent' }} />
    </div>
  );
};

export default GhostNode;
