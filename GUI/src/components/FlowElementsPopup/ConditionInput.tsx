import { useEffect, useState } from "react"
import { useDrop } from "react-dnd"
import { FormInput } from "../FormElements"
import ConditiobRuleType from "./ConditiobRuleType"

interface ConditiobInputProps {
  rule: ConditiobRuleType,
  handleNameChange: (id: string, value: string) => void
}

const ConditionInput: React.FC<ConditiobInputProps> = ({ rule, handleNameChange }) => {
  const [name, setName] = useState(rule.name)

  const [_, drop] = useDrop(
    () => ({
      accept: 'tags',
      drop(_item: any, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) return;
        setName(rule.name + ' ' + _item.value)
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

export default ConditionInput
