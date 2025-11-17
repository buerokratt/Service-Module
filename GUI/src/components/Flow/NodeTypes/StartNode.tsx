import { Handle, NodeProps, Position, useUpdateNodeInternals } from '@xyflow/react';
import { FC, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import useServiceStore from 'store/services.store';

const StartNode: FC<NodeProps> = (props) => {
  const { id } = props;
  const orientation = useServiceStore((state) => state.orientation);

  const handlePosition = orientation === 'vertical' ? Position.Bottom : Position.Right;

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, orientation]);

  return (
    <div className="start-node" data-orientation={orientation}>
      <IoChevronDown
        size={45}
        style={{
          transform: `rotate(${orientation === 'vertical' ? 0 : -90}deg)`,
          transition: 'transform 0.2s ease-in-out',
        }}
      />
      <Handle type="source" position={handlePosition} />
    </div>
  );
};

export default StartNode;
