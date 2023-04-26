import { FC, useCallback, useEffect, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import { Edge, MarkerType, Node, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";

import { Box, Button, Collapsible, FlowBuilder, NewServiceHeader, Track } from "../components";
import "./ServiceFlowPage.scss";
import { Step } from "../types/step";
import Popup from "../components/Popup";
import { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import { EndpointData } from "../types/endpoint-data";

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
    type: "startNode",
    position: {
      x: 13.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {},
    className: "start",
    selectable: false,
    draggable: false,
  },
  initialPlaceholder,
];

const ServiceFlowPage: FC = () => {
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
  const [setupElements, setSetupElements] = useState<Step[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const flow = location.state?.flow ? JSON.parse(location.state?.flow) : undefined;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(flow ? flow.nodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(flow ? flow.edges : [initialEdge]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

  useEffect(() => {
    const setupEndpoints: EndpointData[] | undefined = location.state?.endpoints;
    const elements: Step[] = [];
    setupEndpoints?.forEach((endpoint) => {
      const selectedEndpoint = endpoint.definedEndpoints.find((e) => e.isSelected);
      if (!selectedEndpoint) return;
      elements.push({
        id: elements.length,
        label: endpoint.name ?? `${selectedEndpoint.methodType.toUpperCase()} ${selectedEndpoint.url}`,
        type: "user-defined",
      });
    });
    setSetupElements(elements);
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "40vh" };

  return (
    <>
      <NewServiceHeader
        activeStep={3}
        saveDraftOnClick={() => {}}
        continueOnClick={() =>
          navigate(ROUTES.NEWSERVICE_ROUTE, {
            state: { endpoints: location.state?.endpoints, flow: JSON.stringify(reactFlowInstance?.toObject()) },
          })
        }
      />
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
          <Button onClick={() => setUpdatedRules([null, null, null])}>update rule count</Button>
        </Popup>
      )}
      <ReactFlowProvider>
        <div className="graph">
          <div className="graph__controls">
            <Track direction="vertical" gap={16} align="stretch">
              {setupElements && (
                <Collapsible title="Setup elements" contentStyle={contentStyle}>
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
                <Collapsible title="All elements" contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {allElements.map((step) => (
                      <Box
                        key={step.id}
                        color={["finishing-step-end", "finishing-step-redirect"].includes(step.type) ? "red" : "blue"}
                        onDragStart={(event) => {
                          console.log(nodes);
                          console.log(edges);
                          onDragStart(event, step)
                        }}
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
          <FlowBuilder
            reactFlowInstance={reactFlowInstance}
            setReactFlowInstance={setReactFlowInstance}
            setPopupVisible={setPopupVisible}
            updatedRules={updatedRules}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
          />
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default ServiceFlowPage;
