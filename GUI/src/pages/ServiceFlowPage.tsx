import { CSSProperties, FC, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import {
  MarkerType,
  Node,
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
import { Step, StepType } from "../types/step";
import { useTranslation } from "react-i18next";
import FlowBuilder, { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import "reactflow/dist/style.css";
import "./ServiceFlowPage.scss";

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
}

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
  const { t } = useTranslation();

  const setupElements: Step[] = [
    { id: 1, label: t('serviceFlow.element.taraAuthentication'), type: StepType.Auth },
    { id: 3, label: t('serviceFlow.element.clientInput'), type: StepType.Input },
  ];
  const allElements: Step[] = [
    { id: 1, label: t('serviceFlow.element.taraAuthentication'), type: StepType.Auth },
    { id: 2, label: t('serviceFlow.element.textfield'), type: StepType.Textfield },
    { id: 3, label: t('serviceFlow.element.clientInput'), type: StepType.Input },
    { id: 4, label: t('serviceFlow.element.openNewWebpage'), type: StepType.OpenWebpage },
    { id: 5, label: t('serviceFlow.element.fileGeneration'), type: StepType.FileGenerate },
    { id: 6, label: t('serviceFlow.element.fileSigning'), type: StepType.FileSign },
    { id: 7, label: t('serviceFlow.element.conversationEnd'), type: StepType.FinishingStepEnd },
    {
      id: 8,
      label: t('serviceFlow.element.redirectConversationToSupport'),
      type: StepType.FinishingStepRedirect,
    },
  ];
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const navigate = useNavigate();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: 'auto', maxHeight: '40vh' };

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
          }
        }
      })
    )
  };

  const resetStates = () => {
    setSelectedNode(null);
  };

  return (
    <>
      <NewServiceHeader activeStep={3} continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      <FlowElementsPopup
        onClose={() => handlePopupClose()}
        onSave={(updatedNode: Node) => {
          handlePopupSave(updatedNode);
        }}
        onRulesUpdate={(rules) => {
          if (selectedNode?.data.stepType === StepType.Input) setUpdatedRules(rules)
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
                <Collapsible title={t('serviceFlow.setupElements')} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {setupElements.map((step) => (
                      <Box
                        key={step.id}
                        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
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
                <Collapsible title={t('serviceFlow.allElements')} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {allElements.map((step) => (
                      <Box
                        key={step.id}
                        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
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
