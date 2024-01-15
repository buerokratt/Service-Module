import { useTranslation } from "react-i18next"
import Button from "../Button"
import { FormSelect, FormInput } from "../FormElements"
import Track from "../Track"
import ConditionInput from "./ConditionInput"
import VariableAsTag from "./VariableAsTag"
import useFlowStore, { conditionOptions } from 'store/flow.store'
import './styles.scss'
import useServiceStore from "store/new-services.store"

const RulesBuilder: React.FC = () => {
  const { t } = useTranslation();
  const rules = useFlowStore(x => x.rules);

  const handleFieldChange = useFlowStore.getState().handleFieldChange;
  const variables = useServiceStore(state => state.getFlatVariables());

  return <>
  <h1>ererer</h1>
    {rules.map((rule, i) => <Track
      direction='vertical'
      align='stretch'
      className="popup-top-border-track"
      key={rule.id}>
      <Track justify='between'>
        <span>{t("serviceFlow.rule")} {i + 1}</span>
        <Button
          appearance='text'
          className=""
          onClick={() => useFlowStore.getState().removeRule(rule.id)}
        >
          x
        </Button>
      </Track>
      <Track gap={16}>
        <ConditionInput rule={rule} />
        <FormSelect
          name='condition'
          label=''
          options={conditionOptions}
          value={rule.condition}
          defaultValue={rule.condition}
          onSelectionChange={(selection) => handleFieldChange(rule.id, 'condition', selection?.value)}
        />
        <FormInput
          name='value'
          label=''
          placeholder='...'
          value={rule.value}
          onChange={(value) => handleFieldChange(rule.id, 'value', value.target.value)} 
        />
      </Track>
    </Track>
    )}
    <Track className="popup-top-border-track">
      <Button appearance='text' onClick={useFlowStore.getState().addRule}>{t("serviceFlow.popup.addRule")}</Button>
    </Track>

    <Track
      direction='vertical'
      align='left'
      gap={16}
      className="popup-top-border-track popup-darker-track"
    >
      <span>{t("serviceFlow.popup.availableVariables")}</span>
      <Track gap={7} className="flow-tags-container">
        {variables.map(x => <VariableAsTag key={x} value={x} color='yellow' />)}
      </Track>
    </Track>
  </>;
}

export default RulesBuilder
