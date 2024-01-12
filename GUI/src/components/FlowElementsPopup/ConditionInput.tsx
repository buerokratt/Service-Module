import { useEffect, useState } from "react"
import { useDrop } from "react-dnd"
import { useTranslation } from "react-i18next"
import { ConditionRuleType } from "../../types"
import { FormInput } from "../FormElements"
import useFlowStore from "store/flow.store"

interface ConditionInputProps {
  rule: ConditionRuleType,
}

const ConditionInput: React.FC<ConditionInputProps> = ({ rule }) => {
  const { t } = useTranslation();
  
  const [name, setName] = useState(rule.name)
  const handleFieldChange = useFlowStore.getState().handleFieldChange;
  
  const handleNameChange = (value?: string) => handleFieldChange(rule.id, 'name', value);

  const [_, drop] = useDrop(
    () => ({
      accept: 'tags',
      drop(_item: any, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) return;
        setName(rule.name + ' ' + _item.value)
        handleNameChange(name + ' ' + _item.value)
      },
    }),
    [],
  )

  return <FormInput
    ref={drop}
    name='name'
    label=''
    placeholder={t("serviceFlow.popup.insertVariable") ?? ""}
    value={name}
    onChange={(value) => {
      setName(value.target.value)
      handleNameChange(value.target.value)
    }} />
}

export default ConditionInput
