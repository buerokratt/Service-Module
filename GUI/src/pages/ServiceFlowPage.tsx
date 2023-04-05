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

import {
  Box,
  Button,
  Collapsible,
  NewServiceHeader,
  Track,
} from "../components";
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
    { id: 8, label: "End conversation", type: "finishing-step" },
    { id: 9, label: "Direct to Customer Support", type: "finishing-step" },
  ];

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const buildPlaceholder = ({
    id,
    alignment,
    matchingPlaceholder,
    position,
  }: {
    id: string;
    alignment: "left" | "center" | "right";
    matchingPlaceholder?: Node;
    position?: XYPosition;
  }): Node => {
    if (!matchingPlaceholder && !position)
      throw Error("Either matchingPlaceholder or position have to be defined.");

    let positionX = position ? position.x : matchingPlaceholder!.position.x;
    let positionY = position ? position.y : matchingPlaceholder!.position.y;
    if (alignment === "left") positionX -= 330;
    if (alignment === "right") positionX += 330;

    return {
      id,
      type: "placeholder",
      position: {
        x: positionX,
        y: 3 * GRID_UNIT + positionY + 72,
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
    alignment,
    matchingPlaceholder,
    label,
  }: {
    id: number;
    alignment: "left" | "center" | "right";
    matchingPlaceholder: Node;
    label: string;
  }): Node[] => {
    let positionX = matchingPlaceholder.position.x;
    const positionY = 3 * GRID_UNIT + matchingPlaceholder.position.y + 72;
    if (alignment === "left") positionX -= 330;
    if (alignment === "right") positionX += 330;

    return [
      {
        id: `${id}`,
        position: {
          x: positionX,
          y: positionY,
        },
        type: "customNode",
        data: {
          label,
          onDelete,
          setPopupVisible,
          type: "rule",
          stepType: "rule",
        },
        className: "rule",
      },
      buildPlaceholder({
        id: `${id + 1}`,
        position: { x: positionX, y: positionY },
        alignment: "center",
      }),
    ];
  };

  const buildRulesEdges = ({
    inputId,
    placeholderId,
  }: {
    inputId: number;
    placeholderId: number;
  }) => {
    return [
      // input -> left rule
      buildEdge({
        id: `edge-${inputId}-${placeholderId}`,
        source: `${inputId}`,
        sourceHandle: `handle-${inputId}-1`,
        target: `${placeholderId}`,
      }),
      // input -> right rule
      buildEdge({
        id: `edge-${inputId}-${placeholderId + 2}`,
        source: `${inputId}`,
        sourceHandle: `handle-${inputId}-2`,
        target: `${placeholderId + 2}`,
      }),
      // left rule -> left placeholder
      buildEdge({
        id: `edge-${placeholderId}-${placeholderId + 1}`,
        source: `${placeholderId}`,
        sourceHandle: `handle-${placeholderId}-1`,
        target: `${placeholderId + 1}`,
      }),
      // right rule -> right placeholder
      buildEdge({
        id: `edge-${placeholderId + 2}-${placeholderId + 3}`,
        source: `${placeholderId + 2}`,
        sourceHandle: `handle-${placeholderId + 2}-1`,
        target: `${placeholderId + 3}`,
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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
    console.log(nodes);
    console.log(edges);
  };

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const draggedEdges = edges.filter(
        (edge) => edge.source === draggedNode.id
      );
      if (draggedEdges.length === 0) return;
      const placeholders = nodes.filter(
        (node) =>
          draggedEdges.map((edge) => edge.target).includes(node.id) &&
          node.type === "placeholder"
      );
      if (placeholders.length === 0) return;

      setNodes((prevNodes) =>
        prevNodes.map((prevNode) => {
          placeholders.forEach((placeholder) => {
            if (prevNode.id !== placeholder.id) return;
            prevNode.position.x = draggedNode.position.x;
            prevNode.position.y = 3 * GRID_UNIT + draggedNode.position.y + 72;
          });
          return prevNode;
        })
      );
    },
    [edges, nodes]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
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
      const connectedNodeEdge = reactFlowInstance
        .getEdges()
        .find((edge) => edge.target === matchingPlaceholder.id);
      if (!connectedNodeEdge) return;

      setNodes((prevNodes) => {
        const newNodeId = matchingPlaceholder.id;
        const newPlaceholderId = +nodes[nodes.length - 1].id + 1;
        setEdges((prevEdges) => {
          const newEdges = [
            ...prevEdges.filter(
              (edge) => edge.target !== matchingPlaceholder.id
            ),
            buildEdge({
              id: connectedNodeEdge.id!,
              source: connectedNodeEdge.source,
              sourceHandle: connectedNodeEdge.sourceHandle,
              target: newNodeId,
            }),
          ];

          if (type !== "input") {
            newEdges.push(
              buildEdge({
                id: `edge-${newNodeId}-${newPlaceholderId + 1}`,
                source: newNodeId,
                sourceHandle: `handle-${newNodeId}-1`,
                target: `${newPlaceholderId + 1}`,
              })
            );
          }
          if (type === "input") {
            newEdges.push(
              ...buildRulesEdges({
                inputId: +newNodeId,
                placeholderId: newPlaceholderId,
              })
            );
          }
          return newEdges;
        });

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
              type: type === "finishing-step" ? "finishing-step" : "step",
              stepType: type,
            },
            className: type === "finishing-step" ? "finishing-step" : "step",
          },
        ];

        if (type !== "input") {
          newNodes.push(
            buildPlaceholder({
              id: `${newPlaceholderId + 1}`,
              alignment: type === "input" ? "left" : "center",
              matchingPlaceholder,
            })
          );
        }

        if (type === "input") {
          newNodes.push(
            ...buildRuleWithPlaceholder({
              id: newPlaceholderId,
              label: "rule 1",
              alignment: "left",
              matchingPlaceholder,
            }),
            ...buildRuleWithPlaceholder({
              id: newPlaceholderId + 2,
              label: "rule 2",
              alignment: "right",
              matchingPlaceholder,
            })
          );
        }
        return newNodes;
      });
    },
    [reactFlowInstance, nodes, edges]
  );

  const onDelete = useCallback(
    (id: string) => {
      if (!reactFlowInstance) return;
      const deletedNode = reactFlowInstance
        .getNodes()
        .find((node) => node.id === id);
      if (!deletedNode) return;
      let edgesToBeRemoved: Edge[] = [];

      setEdges((prevEdges) => {
        edgesToBeRemoved = prevEdges.filter(
          (edge) => edge.target === id || edge.source === id
        );
        if (edgesToBeRemoved.length < 2) return prevEdges;
        const newEdges = [
          ...prevEdges.filter((edge) => !edgesToBeRemoved.includes(edge)),
        ];
        if (deletedNode.data.stepType !== "input" && newEdges.length > 0) {
          newEdges.push(
            buildEdge({
              id: `edge-${edgesToBeRemoved[0].source}-${edgesToBeRemoved[1].target}`,
              source: edgesToBeRemoved[0].source,
              sourceHandle: edgesToBeRemoved[0].sourceHandle,
              target: edgesToBeRemoved[1].target,
            })
          );
        }
        if (newEdges.length === 0) newEdges.push(initialEdge);

        return newEdges;
      });
      setNodes((prevNodes) => {
        const newNodes = [
          ...prevNodes.filter(
            (node) =>
              node.id !== id &&
              !(
                edgesToBeRemoved.map((edge) => edge.target).includes(node.id) &&
                node.type === "placeholder"
              )
          ),
        ];
        if (newNodes.length === 1) newNodes.push(initialPlaceholder);

        return newNodes;
      });
    },
    [reactFlowInstance, nodes]
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
              <Button
                appearance="secondary"
                onClick={() => setPopupVisible(false)}
              >
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
                      color={step.type === "finishing-step" ? "red" : "blue"}
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
                      color={step.type === "finishing-step" ? "red" : "blue"}
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
              onNodeMouseEnter={(_, node) => {
                setNodes((prevNodes) =>
                  prevNodes.map((prevNode) => {
                    if (
                      prevNode.type === "customNode" &&
                      prevNode.data === node.data
                    ) {
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
                    if (
                      prevNode.type === "customNode" &&
                      prevNode.data === node.data
                    ) {
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
