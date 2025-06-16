import { FC, memo } from 'react';
import { MdChevronRight, MdPlayCircleFilled } from "react-icons/md";
import { Handle, Position } from '@xyflow/react';
import { IoChevronDown } from 'react-icons/io5';

const StartNode: FC = () => {
  return (
    <div>
      <IoChevronDown size={45} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
export default memo(StartNode);
