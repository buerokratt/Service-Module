import { FC, useCallback, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  MarkerType,
  Node,
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

const GRID_UNIT = 16;

const nodeTypes = {
  customNode: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: {
      x: 14.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {
      label: <MdPlayCircleFilled />,
    },
    className: "start",
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeDelete = (id: string) => {
    setNodes((prevNodes) => {
      const deleteIndex = prevNodes.findIndex((n) => n.id === id);
      return prevNodes.slice(0, deleteIndex);
    });
  };

  const handleNodeAdd = ({
    label,
    type,
    className,
    checkpoint,
  }: {
    label: string;
    type: string;
    className: string;
    checkpoint?: boolean;
  }) => {
    setNodes((prevNodes) => {
      const prevNode = prevNodes[prevNodes.length - 1];
      if (prevNode.type === "output") return prevNodes;
      const newNodeY =
        prevNode.position.y + (prevNode.height || 0) + 4 * GRID_UNIT;

      setEdges((prevEdges) => [
        ...edges,
        {
          id: `edge-${prevEdges.length}`,
          source: prevNodes[prevNodes.length - 1].id,
          target: String(prevNodes.length + 1),
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        },
      ]);

      return [
        ...prevNodes,
        {
          id: String(prevNodes.length + 1),
          position: { x: 12 * GRID_UNIT - 160 + 32, y: newNodeY },
          type: "customNode",
          data: {
            label,
            onDelete: handleNodeDelete,
            setPopupVisible,
            type,
            checkpoint,
          },
          className,
        },
      ];
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
                    <button
                      key={step.id}
                      onClick={() =>
                        handleNodeAdd({
                          label: step.label,
                          type:
                            step.type === "finishing-step"
                              ? "finishing-step"
                              : "step",
                          className:
                            step.type === "finishing-step"
                              ? "finishing-step"
                              : "step",
                        })
                      }
                    >
                      <Box
                        color={step.type === "finishing-step" ? "red" : "blue"}
                      >
                        {step.label}
                      </Box>
                    </button>
                  ))}
                </Track>
              </Collapsible>
            )}

            {allElements && (
              <Collapsible title="All elements">
                <Track direction="vertical" align="stretch" gap={4}>
                  {allElements.map((step) => (
                    <button
                      key={step.id}
                      onClick={() =>
                        handleNodeAdd({
                          label: step.label,
                          type:
                            step.type === "finishing-step"
                              ? "finishing-step"
                              : "step",
                          className:
                            step.type === "finishing-step"
                              ? "finishing-step"
                              : "step",
                        })
                      }
                    >
                      <Box
                        color={step.type === "finishing-step" ? "red" : "blue"}
                      >
                        {step.label}
                      </Box>
                    </button>
                  ))}
                </Track>
              </Collapsible>
            )}
          </Track>
        </div>
        <div className="graph__body">
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
            onNodeMouseEnter={(_, node) => {
              setNodes((prevNodes) =>
                prevNodes.map((prevNode) => {
                  if (prevNode.id !== "1" && prevNode.data === node.data) {
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
                  if (prevNode.id !== "1" && prevNode.data === node.data) {
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
      </div>
    </>
  );
};

export default ServiceFlowPage;
