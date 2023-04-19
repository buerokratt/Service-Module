import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Popup from "../Popup";
import { SwitchBox } from "../FormElements";
import { Button, Track } from "..";
import ConditiobRuleType from "./ConditiobRuleType";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import './styles.scss'

const FlowElementsPopup = ({ node, onClose, onSave, addRuleCount, oldRules }: any) => {
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(node?.isYesNoQuestion ?? false)
  const [rules, setRules] = useState<ConditiobRuleType[]>(node?.rules ?? [])

  if (!node) {
    return <></>
  }

  const type = node.type;
  const title = type === 'input' ? "Client Input" : type === "file-generate" ? "File Generate" : "Hello";

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
        <Track justify="between" className="flow-item-footer">
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
          <Track direction='vertical' align='stretch' className="flow-body-reverse-margin">
            <Track gap={16} className="flow-body-padding">
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
            {isYesNoQuestion && <YesNoPopupContent />}
            {
              !isYesNoQuestion &&
              <RulesBuilder
                rules={rules}
                setRules={setRules}
              />
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

export default FlowElementsPopup
