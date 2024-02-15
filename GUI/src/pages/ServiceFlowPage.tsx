import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from "react";
import { EdgeChange, Node, NodeChange, ReactFlowProvider, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Collapsible, NewServiceHeader, Track, FlowElementsPopup } from "../components";
import FlowBuilder from "../components/FlowBuilder/FlowBuilder";
import { ROUTES } from "../resources/routes-constants";
import apiIconTag from "../assets/images/api-icon-tag.svg";
import { StepType, Step, ConditionRuleType } from "../types";
import useServiceStore from "store/new-services.store";
import { NodeDataProps } from "types/service-flow";
import { saveFlowClick } from "services/service-builder";
import "reactflow/dist/style.css";
import "./ServiceFlowPage.scss";

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
  ], [t]);

  const [updatedRules, setUpdatedRules] = useState<{ rules: (string | null)[]; rulesData: ConditionRuleType[] }>({
    rules: [],
    rulesData: [],
  });
  const navigate = useNavigate();
  const description = useServiceStore(state => state.description);
  const availableVariables = useServiceStore(state => state.availableVariables);
  const steps = useServiceStore(state => state.mapEndpointsToSetps());
  const name = useServiceStore(state => state.serviceNameDashed());
  const selectedNode = useServiceStore(state => state.selectedNode);
  const { id } = useParams();

  useEffect(() => {
    if(!id) return;
    useServiceStore.getState().loadService(id);
  }, [])

  const edges = useServiceStore((state) => state.edges);
  const nodes = useServiceStore((state) => state.nodes);
  
  const setNodes = useServiceStore((state) => state.setNodes);
  const setEdges = useServiceStore((state) => state.setEdges);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const [isTestButtonVisible, setIsTestButtonVisible] = useState(false);
  const isTestButtonEnabled = useServiceStore(state => state.isTestButtonEnabled);

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
        if (
          prevNode.data.message != updatedNode.data.message ||
          prevNode.data.link != updatedNode.data.link ||
          prevNode.data.linkText != updatedNode.data.linkText ||
          prevNode.data.fileName != updatedNode.data.fileName ||
          prevNode.data.fileContent != updatedNode.data.fileContent ||
          prevNode.data.signOption != updatedNode.data.signOption
        ) {
          useServiceStore.getState().disableTestButton();
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
            signOption: updatedNode.data.signOption,
          },
        };
      })
    );
  };

  const resetStates = () => useServiceStore.getState().setSelectedNode(null);

  return (
    <>
      <NewServiceHeader
        activeStep={3}
        availableVariables={availableVariables}
        serviceDescription={description}
        saveDraftOnClick={saveFlowClick}
        continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
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
            updatedRules={updatedRules}
            description={description}
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
          />
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default ServiceFlowPage;
