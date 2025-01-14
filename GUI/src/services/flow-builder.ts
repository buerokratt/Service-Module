import { useTranslation } from "react-i18next";
import { Node, Edge, MarkerType, XYPosition, NodeChange, NodeDimensionChange } from "reactflow";
import useServiceStore from "store/new-services.store";
import { ConditionRuleType, StepType } from "types";
import { GRID_UNIT, EDGE_LENGTH } from "types/service-flow";

// refactor this file later

export const buildPlaceholder = ({
  id,
  label,
  matchingPlaceholder,
  position,
}: {
  id: string;
  label?: string;
  matchingPlaceholder?: Node;
  position?: XYPosition;
}): Node => {
  if (!matchingPlaceholder && !position) throw Error("Either matchingPlaceholder or position have to be defined.");

  const positionX = position ? position.x : matchingPlaceholder!.position.x;
  const positionY = position ? position.y : matchingPlaceholder!.position.y + (matchingPlaceholder!.height ?? 0);

  return {
    id,
    type: "placeholder",
    position: {
      x: positionX,
      y: EDGE_LENGTH + positionY,
    },
    data: {
      type: "placeholder",
      label,
    },
    className: "placeholder",
    selectable: false,
    draggable: false,
  };
};

export const buildEdge = ({
  id,
  source,
  sourceHandle,
  target,
}: {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
}): Edge => {
  return {
    id,
    sourceHandle,
    source,
    target,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  };
};

export const alignNodesInCaseAnyGotOverlapped = (nodeChanges: NodeChange[], prevNodes: Node[], prevEdges: Edge[]) => {
  // Find node following every updated node to see if it overlaps
  nodeChanges.forEach((nodeChange: NodeChange) => {
    if (nodeChange.type !== "dimensions") return;
    const nodeId = (nodeChange as NodeDimensionChange).id;
    const updatedNode = prevNodes.find((node) => node.id === nodeId);
    if (!updatedNode) return;
    const edgesAfterNode = prevEdges.filter((edge) => edge.source === updatedNode.id).map((edge) => edge.target);
    if (edgesAfterNode.length === 0) return;
    const followingNodes = prevNodes.filter((node) => edgesAfterNode.includes(node.id));
    if (followingNodes.length === 0) return;

    followingNodes.forEach((node) => {
      // If this node is overlapped by the previous one, pull it down
      if (node.position.y <= updatedNode.position.y + (updatedNode.height ?? 0)) {
        node.position.y = EDGE_LENGTH + updatedNode.position.y + (updatedNode.height ?? 0);
      }
    });
  });
  return prevNodes;
}

export const buildRuleWithPlaceholder = ({
  id,
  offset,
  inputNode,
  label,
  name,
  condition,
  value,
}: {
  id: number;
  offset: number;
  inputNode: Node;
  label: string;
  name?: string;
  condition?: string;
  value?: string;
}): Node[] => {
  const positionX = inputNode.position.x;
  const positionY = EDGE_LENGTH + inputNode.position.y + (inputNode.height ?? 0);

  return [
    {
      id: `${id}`,
      position: {
        x: positionX + offset,
        y: positionY,
      },
      type: "customNode",
      data: {
        label,
        onDelete: useServiceStore.getState().onDelete,
        onEdit: useServiceStore.getState().handleNodeEdit,
        type: "rule",
        stepType: StepType.Rule,
        readonly: true,
        name,
        condition,
        value,
      },
      className: "rule",
    },
    buildPlaceholder({
      id: `${id + 1}`,
      position: { x: positionX + offset, y: positionY + (inputNode.height ?? 0) },
    }),
  ];
};

export interface UpdateFlowInputRules {
  rules: (string | null)[];
  rulesData: ConditionRuleType[];
}

export const updateFlowInputRules = (
  updatedRules: UpdateFlowInputRules, 
  updateNodeInternals?: (nodeId: string) => void,
) => {
  const clickedNode = useServiceStore.getState().clickedNode;

  if (!clickedNode) return;

  const nodePositionOffset = 28 * GRID_UNIT;

  const edges = useServiceStore.getState().edges;
  const nodes = useServiceStore.getState().nodes;

  // Find rules not included in updatedRules
  const oldRules = edges.filter((edge) => edge.source === clickedNode).map((edge) => edge.target);
  const nodesToRemove: string[] = nodes
    .filter((node) => oldRules.includes(node.id) && !updatedRules.rules.includes(node.id))
    .map((node) => node.id);
  // Find placeholders after rules to be removed
  edges
    .filter((edge) => nodesToRemove.includes(edge.source))
    .forEach((edge) => {
      const placeholder = nodes.find((node) => node.id === edge.target && node.type === "placeholder");
      if (placeholder) nodesToRemove.push(placeholder.id);
    });
  let newRules: string[] = [];
  let updatedNodes: Node[] = [];

  useServiceStore.getState().setNodes((prevNodes) => {
    // Remove deleted nodes and placeholders after them
    // Set client input node handle amount to match new rules
    const newNodes = prevNodes
      .filter((node) => !nodesToRemove.includes(node.id))
      .map((node) => {
        if (node.id !== clickedNode) return node;
        node.data.childrenCount = updatedRules.rules.length;
        return node;
      });
    updateNodeInternals?.(clickedNode);
    const inputNode = prevNodes.find((node) => node.id === clickedNode);
    if (!inputNode) return prevNodes;

    let offsetLeft = nodePositionOffset * Math.floor(newRules.length / 2);
    if (newRules.length % 2 === 0) offsetLeft -= nodePositionOffset / 2;
    const newPlaceholderId = Math.max(...nodes.map((node) => +node.id)) + 1;

    let placedRuleCount = -1;
    newRules = updatedRules.rules.map((rule, i) => {
      placedRuleCount++;
      const offset = -offsetLeft + placedRuleCount * nodePositionOffset;
      const ruleData = updatedRules.rulesData[i];
      if (rule === null) {
        // Create new rule node with placeholder
        const newRuleId = newPlaceholderId + i * 2;
        newNodes.push(
          ...buildRuleWithPlaceholder({
            id: newRuleId,
            label: `rule ${i + 1}`,
            offset,
            inputNode,
            name: ruleData?.name,
            condition: ruleData?.condition,
            value: ruleData?.value,
          })
        );
        return `${newRuleId}`;
      } else {
        // Move existing rule node with following node to keep them in order
        const ruleNode = newNodes.find((node) => node.id === rule);
        if (!ruleNode) return rule;
        ruleNode.data.label = `rule ${i + 1}`;
        ruleNode.position.x = inputNode.position.x + offset;
        ruleNode.data.name = ruleData?.name;
        ruleNode.data.condition = ruleData?.condition;
        ruleNode.data.value = ruleData?.value;

        const ruleEdge = edges.find((edge) => edge.source === rule);
        if (!ruleEdge) return rule;

        const ruleFollowingNode = newNodes.find((node) => node.id === ruleEdge.target);
        if (!ruleFollowingNode) return rule;

        ruleFollowingNode.position.x = inputNode.position.x + offset;
        return rule;
      }
    });
    updatedNodes = newNodes;
    return newNodes;
  });
  useServiceStore.getState().setEdges((prevEdges) => {
    const newEdges: Edge[] = prevEdges.filter(
      (edge) =>
        !newRules.includes(edge.target) &&
        !newRules.includes(edge.source) &&
        !nodesToRemove.includes(edge.source) &&
        !nodesToRemove.includes(edge.target)
    );
    // Add new edges to connect new rules and placeholders
    newRules.forEach((rule, i) => {
      if (rule === null) return;
      const oldEdgeAfterNewRule = prevEdges.find((edge) => edge.source === rule);
      const nodeAfterNewRule = updatedNodes.find((node) => node.id === oldEdgeAfterNewRule?.target);
      newEdges.push(
        ...buildRuleEdges({
          inputId: +clickedNode!,
          targetId: +rule,
          handleId: i,
          placeholderId: nodeAfterNewRule?.id,
        })
      );
    });
    return newEdges;
  });
};

const buildRuleEdges = ({
  inputId,
  targetId,
  handleId,
  placeholderId,
}: {
  inputId: number;
  targetId: number;
  handleId: number;
  placeholderId?: string;
}): Edge[] => {
  return [
    // input -> rule
    buildEdge({
      id: `edge-${inputId}-${targetId}`,
      source: `${inputId}`,
      sourceHandle: `handle-${inputId}-${handleId}`,
      target: `${targetId}`,
    }),
    // rule -> placeholder
    buildEdge({
      id: `edge-${targetId}-${placeholderId ?? targetId + 1}`,
      source: `${targetId}`,
      sourceHandle: `handle-${targetId}-0`,
      target: `${placeholderId ?? targetId + 1}`,
    }),
  ];
};

export const onNodeDrag = (_event: React.MouseEvent, draggedNode: Node) => {
  // Move the placeholder together with the node being moved
  const edges = useServiceStore.getState().edges;
  const nodes = useServiceStore.getState().nodes;

  const draggedEdges = edges.filter((edge) => edge.source === draggedNode.id);
  if (draggedEdges.length === 0) return;
  const placeholders = nodes.filter((node) => 
    draggedEdges.map((edge) => edge.target).includes(node.id) && node.type === "placeholder"
  );
  // only drag placeholders following the node
  if (placeholders.length === 0) return;

  useServiceStore.getState().setNodes((prevNodes) => 
    prevNodes.map((prevNode) => {
      if(placeholders.length === 2) {
        if(prevNode.id === placeholders[0].id) {
          prevNode.position.y = draggedNode.position.y + EDGE_LENGTH * 2;
          prevNode.position.x = draggedNode.position.x - (draggedNode.width ?? 0) * 0.75;          
        }
        if(prevNode.id === placeholders[1].id) {
          prevNode.position.y = draggedNode.position.y + EDGE_LENGTH * 2;
          prevNode.position.x = draggedNode.position.x + (draggedNode.width ?? 0) * 0.75;          
        }
      } else if(prevNode.id === placeholders[0].id) {
          prevNode.position.x = draggedNode.position.x;
          prevNode.position.y = EDGE_LENGTH + draggedNode.position.y + (draggedNode.height ?? 0);
      }
      return prevNode;
  }));
}

export const onDrop = (
  event: React.DragEvent<HTMLDivElement>,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  setDefaultMessages: (stepType: StepType) => any,
) => {
  // Dragging and dropping the element from the list on the left
  // onto the placeholder node adds it to the flow

  const reactFlowInstance = useServiceStore.getState().reactFlowInstance;

  event.preventDefault();
  // Find matching placeholder
  if (!reactFlowInstance || !reactFlowWrapper.current) return;

  const [label, type, originalDefinedNodeId] = [
    event.dataTransfer.getData("application/reactflow-label"),
    event.dataTransfer.getData("application/reactflow-type") as StepType,
    event.dataTransfer.getData("application/reactflow-originalDefinedNodeId"),
  ];
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const matchingPlaceholder = reactFlowInstance.getNodes().find((node) => {
    if (node.type !== "placeholder") return false;
    return (
      node.position.x <= position.x &&
      position.x <= node.position.x + node.width! &&
      node.position.y <= position.y &&
      position.y <= node.position.y + node.height!
    );
  });
  if (!matchingPlaceholder) return;
  const connectedNodeEdge = reactFlowInstance.getEdges().find((edge) => edge.target === matchingPlaceholder.id);
  if (!connectedNodeEdge) return;

  useServiceStore.getState().setNodes((prevNodes) => {
    const newNodeId = prevNodes.length > 2 ? `${Math.max(...useServiceStore.getState().nodes.map((node) => +node.id)) + 1}` : matchingPlaceholder.id;
    const newPlaceholderId = Math.max(...useServiceStore.getState().nodes.map((node) => +node.id)) + 2;

    useServiceStore.getState().setEdges((prevEdges) => {
      // Point edge from previous node to new node
      const newEdges = [...prevEdges];

      if (![StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type)) {
        // Point edge from matching placeholder to new node
        if (prevNodes.length > 2) {
          newEdges.push(
            buildEdge({
              id: `edge-${matchingPlaceholder.id}-${newNodeId + 1}`,
              source: matchingPlaceholder.id,
              sourceHandle: `handle-${matchingPlaceholder.id}-${newNodeId}`,
              target: newNodeId,
            })
          );
        }
        // Point edge from new node to new placeholder
        newEdges.push(
          buildEdge({
            id: `edge-${newNodeId}-${newPlaceholderId + 1}`,
            source: newNodeId,
            sourceHandle: `handle-${newNodeId}-0`,
            target: `${newPlaceholderId + 1}`,
          })
        );
      }

      if(StepType.Input === type || StepType.Condition === type) {
        newEdges.push(
          buildEdge({
            id: `edge-${newNodeId}-${newPlaceholderId + 2}`,
            source: newNodeId,
            sourceHandle: `handle-${newNodeId}-1`,
            target: `${newPlaceholderId + 2}`,
          })
        );
      }

      return newEdges;
    });

    const nodeLabel = getNodeLabel(type, prevNodes, label);

    const matchingPlaceholderIndex = prevNodes.findIndex((node) => node.id === matchingPlaceholder.id);

    // Add new node in place of old placeholder
    const newNodes = [
      ...prevNodes.slice(0, matchingPlaceholderIndex + 1),
      {
        id: `${newNodeId}`,
        position: prevNodes.length > 2 ? {
          y: matchingPlaceholder.position.y + EDGE_LENGTH,
          x: matchingPlaceholder.position.x,
        } : matchingPlaceholder.position,
        type: "customNode",
        data: {
          label: nodeLabel,
          onDelete: useServiceStore.getState().onDelete,
          onEdit: useServiceStore.getState().handleNodeEdit,
          type: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type) ? "finishing-step" : "step",
          stepType: type,
          clientInputId: type === StepType.Input ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
          conditionId: type === StepType.Condition ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
          assignId: type === StepType.Assign ? parseInt(nodeLabel.split("-")[1].trim()) : undefined,
          readonly: [
            StepType.Auth,
            StepType.FinishingStepEnd,
            StepType.FinishingStepRedirect,
            StepType.UserDefined,
          ].includes(type),
          childrenCount: type === StepType.Input || type === StepType.Condition ? 2 : 1,
          setClickedNode: useServiceStore.getState().setClickedNode,
          message: setDefaultMessages(type),
          originalDefinedNodeId: type === StepType.UserDefined ? originalDefinedNodeId : undefined,
        },
        className: [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type)
          ? "finishing-step"
          : "step",
      },
      ...prevNodes.slice(matchingPlaceholderIndex + 1),
    ];

    if (![StepType.Input, StepType.Condition, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type)) {
      // Add placeholder right below new node
      newNodes.push(
        buildPlaceholder({
          id: `${newPlaceholderId + 1}`,
          matchingPlaceholder,
        })
      );
    }

    if(StepType.Input === type || StepType.Condition === type) {
      newNodes.push(
        buildPlaceholder({
          id: `${newPlaceholderId + 1}`,
          label: 'serviceFlow.placeholderNodeSuccess',
          position: {
            y: matchingPlaceholder.position.y + EDGE_LENGTH,
            x: matchingPlaceholder.position.x - (matchingPlaceholder.width ?? 0) * 0.75,
          },
        })
      );

      newNodes.push(
        buildPlaceholder({
          id: `${newPlaceholderId + 2}`,
          label: 'serviceFlow.placeholderNodeFailure',
          position: {
            y: matchingPlaceholder.position.y + EDGE_LENGTH,
            x: matchingPlaceholder.position.x + (matchingPlaceholder.width ?? 0) * 0.75,
          },
        })
      );
    }

    return newNodes;
  });
  
  useServiceStore.getState().disableTestButton();
};

export const onFlowNodeDragStop = (
  event: any,
  draggedNode: Node,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  startDragNode: React.MutableRefObject<Node | undefined>,
) => {
  // Dragging existing node onto placeholder

  const reactFlowInstance = useServiceStore.getState().reactFlowInstance;

  if (!reactFlowInstance || !reactFlowWrapper.current) return;
  // Check if node was dropped on a placeholder
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  if (reactFlowInstance.getIntersectingNodes(draggedNode).length > 0) {
    if (startDragNode.current != undefined) {
      useServiceStore.getState().setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id !== draggedNode.id) return node;
          node.position.x = startDragNode.current?.position.x ?? 0;
          node.position.y = startDragNode.current?.position.y ?? 0;
          return node;
        })
      );
    }
  }

  const matchingPlaceholder = reactFlowInstance.getNodes().find((node) => {
    if (node.type !== "placeholder") return false;
    return (
      node.position.x <= position.x &&
      position.x <= node.position.x + node.width! &&
      node.position.y <= position.y &&
      position.y <= node.position.y + node.height!
    );
  });
  if (!matchingPlaceholder) return;

  // If an existing edge is already pointing to node, then it cannot be attached
  const edgeToNode = useServiceStore.getState().edges.find((edge) => edge.target === draggedNode.id);
  if (edgeToNode) return;

  // Delete matching placeholder and set node's position to match
  useServiceStore.getState().setNodes((prevNodes) =>
    prevNodes
      .filter((node) => node.id !== matchingPlaceholder.id)
      .map((node) => {
        if (node.id !== draggedNode.id) return node;
        node.position.x = matchingPlaceholder.position.x;
        node.position.y = matchingPlaceholder.position.y;
        return node;
      })
  );
  // Remove old edge and create a new one pointing to draggedNode
  useServiceStore.getState().setEdges((prevEdges) => {
    const toRemove = prevEdges.find((edge) => edge.target === matchingPlaceholder.id);
    if (!toRemove) return prevEdges;
    return [
      ...prevEdges.filter((edge) => edge !== toRemove),
      buildEdge({
        id: `edge-${toRemove.source}-${draggedNode.id}`,
        source: toRemove.source,
        sourceHandle: `handle-${toRemove.source}-1`,
        target: draggedNode.id,
      }),
    ];
  });
  startDragNode.current = undefined;
}
function getNodeLabel(type: StepType, nodes: Node[], label: string) {
  const prevNodes = nodes.filter((node) => node.data.stepType === type);
  const lastNode = prevNodes[prevNodes.length - 1]?.data;
  switch (type) {
    case StepType.Input:
      return `${label} - ${(lastNode?.clientInputId ?? 0) + 1}`;
    case StepType.Condition:
      return `${label} - ${(lastNode?.conditionId ?? 0) + 1}`;
    case StepType.Assign:
      return `${label} - ${(lastNode?.assignId ?? 0) + 1}`;
    default:
      return label;
  }
}

