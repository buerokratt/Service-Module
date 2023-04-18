import { FC, useEffect, useState } from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import { MarkerType, Node, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
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
  FlowBuilder,
} from "../components";
import "./ServiceFlowPage.scss";
import { v4 as uuidv4 } from 'uuid';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./ServiceFlowPage.scss";
import { Step } from "../types/step";
import Popup from "../components/Popup";
import { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";

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
    { id: 8, label: "End conversation", type: "finishing-step-end" },
    {
      id: 9,
      label: "Direct to Customer Support",
      type: "finishing-step-redirect",
    },
  ];
  const [visiblePopupNode, setVisiblePopupNode] = useState<Node | null>(null);
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([initialEdge]);
  const navigate = useNavigate();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: 'auto', maxHeight: '40vh' };

  return (
    <>
      <NewServiceHeader activeStep={3} continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)} />
      <h1 style={{ padding: 16 }}>Teenusvoog "Raamatu laenutus"</h1>
      <ElementsPopup
        onClose={() => setVisiblePopupNode(null)}
        onSave={() => setVisiblePopupNode(null)}
        node={visiblePopupNode}
        addRuleCount={() => setUpdatedRules([null, null, null])}
      />
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


interface ConditiobRuleType {
  id: string
  name: string
  condition: string
  value: string
}

const ElementsPopup = ({ node, onClose, onSave, addRuleCount }: any) => {
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(node?.isYesNoQuestion ?? false)
  const [rules, setRules] = useState<ConditiobRuleType[]>(node?.rules ?? [])
  console.log(node)

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
          </Track>
        }
      </DndProvider>

      {type !== 'input' &&
        <>
          <p>hello</p>
          <Button onClick={addRuleCount}>update rule count</Button>
        </>
      }
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

