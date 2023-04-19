import { CSSProperties, FC, useCallback, useRef, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import { MarkerType, Node, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";

import {
  Box,
  Button,
  Collapsible,
  FormInput,
  FormRichText,
  FlowBuilder,
  FormTextarea,
  NewServiceHeader,
  OutputElementBox,
  Track,
  FlowElementsPopup,
} from "../components";

import "./ServiceFlowPage.scss";
import { Step, StepType } from "../types/step";
import Popup from "../components/Popup";
import { useTranslation } from "react-i18next";
import * as Tabs from '@radix-ui/react-tabs';
import { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import "reactflow/dist/style.css";

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

  const availableOutputElements = [
    '{{otspunktinimetus.idCode}}',
    '{{otspunktinimetus.firstName}}',
    '{{otspunktinimetus.surName}}',
  ];

  const [visiblePopupNode, setVisiblePopupNode] = useState<Node | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  // Message to client
  const [messageToClientInput, setMessageToClientInput] = useState<string | null>(null);
  const [messageTestInputFields, setMessageTestInputFields] = useState<{ [key: string]: string }>({})
  const [messageTestOutput, setMessageTestOutput] = useState<string | null>(null)
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const navigate = useNavigate();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: 'auto', maxHeight: '40vh' };

  const handlePopupClose = () => resetStates();

  const handlePopupSave = () => {
    resetStates();
    if (selectedNode?.data.stepType === StepType.FinishingStepEnd) return;

    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.id !== selectedNode!.id) return prevNode;
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            message: messageToClientInput
          }
        }
      })
    )
  };

  const resetStates = () => {
    setMessageToClientInput(null);
    setSelectedNode(null);
    setSelectedTab(null);
  };

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`
  }


  const buildTextFieldContentBlock = () => {
    return (
      <>
        <Track direction='vertical' align="left" style={{ width: '100%', ...popupBodyCss }}>
          <label htmlFor="message">{t('serviceFlow.popup.messageLabel')}</label>
          <FormRichText
            onChange={(value) => {
              setMessageToClientInput(value);
              findMessagePlaceholders(value!);
            }}
            defaultValue={selectedNode?.data.message ?? (messageToClientInput ?? undefined)}
          ></FormRichText>
        </Track>
        <Track direction='vertical' align="left" style={{ width: '100%', ...popupBodyCss, backgroundColor: '#F9F9F9' }}>
          <label htmlFor="json">{t('serviceFlow.popup.availableOutputElementsLabel')}</label>
          <Track
            direction='horizontal'
            gap={4}
            justify='start'
            isMultiline={true}
          >
            {availableOutputElements.map((element, i) => (
              <OutputElementBox
                key={`${element}-${i}`}
                text={element}
              ></OutputElementBox>
            ))}
          </Track>
        </Track>
      </>
    );
  };

  const buildTextFieldTestContentBlock = () => {
    return (
      <Track direction="vertical" align="left" style={{ ...popupBodyCss }} gap={16}>
        {Object.keys(messageTestInputFields).map((key, i) => (
          <Track direction="vertical" align="left" style={{ width: '100%' }} key={key + i}>
            <>
              <label htmlFor={key}>{key}</label>
              <FormInput
                name={key}
                label={key}
                placeholder="Väärtus..."
                onChange={(event) => {
                  setMessageTestInputFields((previous) => {
                    previous[key] = event.target.value;
                    return previous;
                  })
                }}
                hideLabel
              ></FormInput>
            </>
          </Track>
        ))}
        <Track direction="vertical" align="left" style={{ width: '100%' }}>
          {messageTestOutput}
        </Track>
        <Button
          onClick={() => {
            const regex = /{{(.*?)}}/g;
            const result = messageToClientInput!.replace(regex, (match, _) => messageTestInputFields[match.trim()] || match);
            setMessageTestOutput(result);
          }}
        >Testi</Button>
      </Track>
    );
  }

  const findMessagePlaceholders = (text: string | null) => {
    if (!text) return;

    const pattern = /\{\{(.+?)\}\}/g;
    const placeholders: { [key: string]: string } = {};
    let match;

    while (match = pattern.exec(text)) placeholders[match[0]] = '';
    setMessageTestInputFields(placeholders);
  }

  const buildDefaultMessageContentBlock = (message: string) => {
    return (
      <>
        <Track direction='vertical' align="left" style={{ width: '100%', ...popupBodyCss }}>
          <label htmlFor="messageToClient">Klient näeb sõnumit</label>
          <FormTextarea
            name={"messageToClient"}
            label={"Klient näeb sõnumit"}
            hideLabel={true}
            defaultValue={message}
            style={{
              backgroundColor: '#F0F0F2',
              resize: 'vertical',
            }}
            readOnly
          >
          </FormTextarea>
        </Track>
      </>
    );
  };

  const buildEndConversationContentBlock = () => {
    return (
      <>
        <Track direction="vertical" style={popupBodyCss} align="left">
          <p style={{ color: '#9799A4', fontSize: 14 }}>
            Selle sammuga lõpeb suhtlus. Et teenusvoogu jätkata, tuleb vestluse lõpetamine voost eemaldada.
          </p>
        </Track>
      </>
    );
  }

  return (
    <>
      <NewServiceHeader activeStep={3} continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      {/* {selectedNode && (
        <Popup
          style={{ maxWidth: 700 }}
          hasDefaultBody={false}
          title={selectedNode.data.label}
          onClose={() => handlePopupClose()}
          footer={
            <Track gap={16}>
              {
                !selectedNode.data.readonly && <Button
                  appearance="secondary"
                  onClick={() => handlePopupClose()}
                >
                  {t('global.cancel')}
                </Button>
              }
              <Button
                onClick={() => selectedNode.data.readonly ? handlePopupClose() : handlePopupSave()}
              >
                {t(selectedNode.data.readonly ? 'global.close' : 'global.save')}
              </Button>
            </Track>
          }
        >

          <Track direction='vertical' align="left" gap={16}>
            <Tabs.Root
              className='vertical-tabs__column'
              orientation='horizontal'
              value={selectedTab ?? t('serviceFlow.tabs.setup')!}
              onValueChange={(value) => {
                setSelectedTab(value);
                // reset test outputs
                setMessageTestOutput(null);
              }}
            >
              <Tabs.List>
                <Tabs.Trigger className='vertical-tabs__trigger' value={t('serviceFlow.tabs.setup')}>
                  {t('serviceFlow.tabs.setup')}
                </Tabs.Trigger>
                {!selectedNode.data.readonly && <Tabs.Trigger className='vertical-tabs__trigger' value={t('serviceFlow.tabs.test')}>
                  {t('serviceFlow.tabs.test')}
                </Tabs.Trigger>}
              </Tabs.List>

              <Tabs.Content value={t('serviceFlow.tabs.setup')} className='vertical-tabs__body'>
                {selectedNode.data.stepType === StepType.Textfield && buildTextFieldContentBlock()}
                {selectedNode.data.stepType === StepType.FinishingStepEnd && buildEndConversationContentBlock()}
                {
                  selectedNode.data.stepType === StepType.FinishingStepRedirect &&
                  buildDefaultMessageContentBlock('Vestlus suunatakse klienditeenindajale')
                }
              </Tabs.Content>
              {!selectedNode.data.readonly && <Tabs.Content value={t('serviceFlow.tabs.test')} className='vertical-tabs__body'>
                {selectedNode.data.stepType === StepType.Textfield && buildTextFieldTestContentBlock()}
              </Tabs.Content>}
            </Tabs.Root>
          </Track>
        </Popup>
      )} */}

      <FlowElementsPopup
        // onClose={() => setVisiblePopupNode(null)}
        onClose={() => handlePopupClose()}
        onSave={(rules: any) => {
          setUpdatedRules(rules)
          setVisiblePopupNode(null)
        }}
        node={selectedNode}
        oldRules={updatedRules}
        addRuleCount={() => setUpdatedRules([null, null, null])}
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
            onNodeEdit={(selectedNode) => {
              setSelectedNode(selectedNode);
            }}
            setVisiblePopupNode={setVisiblePopupNode}
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
