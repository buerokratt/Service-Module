import { FC, useCallback, useRef, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  MarkerType,
  Node,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
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

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: {
      x: 14 * GRID_UNIT,
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
  {
    id: "2",
    type: "placeholder",
    position: {
      x: -4 * GRID_UNIT,
      y: 8 * GRID_UNIT,
    },
    data: {
      type: "placeholder",
    },
    className: "placeholder",
    selectable: false,
    draggable: false,
  },
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
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      type: "smoothstep",
      id: "edge-1-2",
      source: "1",
      target: "2",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
  ]);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const edge = edges.find((edge) => edge.source === draggedNode.id);
      if (!edge) return;
      const placeholder = nodes.find((node) => node.id === edge.target);
      if (!placeholder || placeholder.type !== "placeholder") return;
      setNodes((prevNodes) =>
        prevNodes.map((prevNode) => {
          if (prevNode.id !== placeholder.id) return prevNode;
          prevNode.position.x = draggedNode.position.x;
          prevNode.position.y = 2 * GRID_UNIT + draggedNode.position.y + 72;
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

      const connectedNodeId = reactFlowInstance
        .getEdges()
        .find((edge) => edge.target === matchingPlaceholder.id)?.source;
      if (!connectedNodeId) return;

      setNodes((prevNodes) => {
        setEdges((prevEdges) => [
          ...prevEdges.filter((edge) => edge.target !== matchingPlaceholder.id),
          {
            id: `edge-${prevEdges.length}`,
            source: connectedNodeId,
            target: String(prevNodes.length),
            type: "smoothstep",

            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          {
            id: `edge-${prevEdges.length + 1}`,
            source: String(prevNodes.length),
            target: String(prevNodes.length + 1),
            type: "smoothstep",

            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
        ]);

        return [
          ...prevNodes.filter((node) => node.id !== matchingPlaceholder.id),
          {
            id: String(prevNodes.length),
            position: matchingPlaceholder.position,
            type: "customNode",
            data: {
              label,
              onDelete: handleNodeDelete,
              setPopupVisible,
              type: type === "finishing-step" ? "finishing-step" : "step",
            },
            className: type === "finishing-step" ? "finishing-step" : "step",
          },
          {
            id: String(prevNodes.length + 1),
            type: "placeholder",
            position: {
              x: matchingPlaceholder.position.x,
              y: 2 * GRID_UNIT + matchingPlaceholder.position.y + 72,
            },
            data: {
              type: "placeholder",
            },
            className: "placeholder",
            selectable: false,
            draggable: false,
          },
        ];
      });
    },
    [reactFlowInstance, nodes, edges]
  );

  const handleNodeDelete = (id: string) => {
    setNodes((prevNodes) => {
      const deleteIndex = prevNodes.findIndex((n) => n.id === id);
      return prevNodes.slice(0, deleteIndex);
    });
  };

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
