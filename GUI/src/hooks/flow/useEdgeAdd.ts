import { useReactFlow } from "@xyflow/react";
import useServiceStore from "store/new-services.store";
import { Step, StepType } from "types";

function useEdgeAdd(id: string) {
  const { setEdges, setNodes, getNode, getEdge } = useReactFlow();

  const handleEdgeClick = (step: Step) => {
    // Accept step as parameter
    const edge = getEdge(id);
    if (!edge) return;

    const targetNode = getNode(edge.target);
    if (!targetNode) return;

    console.log("Edge:", edge);
    console.log("Target Node:", targetNode);
    console.log("Step data:", step); // Now you can access the step data
    const nodeLabel = step.label;
    const stepType: StepType = step.type;

    const insertNodeId = crypto.randomUUID();

    const insertNode = {
      id: insertNodeId,
      position: { x: targetNode.position.x, y: targetNode.position.y },
      data: {
        label: nodeLabel,
        onDelete: useServiceStore.getState().onDelete,
        onEdit: useServiceStore.getState().handleNodeEdit,
        type: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType) ? "finishing-step" : "step",
        stepType: stepType,
        clientInputId: stepType === StepType.Input ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
        conditionId: stepType === StepType.Condition ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
        multiChoiceQuestionId:
        stepType === StepType.MultiChoiceQuestion ? parseInt(nodeLabel.split("-")[2].trim()) : undefined,
        assignId: stepType === StepType.Assign ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
        readonly: [
          StepType.Auth,
          StepType.FinishingStepEnd,
          StepType.FinishingStepRedirect,
        ].includes(stepType),
        childrenCount: stepType === StepType.Input || stepType === StepType.Condition || stepType === StepType.MultiChoiceQuestion ? 2 : 1,
        setClickedNode: useServiceStore.getState().setClickedNode,
        // message: setDefaultMessages(stepType),
        // originalDefinedNodeId: stepType === StepType.UserDefined ? originalDefinedNodeId : undefined,
      },
      className: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType)
        ? "finishing-step"
        : "step",
      type: "custom",
     }

    const sourceEdge = {
      id: `${edge.source}->${insertNodeId}`,
      source: edge.source,
      target: insertNodeId,
      type: "step",
    };

    const targetEdge = {
      id: `${insertNodeId}->${edge.target}`,
      source: insertNodeId,
      target: edge.target,
      type: "step",
    };

    setEdges((edges) => edges.filter((e) => e.id !== id).concat([sourceEdge, targetEdge]));

    setNodes((nodes) => {
      const targetNodeIndex = nodes.findIndex((node) => node.id === edge.target);
      return [...nodes.slice(0, targetNodeIndex), insertNode, ...nodes.slice(targetNodeIndex)];
    });
  };
  return handleEdgeClick;
}


export default useEdgeAdd;
