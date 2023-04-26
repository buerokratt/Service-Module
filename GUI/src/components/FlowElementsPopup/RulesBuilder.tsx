import { useEffect, useState } from "react"
import Button from "../Button"
import { FormSelect, FormInput } from "../FormElements"
import Track from "../Track"
import ConditiobRuleType from "./ConditiobRuleType"
import ConditionInput from "./ConditionInput"
import VariableAsTag from "./VariableAsTag"
import { v4 as uuidv4 } from 'uuid';
import conditionOptions from "./ConditionOptions"
import axios from "axios"
import { getClientInputAvailableVariables } from "../../resources/api-constants"
import './styles.scss'

interface RulesBuilderProps {
  rules: ConditiobRuleType[],
  setRules: (rules: ConditiobRuleType[]) => void,
}

const RulesBuilder: React.FC<RulesBuilderProps> = ({
  rules,
  setRules,
}) => {

  const [availableVariables, setAvailableVariables] = useState<string[]>([])

  useEffect(() => {
    axios.get(getClientInputAvailableVariables()).then((result) => {
      setAvailableVariables(result.data)
    })
  }, [])

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

  return <>
    {rules.map((rule, i) => <Track
      direction='vertical'
      align='stretch'
      className="popup-top-border-track"
      key={rule.id}>
      <Track justify='between'>
        <span>Rule {i + 1}</span>
        <Button
          appearance='text'
          className=""
          onClick={() => removeRule(rule.id)}
        >
          x
        </Button>
      </Track>
      <Track gap={16}>
        <ConditionInput rule={rule} handleNameChange={handleNameChange} />
        <Track className="flow-rule-container">
          <FormSelect
            name='condition'
            label=''
            options={conditionOptions}
            value={rule.condition}
            defaultValue={rule.condition}
            onSelectionChange={(selection) => handleConditionChange(rule.id, selection?.value)} />
        </Track>
        <FormInput
          name='value'
          label=''
          placeholder='...'
          value={rule.value}
          onChange={(value) => handleValueChange(rule.id, value.target.value)} />
      </Track>
    </Track>
    )}
    <Track className="popup-top-border-track">
      <Button appearance='text' onClick={addRule}>+ Add a rule</Button>
    </Track>

    <Track
      direction='vertical'
      align='left'
      gap={16}
      className="popup-top-border-track popup-darker-track"
    >
      <span>Available variables</span>
      <Track gap={7} className="flow-tags-container">
        {availableVariables.map((x) => <VariableAsTag key={x} value={x} />)}
      </Track>
    </Track>
  </>;
}

export default RulesBuilder
