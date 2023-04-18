import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Popup from "../Popup";
import { FormInput, FormSelect, SwitchBox } from "../FormElements";
import { Button, Track } from "..";
import "reactflow/dist/style.css";

interface ConditiobRuleType {
  id: string
  name: string
  condition: string
  value: string
}

const FlowElementsPopup = ({ node, onClose, onSave, addRuleCount, oldRules }: any) => {
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
  }

  const handleSaveClick = () => {
    const count = isYesNoQuestion ? 2 : rules.length
    const result = []
    for (let i = 0; i < count; i++) {
      let item = null
      if (i < oldRules.length)
        item = oldRules[i]
      result.push(item)
    }
    onSave(result)
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
            <Button onClick={handleSaveClick}>
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

export default FlowElementsPopup
