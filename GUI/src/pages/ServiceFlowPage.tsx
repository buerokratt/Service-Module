import { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import { MarkerType, Node, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
import { Box, Collapsible, NewServiceHeader, Track, FlowElementsPopup } from "../components";
import { useTranslation } from "react-i18next";
import FlowBuilder, { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import apiIconTag from "../assets/images/api-icon-tag.svg";
import "reactflow/dist/style.css";
import "./ServiceFlowPage.scss";
import { StepType, Step, RawData, ConditionRuleType } from "../types";
import axios from "axios";
import { testDraftService } from "../resources/api-constants";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";
import { saveFlow } from "services/service-builder";

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
  link?: string;
  linkText?: string;
  fileName?: string;
  fileContent?: string;
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

  const allElements: Step[] = useMemo(() => [
    { id: 10, label: t("serviceFlow.element.taraAuthentication"), type: StepType.Auth },
    { id: 20, label: t("serviceFlow.element.textfield"), type: StepType.Textfield },
    { id: 30, label: t("serviceFlow.element.clientInput"), type: StepType.Input },
    { id: 40, label: t("serviceFlow.element.rules"), type: StepType.RasaRules },
    { id: 50, label: t("serviceFlow.element.openNewWebpage"), type: StepType.OpenWebpage },
    { id: 60, label: t("serviceFlow.element.fileGeneration"), type: StepType.FileGenerate },
    { id: 70, label: t("serviceFlow.element.fileSigning"), type: StepType.FileSign },
    { id: 90, label: t("serviceFlow.element.conversationEnd"), type: StepType.FinishingStepEnd },
    { id: 100, label: t("serviceFlow.element.redirectConversationToSupport"), type: StepType.FinishingStepRedirect },
  ], []);

  const [updatedRules, setUpdatedRules] = useState<{ rules: (string | null)[]; rulesData: ConditionRuleType[] }>({
    rules: [],
    rulesData: [],
  });
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const navigate = useNavigate();
  const { serviceId, description, availableVariables, setFlow, isCommon, } = useServiceStore();

  // const reactFlowInstance = useServiceStore((state) => state.reactFlowInstance);
  const steps = useServiceStore((state) => state.mapEndpointsToSetps());
  const name = useServiceStore((state) => state.serviceNameDashed());
  
  const flow = useMemo(() => {
    const flowStr = useServiceStore.getState().flow;
    if(!flowStr)
      return undefined;
    return JSON.parse(flowStr);
  }, [useServiceStore.getState().flow]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(flow ? flow.edges : [initialEdge]);

  const resetNodes = (): Node[] => {
    return flow.nodes.map((n: Node) => {
      if (n.type !== "customNode") return n;
      return { ...n, selected: false, className: n.data.type };
    });
  };
  const [nodes, setNodes, onNodesChange] = useNodesState(flow ? resetNodes() : initialNodes);
  const [isTestButtonVisible, setIsTestButtonVisible] = useState(false);
  const [isTestButtonEnabled, setIsTestButtonEnabled] = useState(true);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "40vh" };

  const handlePopupClose = () => resetStates();
  const onNodeDelete = () => setIsTestButtonEnabled(false);
  const onNodeAdded = () => setIsTestButtonEnabled(false);

  const handlePopupSave = (updatedNode: Node<NodeDataProps>) => {
    resetStates();
    if (selectedNode?.data.stepType === StepType.FinishingStepEnd) return;

    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.id !== selectedNode!.id) return prevNode;
        if (
          prevNode.data.message != updatedNode.data.message ||
          prevNode.data.link != updatedNode.data.link ||
          prevNode.data.linkText != updatedNode.data.linkText ||
          prevNode.data.fileName != updatedNode.data.fileName ||
          prevNode.data.fileContent != updatedNode.data.fileContent
        ) {
          setIsTestButtonEnabled(false);
        }
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            message: updatedNode.data.message,
            link: updatedNode.data.link,
            linkText: updatedNode.data.linkText,
            fileName: updatedNode.data.fileName,
            fileContent: updatedNode.data.fileContent,
          },
        };
      })
    );
  };

  const resetStates = () => {
    setSelectedNode(null);
  };

  const runServiceTest = async () => {
    try {
      await axios.post(testDraftService(name), {});
      useToastStore.getState().success({
        title: "Test result- success",
      });
    } catch (error) {
      console.log("ERROR: ", error);
      useToastStore.getState().error({
        title: "Test result - error",
      });
    }
  };

  const saveFlowClick = async () => {
    await saveFlow(steps, name, edges, nodes, 
      () => {
        setIsTestButtonVisible(true);
        setIsTestButtonEnabled(true);
        useToastStore.getState().success({
          title: t("newService.toast.success"),
          message: t("newService.toast.savedSuccessfully"),
        });
      }, 
      (e) => {
        useToastStore.getState().error({
          title: t("toast.cannot-save-flow"),
          message: e?.message,
        });
      }, t, serviceId, description, isCommon);
  }

  return (
    <>
      <NewServiceHeader
        activeStep={3}
        saveDraftOnClick={saveFlowClick}
        serviceId={serviceId}
        continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
        isTestButtonVisible={isTestButtonVisible}
        isTestButtonEnabled={isTestButtonEnabled}
        onTestButtonClick={runServiceTest}
      />
      <h1 style={{ paddingLeft: 16, paddingTop: 16 }}>
        {t("serviceFlow.flow")} "{name}"
      </h1>
      <h5
        style={{
          paddingLeft: 16,
          paddingBottom: 5,
          wordBreak: "break-all",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {description}
      </h5>
      <FlowElementsPopup
        availableVariables={availableVariables}
        onClose={handlePopupClose}
        onSave={handlePopupSave}
        onRulesUpdate={(rules, rulesData) => {
          if (selectedNode?.data.stepType === StepType.Input) {
            setUpdatedRules({ rules, rulesData });
          }
          resetStates();
        }}
        node={selectedNode}
        oldRules={updatedRules.rules}
      />
      <ReactFlowProvider>
        <div className="graph">
          <div className="graph__controls">
            <Track direction="vertical" gap={16} align="stretch">
              {steps && (
                <Collapsible title={t("serviceFlow.setupElements")} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {steps.map((step) => (
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
            onNodeEdit={setSelectedNode}
            updatedRules={updatedRules}
            description={description}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            onNodeAdded={onNodeAdded}
            onNodeDelete={onNodeDelete}
          />
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default ServiceFlowPage;
