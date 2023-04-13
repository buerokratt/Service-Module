import { CSSProperties, FC, useCallback, useRef, useState } from "react";
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
  FormInput,
  FormRichText,
  FormTextarea,
  NewServiceHeader,
  OutputElementBox,
  Track,
} from "../components";
import CustomNode from "../components/Steps/CustomNode";
import "./ServiceFlowPage.scss";
import { Step, StepType } from "../types/step";
import Popup from "../components/Popup";
import PlaceholderNode from "../components/Steps/PlaceholderNode";
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation } from "react-i18next";

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

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  // Message to client
  const [messageToClientInput, setMessageToClientInput] = useState<string | null>(null);
  const [messageTestInputFields, setMessageTestInputFields] = useState<{ [key: string]: string }>({})
  const [messageTestOutput, setMessageTestOutput] = useState<string | null>(null)

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
    if (!matchingPlaceholder && !position) throw Error("Either matchingPlaceholder or position have to be defined.");

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
          onEdit: handleNodeEdit,
          type: "rule",
          stepType: "rule",
          readonly: true,
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

  const buildRulesEdges = ({ inputId, placeholderId }: { inputId: number; placeholderId: number }) => {
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

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
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
            prevNode.position.y = 3 * GRID_UNIT + draggedNode.position.y + 72;
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
        event.dataTransfer.getData("application/reactflow-type") as StepType,
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

          if (![StepType.Input, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type)) {
            // Point edge from new node to new placeholder
            newEdges.push(
              buildEdge({
                id: `edge-${newNodeId}-${newPlaceholderId + 1}`,
                source: newNodeId,
                sourceHandle: `handle-${newNodeId}-1`,
                target: `${newPlaceholderId + 1}`,
              })
            );
          }
          if (type === StepType.Input) {
            // Create edges from input node to rules and from rules to placeholders
            newEdges.push(
              ...buildRulesEdges({
                inputId: +newNodeId,
                placeholderId: newPlaceholderId,
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
              onEdit: handleNodeEdit,
              type: [
                StepType.FinishingStepEnd,
                StepType.FinishingStepRedirect
              ].includes(type) ? "finishing-step" : "step",
              stepType: type,
              readonly: [
                StepType.Auth,
                StepType.FileSign,
                StepType.FinishingStepEnd,
                StepType.FinishingStepRedirect,
              ].includes(type),
              message: setDefaultMessages(type),
            },
            className: [
              StepType.FinishingStepEnd,
              StepType.FinishingStepRedirect
            ].includes(type) ? "finishing-step" : "step",
          },
        ];

        if (![StepType.Input, StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type)) {
          // Add placeholder right below new node
          newNodes.push(
            buildPlaceholder({
              id: `${newPlaceholderId + 1}`,
              alignment: type === StepType.Input ? "left" : "center",
              matchingPlaceholder,
            })
          );
        }

        if (type === StepType.Input) {
          // Add 2 rules below input node and placeholders under each
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

  const setDefaultMessages = (stepType: StepType) => {
    switch (stepType) {
      case StepType.FinishingStepEnd:
        return 'Vestlus on lõpetatud';
      case StepType.FinishingStepRedirect:
        return 'Vestlus suunatakse klienditeenindajale';
    }
  }

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

        if (deletedNode.data.stepType !== StepType.Input) {
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
          if (deletedNode.data.stepType !== StepType.Input) {
            // remove edges pointing to/from removed node
            return edge.target === id || edge.source === id;
          } else {
            // remove edges not pointing to present nodes
            return !updatedNodes.map((node) => node.id).includes(edge.target);
          }
        });

        if (toRemove.length === 0) return prevEdges;
        let newEdges = [...prevEdges.filter((edge) => !toRemove.includes(edge))];
        if (deletedNode.data.stepType !== StepType.Input && newEdges.length > 0 && toRemove.length > 1) {
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
            alignment: "center",
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

  const handleNodeEdit = useCallback(async (selectedNodeId: string) => {
    if (!reactFlowInstance) return;
    const node = reactFlowInstance.getNode(selectedNodeId);

    setSelectedNode(node ?? null);
  }, [reactFlowInstance]);
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
      <NewServiceHeader activeStep={3} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      {selectedNode && (
        <Popup
          style={{ maxWidth: 700 }}
          hasDefaultBody={false}
          title={selectedNode.data.label}
          onClose={() => handlePopupClose()}
          footer={
            <Track gap={16}>
              <Button appearance="secondary" onClick={() => handlePopupClose()}>
                Discard
              </Button>
              <Button onClick={() => handlePopupClose()}>Save</Button>
              <Track gap={16}>
                {
                  !selectedNode.data.readonly && <Button
                    appearance="secondary"
                    onClick={() => handlePopupClose()}
                  >
                    {t('global.cancel')}
                  </Button>
                }
                <Button onClick={() => selectedNode.data.readonly ? handlePopupClose() : handlePopupSave()}>{t(selectedNode.data.readonly ? 'global.close' : 'global.save')}</Button>
              </Track>
            </Track>
          }
        >
          <p>hello</p>
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
      )}
      <div className="graph">
        <div className="graph__controls">
          <Track direction="vertical" gap={16} align="stretch">
            {setupElements && (
              <Collapsible title={t('serviceFlow.setupElements')}>
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
              <Collapsible title={t('serviceFlow.allElements')}>
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