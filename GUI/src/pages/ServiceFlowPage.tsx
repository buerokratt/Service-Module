import { CSSProperties, FC, useEffect, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";

import {
  MarkerType,
  Node,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from "reactflow";
import {
  Box,
  Collapsible,
  NewServiceHeader,
  Track,
  FlowElementsPopup,
} from "../components";
import { useTranslation } from "react-i18next";
import FlowBuilder, { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import apiIconTag from "../assets/images/api-icon-tag.svg";
import "reactflow/dist/style.css";
import "./ServiceFlowPage.scss";
import { StepType, Step } from "../types";
import { EndpointData } from "../types/endpoint";

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

// TODO: refactoring
type NodeDataProps = {
  label: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  type: string;
  stepType: StepType;
  readonly: boolean;
  message?: string;
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
  const { t } = useTranslation();
  const allElements: Step[] = [
    { id: 1, label: t("serviceFlow.element.taraAuthentication"), type: StepType.Auth },
    { id: 2, label: t("serviceFlow.element.textfield"), type: StepType.Textfield },
    { id: 3, label: t("serviceFlow.element.clientInput"), type: StepType.Input },
    { id: 4, label: t("serviceFlow.element.openNewWebpage"), type: StepType.OpenWebpage },
    { id: 5, label: t("serviceFlow.element.fileGeneration"), type: StepType.FileGenerate },
    { id: 6, label: t("serviceFlow.element.fileSigning"), type: StepType.FileSign },
    { id: 7, label: t("serviceFlow.element.conversationEnd"), type: StepType.FinishingStepEnd },
    {
      id: 8,
      label: t("serviceFlow.element.redirectConversationToSupport"),
      type: StepType.FinishingStepRedirect,
    },
  ];
  const [setupElements, setSetupElements] = useState<Step[]>([]);
  const location = useLocation();
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const navigate = useNavigate();
  const flow = location.state?.flow ? JSON.parse(location.state?.flow) : undefined;
  const [nodes, setNodes, onNodesChange] = useNodesState(flow ? flow.nodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow ? flow.edges : [initialEdge]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

  useEffect(() => {
    const setupEndpoints: EndpointData[] | undefined = location.state?.endpoints;
    const elements: Step[] = [];
    setupEndpoints?.forEach((endpoint) => {
      const selectedEndpoint = endpoint.definedEndpoints.find((e) => e.isSelected);
      if (!selectedEndpoint) return;
      elements.push({
        id: elements.length,
        label:
          endpoint.name.trim().length > 0
            ? endpoint.name
            : `${selectedEndpoint.methodType.toUpperCase()} ${selectedEndpoint.url}`,
        type: StepType.UserDefined,
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

  const handlePopupClose = () => resetStates();

  const handlePopupSave = (updatedNode: Node<NodeDataProps>) => {
    resetStates();
    if (selectedNode?.data.stepType === StepType.FinishingStepEnd) return;

    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.id !== selectedNode!.id) return prevNode;
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            message: updatedNode.data.message,
          },
        };
      })
    );
  };

  const resetStates = () => {
    setSelectedNode(null);
  };

  return (
    <>
      <NewServiceHeader
        activeStep={3}
        saveDraftOnClick={() => {}}
        endpoints={location.state?.endpoints}
        flow={JSON.stringify(reactFlowInstance?.toObject())}
        continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
      />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      <FlowElementsPopup
        onClose={() => handlePopupClose()}
        onSave={(updatedNode: Node) => {
          handlePopupSave(updatedNode);
        }}
        onRulesUpdate={(rules) => {
          if (selectedNode?.data.stepType === StepType.Input) setUpdatedRules(rules);
          resetStates();
        }}
        node={selectedNode}
        oldRules={updatedRules}
      />
      <ReactFlowProvider>
        <div className="graph">
          <div className="graph__controls">
            <Track direction="vertical" gap={16} align="stretch">
              {setupElements && (
                <Collapsible title={t("serviceFlow.setupElements")} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {setupElements.map((step) => (
                      <Box
                        key={step.id}
                        color={
                          [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type)
                            ? "red"
                            : "blue"
                        }
                        onDragStart={(event) => onDragStart(event, step)}
                        draggable
                      >
                        <Track gap={8} style={{ overflow: "hidden" }}>
                          {step.type === "user-defined" && <img alt="" src={apiIconTag} />}
                          {step.label}
                        </Track>
                      </Box>
                    ))}
                  </Track>
                </Collapsible>
              )}
              {allElements && (
                <Collapsible title={t("serviceFlow.allElements")} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {allElements.map((step) => (
                      <Box
                        key={step.id}
                        color={
                          [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type)
                            ? "red"
                            : "blue"
                        }
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
          <FlowBuilder
            reactFlowInstance={reactFlowInstance}
            setReactFlowInstance={setReactFlowInstance}
            onNodeEdit={setSelectedNode}
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
