import { FC } from 'react';
import { Handle, Position } from '@xyflow/react';
import { IoChevronDown } from 'react-icons/io5';

const StartNode: FC = () => {
  return (
    <div className="start-node">
      <IoChevronDown size={45} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default StartNode;
