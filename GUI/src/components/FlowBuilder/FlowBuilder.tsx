import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Edge,
  MarkerType,
  Node,
  ReactFlowInstance,
  useUpdateNodeInternals,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../Steps/CustomNode";
import PlaceholderNode from "../Steps/PlaceholderNode";

export const GRID_UNIT = 16;

const nodeTypes = {
  customNode: CustomNode,
  placeholder: PlaceholderNode,
};

type FlowBuilderProps = {
  setPopupVisible: Dispatch<SetStateAction<boolean>>;
  updatedRules: (string | null)[];
  nodes: Node[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  onNodesChange: any;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onEdgesChange: any;
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  setPopupVisible,
  updatedRules,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const [clickedNode, setClickedNode] = useState();
  const nodePositionOffset = 28 * GRID_UNIT;
  const updateNodeInternals = useUpdateNodeInternals();

  const buildPlaceholder = ({
    id,
    matchingPlaceholder,
    position,
  }: {
    id: string;
    matchingPlaceholder?: Node;
    position?: XYPosition;
  }): Node => {
    if (!matchingPlaceholder && !position) throw Error("Either matchingPlaceholder or position have to be defined.");

    const positionX = position ? position.x : matchingPlaceholder!.position.x;
    const positionY = position ? position.y : matchingPlaceholder!.position.y;

    return {
      id,
      type: "placeholder",
      position: {
        x: positionX,
        y: 7 * GRID_UNIT + positionY,
      },
      data: {
        type: "placeholder",
      },
      className: "placeholder",
      selectable: false,
      draggable: false,
    };
  };

  const buildRuleWithPlaceholder = ({
    id,
    offset,
    matchingPlaceholder,
    position,
    label,
  }: {
    id: number;
    offset: number;
    matchingPlaceholder?: Node;
    position?: XYPosition;
    label: string;
  }): Node[] => {
    if (!matchingPlaceholder && !position) throw Error("Either matchingPlaceholder or position have to be defined.");

    const positionX = position ? position.x : matchingPlaceholder!.position.x;
    const positionY = 7 * GRID_UNIT + (position ? position.y : matchingPlaceholder!.position.y);

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
          onDelete,
          setPopupVisible,
          type: "rule",
          stepType: "rule",
          readonly: true,
        },
        className: "rule",
      },
      buildPlaceholder({
        id: `${id + 1}`,
        position: { x: positionX + offset, y: positionY },
      }),
    ];
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

  const buildEdge = ({
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

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Move the placeholder together with the node being moved
  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const draggedEdges = edges.filter((edge) => edge.source === draggedNode.id);
      if (draggedEdges.length === 0) return;
      const placeholders = nodes.filter(
        (node) => draggedEdges.map((edge) => edge.target).includes(node.id) && node.type === "placeholder"
      );
      // only drag placeholders following the node
      if (placeholders.length === 0) return;

      setNodes((prevNodes) =>
        prevNodes.map((prevNode) => {
          placeholders.forEach((placeholder) => {
            if (prevNode.id !== placeholder.id) return;
            prevNode.position.x = draggedNode.position.x;
            prevNode.position.y = 7 * GRID_UNIT + draggedNode.position.y;
          });
          return prevNode;
        })
      );
    },
    [edges, nodes]
  );

  // Dragging existing node onto placeholder
  const onNodeDragStop = useCallback(
    (event: any, draggedNode: Node) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      // Check if node was dropped on a placeholder
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
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

      // If an existing edge is already pointing to node, then it cannot be attached
      const edgeToNode = edges.find((edge) => edge.target === draggedNode.id);
      if (edgeToNode) return;

      // Delete matching placeholder and set node's position to match
      setNodes((prevNodes) =>
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
      setEdges((prevEdges) => {
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
    },
    [reactFlowInstance, edges]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Dragging and dropping the element from the list on the left
  // onto the placeholder node adds it to the flow
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      // Find matching placeholder
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const [label, type] = [
        event.dataTransfer.getData("application/reactflow-label"),
        event.dataTransfer.getData("application/reactflow-type"),
      ];
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const inputRuleCount = 2;

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

      setNodes((prevNodes) => {
        const newNodeId = matchingPlaceholder.id;
        const newPlaceholderId = Math.max(...nodes.map((node) => +node.id)) + 1;
        setEdges((prevEdges) => {
          // Point edge from previous node to new node
          const newEdges = [
            ...prevEdges.filter((edge) => edge.target !== matchingPlaceholder.id),
            buildEdge({
              id: connectedNodeEdge.id!,
              source: connectedNodeEdge.source,
              sourceHandle: connectedNodeEdge.sourceHandle,
              target: newNodeId,
            }),
          ];

          if (!["input", "finishing-step-end", "finishing-step-redirect"].includes(type)) {
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
          if (type === "input") {
            // Create edges from input node to rules and from rules to placeholders
            for (let i = 0; i < inputRuleCount; i++) {
              newEdges.push(
                ...buildRuleEdges({
                  inputId: +newNodeId,
                  targetId: newPlaceholderId + i * 2,
                  handleId: i,
                })
              );
            }
          }
          return newEdges;
        });

        // Add new node in place of old placeholder
        const newNodes = [
          ...prevNodes.filter((node) => node.id !== matchingPlaceholder.id),
          {
            id: `${newNodeId}`,
            position: matchingPlaceholder.position,
            type: "customNode",
            data: {
              label,
              onDelete,
              setPopupVisible,
              type: ["finishing-step-end", "finishing-step-redirect"].includes(type) ? "finishing-step" : "step",
              stepType: type,
              readonly: type === "finishing-step-end",
              childrenCount: type === "input" ? inputRuleCount : 1,
              setClickedNode,
              update: updateInputRules,
            },
            className: ["finishing-step-end", "finishing-step-redirect"].includes(type) ? "finishing-step" : "step",
          },
        ];

        if (!["input", "finishing-step-end", "finishing-step-redirect"].includes(type)) {
          // Add placeholder right below new node
          newNodes.push(
            buildPlaceholder({
              id: `${newPlaceholderId + 1}`,
              matchingPlaceholder,
            })
          );
        }

        if (type === "input") {
          // Add rules below input node and placeholders under each
          let offsetLeft = nodePositionOffset * Math.floor(inputRuleCount / 2);
          if (inputRuleCount % 2 === 0) offsetLeft -= nodePositionOffset / 2;
          for (let i = 0; i < inputRuleCount; i++) {
            newNodes.push(
              ...buildRuleWithPlaceholder({
                id: newPlaceholderId + i * 2,
                label: `rule ${i}`,
                offset: -offsetLeft + i * nodePositionOffset,
                matchingPlaceholder,
              })
            );
          }
        }
        return newNodes;
      });
    },
    [reactFlowInstance, nodes, edges]
  );

  const onDelete = useCallback(
    (id: string, shouldAddPlaceholder: boolean) => {
      if (!reactFlowInstance) return;
      const deletedNode = reactFlowInstance.getNodes().find((node) => node.id === id);
      const edgeToDeletedNode = reactFlowInstance.getEdges().find((edge) => edge.target === id);
      if (!deletedNode) return;
      let updatedNodes: Node[] = [];
      let currentEdges: Edge[] = [];
      setEdges((prevEdges) => (currentEdges = prevEdges));
      setNodes((prevNodes) => {
        let newNodes: Node[] = [];

        if (deletedNode.data.stepType !== "input") {
          // delete only targeted node
          newNodes.push(...prevNodes.filter((node) => node.id !== id));
        } else {
          // delete input node with it's rules
          const deletedRules = currentEdges.filter((edge) => edge.source === id).map((edge) => edge.target);

          newNodes.push(...prevNodes.filter((node) => node.id !== id && !deletedRules.includes(node.id)));
        }

        // cleanup leftover placeholders
        newNodes = newNodes.filter((node) => {
          if (node.type !== "placeholder") return true;

          const pointingEdge = currentEdges.find((edge) => edge.target === node.id);
          const pointingEdgeSource = newNodes.find((newNode) => newNode.id === pointingEdge?.source);
          if (!pointingEdgeSource) return false;
          return true;
        });

        updatedNodes = newNodes;
        return newNodes;
      });

      setEdges((prevEdges) => {
        const toRemove = prevEdges.filter((edge) => {
          if (deletedNode.data.stepType !== "input") {
            // remove edges pointing to/from removed node
            return edge.target === id || edge.source === id;
          } else {
            // remove edges not pointing to present nodes
            return !updatedNodes.map((node) => node.id).includes(edge.target);
          }
        });

        if (toRemove.length === 0) return prevEdges;
        let newEdges = [...prevEdges.filter((edge) => !toRemove.includes(edge))];
        if (
          deletedNode.data.stepType !== "input" &&
          newEdges.length > 0 &&
          toRemove.length > 1 &&
          shouldAddPlaceholder
        ) {
          // if only 1 node was removed, point edge to whatever it was pointing to
          newEdges.push(
            buildEdge({
              id: `edge-${toRemove[0].source}-${toRemove[toRemove.length - 1].target}`,
              source: toRemove[0].source,
              sourceHandle: toRemove[0].sourceHandle,
              target: toRemove[toRemove.length - 1].target,
            })
          );
        }

        // cleanup possible leftover edges
        newEdges = newEdges.filter(
          (edge) =>
            updatedNodes.find((node) => node.id === edge.source) && updatedNodes.find((node) => node.id === edge.target)
        );

        return newEdges;
      });

      if (!edgeToDeletedNode || !shouldAddPlaceholder) return;
      setEdges((prevEdges) => {
        // check if previous node points to anything
        if (prevEdges.find((edge) => edge.source === edgeToDeletedNode.source)) {
          return prevEdges;
        }

        // Previous node points to nothing -> add placeholder with edge
        setNodes((prevNodes) => {
          const sourceNode = prevNodes.find((node) => node.id === edgeToDeletedNode.source);
          if (!sourceNode) return prevNodes;
          const placeholder = buildPlaceholder({
            id: deletedNode.id,
            position: {
              y: sourceNode.position.y,
              x: sourceNode.type === "input" ? sourceNode.position.x - 10.5 * GRID_UNIT : sourceNode.position.x,
            },
          });
          return [...prevNodes, placeholder];
        });

        prevEdges.push(
          buildEdge({
            id: `edge-${edgeToDeletedNode.source}-${deletedNode.id}`,
            source: edgeToDeletedNode.source,
            sourceHandle: `handle-${edgeToDeletedNode.source}-1`,
            target: deletedNode.id,
          })
        );
        return prevEdges;
      });
    },
    [reactFlowInstance, nodes, edges]
  );

  useEffect(() => {
    if (updatedRules.length === 0) return;
    updateInputRules(updatedRules);
  }, [updatedRules]);

  const updateInputRules = useCallback(
    (updatedRules: (string | null)[]) => {
      if (!clickedNode) return;
      // Find rules not included in updatedRules
      const oldRules = edges.filter((edge) => edge.source === clickedNode).map((edge) => edge.target);
      const nodesToRemove: string[] = nodes
        .filter((node) => oldRules.includes(node.id) && !updatedRules.includes(node.id))
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

      setNodes((prevNodes) => {
        // Remove deleted nodes and placeholders after them
        // Set client input node handle amount to match new rules
        const newNodes = prevNodes
          .filter((node) => !nodesToRemove.includes(node.id))
          .map((node) => {
            if (node.id !== clickedNode) return node;
            node.data.childrenCount = updatedRules.length;
            return node;
          });
        updateNodeInternals(clickedNode);
        const inputNode = prevNodes.find((node) => node.id === clickedNode);
        let offsetLeft = nodePositionOffset * Math.floor(newRules.length / 2);
        if (newRules.length % 2 === 0) offsetLeft -= nodePositionOffset / 2;
        const newPlaceholderId = Math.max(...nodes.map((node) => +node.id)) + 1;

        let placedRuleCount = -1;
        newRules = updatedRules.map((rule, i) => {
          placedRuleCount++;
          const offset = -offsetLeft + placedRuleCount * nodePositionOffset;
          if (rule === null) {
            // Create new rule node with placeholder
            const newRuleId = newPlaceholderId + i * 2;
            newNodes.push(
              ...buildRuleWithPlaceholder({
                id: newRuleId,
                label: `rule ${i}`,
                offset: offset,
                position: {
                  x: inputNode!.position.x,
                  y: inputNode!.position.y,
                },
              })
            );
            return `${newRuleId}`;
          } else {
            // Move existing rule node with following node to keep them in order
            const ruleNode = newNodes.find((node) => node.id === rule);
            if (!ruleNode) return rule;
            ruleNode.data.label = `rule ${i}`;
            ruleNode.position.x = inputNode!.position.x + offset;

            const ruleEdge = edges.find((edge) => edge.source === rule);
            if (!ruleEdge) return rule;

            const ruleFollowingNode = newNodes.find((node) => node.id === ruleEdge.target);
            if (!ruleFollowingNode) return rule;

            ruleFollowingNode.position.x = inputNode!.position.x + offset;
            return rule;
          }
        });
        updatedNodes = newNodes;
        return newNodes;
      });
      setEdges((prevEdges) => {
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
              targetId: +rule!,
              handleId: i,
              placeholderId: nodeAfterNewRule?.id,
            })
          );
        });
        return newEdges;
      });
    },
    [edges, nodes]
  );

  return (
    <div className="graph__body" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        snapToGrid
        snapGrid={[GRID_UNIT, GRID_UNIT]}
        defaultViewport={{ x: 38 * GRID_UNIT, y: 3 * GRID_UNIT, zoom: 0 }}
        minZoom={1}
        maxZoom={1}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeMouseEnter={(_, node) => {
          setNodes((prevNodes) =>
            prevNodes.map((prevNode) => {
              if (prevNode.type === "customNode" && prevNode.data === node.data) {
                prevNode.selected = true;
                prevNode.className = "selected";
              }
              return prevNode;
            })
          );
        }}
        onNodeMouseLeave={(_, node) => {
          setNodes((prevNodes) =>
            prevNodes.map((prevNode) => {
              if (prevNode.type === "customNode" && prevNode.data === node.data) {
                prevNode.selected = false;
                prevNode.className = prevNode.data.type;
              }
              return prevNode;
            })
          );
        }}
      >
        <Background color="#D2D3D8" gap={16} lineWidth={2} />
      </ReactFlow>
    </div>
  );
};

export default FlowBuilder;
