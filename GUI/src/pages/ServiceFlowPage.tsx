import { FC, useCallback, useEffect, useRef, useState } from "react";
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
  FormInput,
  FormSelect,
  NewServiceHeader,
  SwitchBox,
  Track,
} from "../components";
import CustomNode from "../components/Steps/CustomNode";
import "./ServiceFlowPage.scss";
import { Step } from "../types/step";
import Popup from "../components/Popup";
import PlaceholderNode from "../components/Steps/PlaceholderNode";
import { v4 as uuidv4 } from 'uuid';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
  {
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
  const [visiblePopupNode, setVisiblePopupNode] = useState<Node | null>(null);

  const buildPlaceholder = ({
    id,
    alignment,
    matchingPlaceholder,
  }: {
    id: string;
    alignment: "left" | "center" | "right";
    matchingPlaceholder: Node;
  }): Node => {
    let positionX = matchingPlaceholder.position.x;
    if (alignment === "left") positionX -= 330;
    if (alignment === "right") positionX += 330;

    return {
      id,
      type: "placeholder",
      position: {
        x: positionX,
        y: 3 * GRID_UNIT + matchingPlaceholder.position.y + 72,
      },
      data: {
        type: "placeholder",
      },
      className: "placeholder",
      selectable: false,
      draggable: false,
    };
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
  }) => {
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
            let positionX = draggedNode.position.x;

            if (prevNode.position.x > draggedNode.position.x) positionX += 330;
            if (prevNode.position.x < draggedNode.position.x) positionX -= 330;
            if (draggedEdges.length === 1) positionX = draggedNode.position.x;

            prevNode.position.x = positionX;
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
        const newPlaceholderId = nodes.length;
        setEdges((prevEdges) => {
          const newEdges = [
            ...prevEdges.filter(
              (edge) => edge.target !== matchingPlaceholder.id
            ),
            buildEdge({
              id: connectedNodeEdge.id!,
              source: connectedNodeEdge.source,
              sourceHandle: connectedNodeEdge.sourceHandle,
              target: `${newNodeId}`,
            }),
          ];

          if (type !== "input") {
            buildEdge({
              id: `edge-${prevEdges.length + 1}`,
              source: `${newNodeId}`,
              sourceHandle: `handle-${newNodeId}-1`,
              target: `${newPlaceholderId + 1}`,
            })
          }

          // if (type === "input") {
          //   newEdges.push(
          //     buildEdge({
          //       id: `edge-${prevEdges.length + 2}`,
          //       source: `${newNodeId}`,
          //       sourceHandle: `handle-${newNodeId}-2`,
          //       target: `${newPlaceholderId + 2}`,
          //     })
          //   );

          //   newEdges.push(
          //     buildEdge({
          //       id: `edge-${prevEdges.length + 3}`,
          //       source: `${newNodeId}`,
          //       sourceHandle: `handle-${newNodeId}-3`,
          //       target: `${newPlaceholderId + 3}`,
          //     })
          //   );
          // }
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
              onDelete: handleNodeDelete,
              setPopupVisible: () => setVisiblePopupNode({ ...matchingPlaceholder, type }),
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
              alignment: "center",
              matchingPlaceholder,
            })
          );
        }
        // if (type === "input") {
        //   newNodes.push(
        //     buildPlaceholder({
        //       id: `${newPlaceholderId + 2}`,
        //       alignment: "right",
        //       matchingPlaceholder,
        //     })
        //   );

        //   newNodes.push(
        //     buildPlaceholder({
        //       id: `${newPlaceholderId + 3}`,
        //       alignment: "center",
        //       matchingPlaceholder,
        //     })
        //   );
        // }
        return newNodes;
      });
    },
    [reactFlowInstance, nodes, edges]
  );

  const handleNodeDelete = (id: string) => {
    setNodes((prevNodes) => {
      const deleteIndex = prevNodes.findIndex((n) => n.id === id);
      const newNodes = prevNodes.slice(0, deleteIndex);

      const parentNodeEdge = edges.find(x => x.target === id);
      if (parentNodeEdge) {
        const parentNode = nodes.find(x => x.id === parentNodeEdge.source);
        if (parentNode) {
          const placeholderNode = buildPlaceholder({
            id: uuidv4(),
            alignment: 'center',
            matchingPlaceholder: parentNode,
          })

          newNodes.push(placeholderNode)

          buildEdge({
            id: uuidv4(),
            source: parentNode.id,
            target: placeholderNode.id,
            sourceHandle: parentNodeEdge.sourceHandle,
          })
        }
      }
      return newNodes;
    });
  };

  return (
    <>
      <NewServiceHeader activeStep={3} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      <ElementsPopup
        node={visiblePopupNode}
        onClose={() => setVisiblePopupNode(null)}
        onSave={(isYesNoQuestion: any, rules: any) => {
          // setNodes(nodes.map(x => x.id === visiblePopupNode?.id ? {
          //   ...visiblePopupNode,
          //   data: {
          //     ...visiblePopupNode.data,
          //     isYesNoQuestion,
          //     rules,
          //   }
          // } : x))
          setVisiblePopupNode(null)
        }}
      />
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


interface ConditiobRuleType {
  id: string
  name: string
  condition: string
  value: string
}

const ElementsPopup = ({ node, onClose, onSave }: any) => {
  console.log(node)
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(node?.isYesNoQuestion ?? false)
  const [rules, setRules] = useState<ConditiobRuleType[]>(node?.rules ?? [])

  if (!node) {
    return <></>
  }

  const type = node.type;
  const title = type === 'input' ? "Client Input" : type === "file-generate" ? "File Generate" : "Hello";
  const conditionOptions = [
    { label: '==', value: '==' },
    { label: '===', value: '===' },
    { label: '!=', value: '!=' },
    { label: '!==', value: '!==' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: '>=', value: '>=' },
    { label: '<=', value: '<=' },
  ]
  const availableVariables = [
    '{{user.firstname}}',
    '{{user.lastname}}',
    '{{user.birthdate}}',
    '{{user.email}}',
    '{{invoice.total}}',
    '{{invoice.subtotal}}',
    '{{invoice.date}}',
    '{{address.city}}',
    '{{address.street}}',
    '{{address.building}}',
  ]

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: uuidv4(),
        name: '',
        condition: conditionOptions[0].value,
        value: '',
      }
    ])
  }

  const removeRule = (id: string) => {
    setRules(rules.filter(x => x.id !== id))
  }

  const handleNameChange = (id: string, value: string) => {
    const newRules = rules.map(x => x.id === id ? { ...x, name: value } : x);
    setRules(newRules);
  }
  const handleValueChange = (id: string, value: string) => {
    const newRules = rules.map(x => x.id === id ? { ...x, value: value } : x);
    setRules(newRules);
  }
  const handleConditionChange = (id: string, value?: string) => {
    if (!value) { return; }
    const newRules = rules.map(x => x.id === id ? { ...x, condition: value } : x);
    setRules(newRules);
    console.log(newRules)
  }

  return (
    <Popup
      style={{
        maxWidth: 700,
        overflow: 'scroll',
        maxHeight: '80vh',
      }}
      title={title}
      onClose={onClose}
      footer={
        <Track justify="between" style={{ width: '100%' }}>
          <Button appearance="text">
            See JSON request
          </Button>
          <Track gap={16}>
            <Button appearance="secondary" onClick={onClose}>
              Discard
            </Button>
            <Button onClick={() => onSave(isYesNoQuestion, rules)}>
              Save
            </Button>
          </Track>
        </Track>
      }
    >
      <DndProvider backend={HTML5Backend}>

        {type === 'input' &&
          <Track direction='vertical' align='stretch' style={{ margin: '-16px' }}>
            <Track gap={16} style={{ padding: '16px' }}>
              <Track>
                <SwitchBox
                  label=''
                  name=''
                  hideLabel
                  onCheckedChange={setIsYesNoQuestion}
                  checked={isYesNoQuestion}
                />
              </Track>
              <span>Yes/No Question</span>
            </Track>
            {
              isYesNoQuestion &&
              <>
                <Track style={{ padding: '16px', borderTop: '1px solid #d2d3d8' }}>
                  <span>Rule 1: <b>Yes</b></span>
                </Track>
                <Track style={{ padding: '16px', borderTop: '1px solid #d2d3d8' }}>
                  <span>Rule 2: <b>No</b></span>
                </Track>
              </>
            }
            {
              !isYesNoQuestion &&
              <>
                {rules.map((rule, i) =>
                  <Track
                    direction='vertical'
                    align='stretch'
                    style={{ padding: '16px', borderTop: '1px solid #d2d3d8' }}
                    key={rule.id}>
                    <Track justify='between'>
                      <span>Rule {i + 1}</span>
                      <Button
                        appearance='text'
                        style={{ padding: '0 .5rem', color: 'grey' }}
                        onClick={() => removeRule(rule.id)}
                      >
                        x
                      </Button>
                    </Track>
                    <Track gap={16}>
                      <ConditionInput rule={rule} handleNameChange={handleNameChange} />
                      <Track style={{ width: '5rem' }}>
                        <FormSelect
                          name='condition'
                          label=''
                          options={conditionOptions}
                          style={{ width: '5rem' }}
                          value={rule.condition}
                          defaultValue={rule.condition}
                          onSelectionChange={(selection) => handleConditionChange(rule.id, selection?.value)}
                        />
                      </Track>
                      <FormInput
                        name='value'
                        label=''
                        placeholder='...'
                        value={rule.value}
                        onChange={(value) => handleValueChange(rule.id, value.target.value)}
                      />
                    </Track>
                  </Track>
                )}
                <Track style={{ padding: '16px', borderTop: '1px solid #d2d3d8' }}>
                  <Button appearance='text' onClick={addRule}>+ Add a rule</Button>
                </Track>

                <Track direction='vertical' align='left' gap={16} style={{ padding: '16px', borderTop: '1px solid #d2d3d8', background: '#f9f9f9' }}>
                  <span>Available variables</span>
                  <Track gap={7} style={{ flexWrap: 'wrap' }}>
                    {availableVariables.map((x) =>
                      <VariableAsTag key={x} value={x} />
                    )}
                  </Track>
                </Track>
              </>
            }

            {type !== 'input' && <span>type</span>}
          </Track>
        }
      </DndProvider>
    </Popup >
  )
}
const VariableAsTag = ({ value }: any) => {
  const [, drag] = useDrag(() => ({
    type: 'tags',
    item: { value },
  }))

  return <span
    ref={drag}
    style={{
      padding: '0 .3rem',
      background: '#fff9e8',
      border: '1px solid #ffde92',
      borderRadius: '1rem',
    }}>
    {value}
  </span>;
}

const ConditionInput = ({ rule, handleNameChange }: { rule: ConditiobRuleType, handleNameChange: (id: string, value: string) => void }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    setName(rule.name)
  }, [rule.name])


  const [_, drop] = useDrop(
    () => ({
      accept: 'tags',
      drop(_item: any, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) return;
        setName("name + ' ' + _item.value")
        handleNameChange(rule.id, name + ' ' + _item.value)
      },
    }),
    [],
  )

  return <FormInput
    ref={drop}
    name='name'
    label=''
    placeholder='Enter a variable'
    value={name}
    onChange={(value) => {
      setName(value.target.value)
      handleNameChange(rule.id, value.target.value)
    }} />
}

