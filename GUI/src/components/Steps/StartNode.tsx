import { FC } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import { Handle, Position } from "reactflow";

const StartNode: FC = () => {
  return (
    <>
      <MdPlayCircleFilled />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default StartNode;
