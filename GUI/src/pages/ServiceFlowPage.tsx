import { FC, useCallback, useRef, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Edge,
  MarkerType,
  Node,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";

import { Box, Button, Collapsible, NewServiceHeader, Track } from "../components";
import CustomNode from "../components/Steps/CustomNode";
import "./ServiceFlowPage.scss";
import { Step } from "../types/step";
import Popup from "../components/Popup";
import PlaceholderNode from "../components/Steps/PlaceholderNode";

const GRID_UNIT = 16;

const nodeTypes = {
  customNode: CustomNode,
  placeholder: PlaceholderNode,
};

const initialPlaceholder = {
  id: "2",
  type: "placeholder",
  position: {
    x: 3 * GRID_UNIT,
    y: 8 * GRID_UNIT,
  },
  data: {
    type: "placeholder",
  },
  className: "placeholder",
  selectable: false,
  draggable: false,
};

const initialEdge = {
  type: "smoothstep",
  id: "edge-1-2",
  source: "1",
  target: "2",
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: {
      x: 13.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {
      label: <MdPlayCircleFilled />,
      type: "input",
    },
    className: "start",
    selectable: false,
    draggable: false,
  },
  initialPlaceholder,
];

const ServiceFlowPage: FC = () => {
  const setupElements: Step[] = [
    { id: 1, label: "TARA auth", type: "auth" },
    { id: 3, label: "Client input", type: "input" },
  ];
  const allElements: Step[] = [
    { id: 1, label: "TARA auth", type: "auth" },
    { id: 2, label: "Textfield", type: "textfield" },
    { id: 3, label: "Client input", type: "input" },
    { id: 4, label: "Rule definition", type: "rule-definition" },
    { id: 5, label: "Open webpage", type: "open-webpage" },
    { id: 6, label: "File generate", type: "file-generate" },
    { id: 7, label: "File sign", type: "file-sign" },
    { id: 8, label: "End conversation", type: "finishing-step-end" },
    {
      id: 9,
      label: "Direct to Customer Support",
      type: "finishing-step-redirect",
    },
  ];

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const nodePositionOffset = 420;

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

    let positionX = position ? position.x : matchingPlaceholder!.position.x;
    let positionY = position ? position.y : matchingPlaceholder!.position.y;

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
    label,
  }: {
    id: number;
    offset: number;
    matchingPlaceholder: Node;
    label: string;
  }): Node[] => {
    let positionX = matchingPlaceholder.position.x;
    const positionY = 7 * GRID_UNIT + matchingPlaceholder.position.y;

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

  const buildRulesEdges = ({
    inputId,
    initialTargetId,
    count,
  }: {
    inputId: number;
    initialTargetId: number;
    count: number;
  }) => {
    const rulesEdges = [];
    for (let i = 0; i < count; i++) {
      const targetId = initialTargetId + (i * 2);
      rulesEdges.push(
        // input -> rule
        buildEdge({
          id: `edge-${inputId}-${targetId}`,
          source: `${inputId}`,
          sourceHandle: `handle-${inputId}-${i}`,
          target: `${targetId}`,
        }),
        // rule -> placeholder
        buildEdge({
          id: `edge-${targetId}-${targetId + 1}`,
          source: `${targetId}`,
          sourceHandle: `handle-${targetId}-${i}`,
          target: `${targetId + 1}`,
        })
      );
    }
    return rulesEdges;
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

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
    console.log(nodes);
    console.log(edges);
  };

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const draggedEdges = edges.filter((edge) => edge.source === draggedNode.id);
      if (draggedEdges.length === 0) return;
      const placeholders = nodes.filter(
        (node) => draggedEdges.map((edge) => edge.target).includes(node.id) && node.type === "placeholder"
      );
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
    [reactFlowInstance]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

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
          // Point edge from placeholder to new node
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
            newEdges.push(
              ...buildRulesEdges({
                inputId: +newNodeId,
                initialTargetId: newPlaceholderId,
                count: inputRuleCount,
              })
            );
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
              childrenCount: type === 'input' ? inputRuleCount : 1,
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
          // Add 2 rules below input node and placeholders under each
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
    (id: string) => {
      if (!reactFlowInstance) return;
      const deletedNode = reactFlowInstance.getNodes().find((node) => node.id === id);
      const edgeToDeletedNode = reactFlowInstance.getEdges().find((edge) => edge.target === id);
      if (!deletedNode) return;
      let updatedNodes: Node[] = [];

      setNodes((prevNodes) => {
        let newNodes: Node[] = [];
        const currentEdges = reactFlowInstance.getEdges();

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
        if (deletedNode.data.stepType !== "input" && newEdges.length > 0 && toRemove.length > 1) {
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

      if (!edgeToDeletedNode) return;
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
    [reactFlowInstance]
  );

  return (
    <>
      <NewServiceHeader activeStep={3} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      {isPopupVisible && (
        <Popup
          style={{ maxWidth: 700 }}
          title={"Hello"}
          onClose={() => setPopupVisible(false)}
          footer={
            <Track gap={16}>
              <Button appearance="secondary" onClick={() => setPopupVisible(false)}>
                Discard
              </Button>
              <Button onClick={() => setPopupVisible(false)}>Save</Button>
            </Track>
          }
        >
          <p>hello</p>
        </Popup>
      )}
      <div className="graph">
        <div className="graph__controls">
          <Track direction="vertical" gap={16} align="stretch">
            {setupElements && (
              <Collapsible title="Setup elements">
                <Track direction="vertical" align="stretch" gap={4}>
                  {setupElements.map((step) => (
                    <Box
                      key={step.id}
                      color={["finishing-step-end", "finishing-step-redirect"].includes(step.type) ? "red" : "blue"}
                      onDragStart={(event) => onDragStart(event, step)}
                      draggable
                    >
                      {step.label}
                    </Box>
                  ))}
                </Track>
              </Collapsible>
            )}

            {allElements && (
              <Collapsible title="All elements">
                <Track direction="vertical" align="stretch" gap={4}>
                  {allElements.map((step) => (
                    <Box
                      key={step.id}
                      color={["finishing-step-end", "finishing-step-redirect"].includes(step.type) ? "red" : "blue"}
                      onDragStart={(event) => onDragStart(event, step)}
                      draggable
                    >
                      {step.label}
                    </Box>
                  ))}
                </Track>
              </Collapsible>
            )}
          </Track>
        </div>
        <ReactFlowProvider>
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
        </ReactFlowProvider>
      </div>
    </>
  );
};

export default ServiceFlowPage;
