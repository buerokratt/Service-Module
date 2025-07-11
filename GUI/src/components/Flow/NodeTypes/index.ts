import CustomNode from "./CustomNode";
import GhostNode from "./GhostNode";
import StartNode from "./StartNode";

export const nodeTypes = {
  start: StartNode,
  custom: CustomNode,
  ghost: GhostNode,
};

export default nodeTypes;
