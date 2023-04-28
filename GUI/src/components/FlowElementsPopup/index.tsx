import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Popup from "../Popup";
import { Button, Track } from "..";
import FileGenerateContent from "./FileGenerateContent";
import ConditionBuilderContent from "./ConditionBuilderContent";
import ConditiobRuleType from "./ConditiobRuleType";
import './styles.scss'

interface FlowElementsPopupProps {
  node: any
  onClose: () => void
  onSave: (rules: (string | null)[]) => void
  oldRules: (string | null)[]
}

const FlowElementsPopup: React.FC<FlowElementsPopupProps> = ({ node, onClose, onSave, oldRules }) => {
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(node?.isYesNoQuestion ?? false)
  const [rules, setRules] = useState<ConditiobRuleType[]>(node?.rules ?? [])

  if (!node) return <></>

  const type = node.type;
  const title = getTitle(type)

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
              {
          type === 'input' &&
          <ConditionBuilderContent
            isYesNoQuestion={isYesNoQuestion}
            setIsYesNoQuestion={setIsYesNoQuestion}
            rules={rules}
            setRules={setRules}
          />
        }
        {type === 'file-generate' && <FileGenerateContent />}
      </DndProvider>
    </Popup >
  )
}

function getTitle(type: string) {
  if (type === 'input')
    return 'Client Input'
  else if (type === 'file-generate')
    return 'File Generate'

  return 'Hello'
}

export default FlowElementsPopup
