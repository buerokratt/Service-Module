import { Edge, Node, useReactFlow } from "@xyflow/react";
import useServiceStore from "store/new-services.store";
import { Step, StepType } from "types";
import { getNodeLabel } from "utils/flow-utils";

function useEdgeAdd(id: string) {
  const { setEdges, setNodes, getNodes, getNode, getEdge } = useReactFlow();

  const handleEdgeClick = async (step: Step) => {
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
        type: [StepType.DynamicChoices, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType)
          ? "finishing-step"
          : "step",
        stepType: stepType,
        readonly: [StepType.Auth, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType),
        endpoint: step.data,
        setClickedNode: useServiceStore.getState().setClickedNode,
      },
      className: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(stepType)
        ? "finishing-step"
        : [StepType.DynamicChoices].includes(stepType)
        ? "dynamic-choices"
        : "step",
      type: "custom",
    };

    const sourceEdge = {
      id: `${edge.source}->${newNodeId}`,
      source: edge.source,
      target: newNodeId,
      type: "step",
      label: edge.label
    };

    let targetEdge: Edge | null = null;

    if (
      stepType != StepType.DynamicChoices &&
      stepType != StepType.FinishingStepEnd &&
      stepType != StepType.FinishingStepRedirect
    ) {
      targetEdge = {
        id: `${newNodeId}->${edge.target}`,
        source: newNodeId,
        target: edge.target,
        type: "step",
        animated: getNode(edge.target)?.type === "ghost",
        deletable: getNode(edge.target)?.type != "ghost",
      };
    }

    let ghostNodes: Node[] = [];
    let ghostEdges: Edge[] = []; 

    if (stepType === StepType.MultiChoiceQuestion || stepType === StepType.Condition || stepType === StepType.Input) {
      const labels = stepType === StepType.MultiChoiceQuestion ? ["Yes", "No"] : ["Success", "Failure"];
      ghostNodes = labels.slice(1).map((_, i) => ({
        id: crypto.randomUUID(),
        type: "ghost",
        position: {
          x: targetNode.position.x,
          y: targetNode.position.y,
        },
        data: { type: "ghost" },
        className: "ghost",
        selectable: false,
        draggable: false,
      }));

      ghostEdges = ghostNodes.map((ghostNode, i) => {
        return {
          id: `${newNodeId}->${ghostNode.id}`,
          source: newNodeId,
          target: ghostNode.id,
          type: "step",
          animated: true,
          deletable: false,
          label: labels[i],
        };
      });

      if (targetEdge) {
        targetEdge.label = labels[labels.length - 1] ?? "+";
      }
    }

    let newEdges: Edge[] = []

    setEdges((edges) => {
      newEdges = edges.filter((e) => e.id !== id).concat([sourceEdge], targetEdge ?? [], ghostEdges);
      return newEdges;
    });

    setNodes((nodes) => {
      const targetNodeIndex = nodes.findIndex((node) => node.id === edge.target);
      const newNodes = [...nodes.slice(0, targetNodeIndex), insertNode, ...nodes.slice(targetNodeIndex)];

      const newNodeIndex = newNodes.findIndex((node) => node.id === newNodeId);
      newNodes.splice(newNodeIndex + 1, 0, ...ghostNodes);

      return newNodes;
    });
  };
  return handleEdgeClick;
}

export default useEdgeAdd;
