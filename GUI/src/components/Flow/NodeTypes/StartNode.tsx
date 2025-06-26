import { FC } from "react";
import { Handle, Position, useNodeConnections } from "@xyflow/react";
import { IoChevronDown } from "react-icons/io5";

const StartNode: FC = () => {
  const connections = useNodeConnections();
  return (
    <div>
      <IoChevronDown size={45} />
      <Handle type="source" position={Position.Bottom} isConnectable={connections.length < 1} />
    </div>
  );
};

export default StartNode;
