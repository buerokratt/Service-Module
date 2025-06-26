import { useReactFlow } from "@xyflow/react";
import useServiceStore from "store/new-services.store";
import { Step, StepType } from "types";
import { getNodeLabel } from "utils/flow-utils";

function useEdgeAdd(id: string) {
  const { setEdges, setNodes, getNodes, getNode, getEdge } = useReactFlow();

  const handleEdgeClick = (step: Step) => {
    const edge = getEdge(id);
    if (!edge) return;

    const targetNode = getNode(edge.target);
    if (!targetNode) return;

    const nodeLabel = getNodeLabel(step, getNodes());
    const stepType: StepType = step.type;

    const newNodeId = crypto.randomUUID();

    const insertNode = {
      id: newNodeId,
      position: { x: targetNode.position.x, y: targetNode.position.y },
      data: {
        label: nodeLabel,
        onDelete: useServiceStore.getState().onDelete,
        onEdit: useServiceStore.getState().handleNodeEdit,
        type: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType)
          ? "finishing-step"
          : "step",
        stepType: stepType,
        readonly: [StepType.Auth, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType),
        setClickedNode: useServiceStore.getState().setClickedNode,
      },
      className: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType)
        ? "finishing-step"
        : "step",
      type: "custom",
    };

    const sourceEdge = {
      id: `${edge.source}->${newNodeId}`,
      source: edge.source,
      target: newNodeId,
      type: "step",
    };

    const targetEdge = {
      id: `${newNodeId}->${edge.target}`,
      source: newNodeId,
      target: edge.target,
      type: "step",
      animated: getNode(edge.target)?.type === "ghost",
      deletable: getNode(edge.target)?.type != "ghost",
    };

    setEdges((edges) => edges.filter((e) => e.id !== id).concat([sourceEdge, targetEdge]));

    setNodes((nodes) => {
      const targetNodeIndex = nodes.findIndex((node) => node.id === edge.target);
      const shouldReplace = stepType === StepType.FinishingStepEnd || stepType === StepType.FinishingStepRedirect;

      return shouldReplace
        ? [...nodes.slice(0, targetNodeIndex), insertNode]
        : [...nodes.slice(0, targetNodeIndex), insertNode, ...nodes.slice(targetNodeIndex)];
    });
  };
  return handleEdgeClick;
}

export default useEdgeAdd;
