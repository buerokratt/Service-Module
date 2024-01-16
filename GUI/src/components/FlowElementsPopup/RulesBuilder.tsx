import { useTranslation } from "react-i18next"
import { useCallback, useState } from "react";
import Button from "../Button"
import { FormSelect, FormInput } from "../FormElements"
import Track from "../Track"
import ConditionInput from "./ConditionInput"
import VariableAsTag from "./VariableAsTag"
import useFlowStore, { conditionOptions } from 'store/flow.store'
import useServiceStore from "store/new-services.store"
import type { JsonGroup, Config, ImmutableTree, BuilderProps } from 'react-awesome-query-builder';
import { Utils as QbUtils, Query, Builder, BasicConfig } from 'react-awesome-query-builder';
import "react-awesome-query-builder/css/styles.scss";
import './styles.scss'

const InitialConfig = BasicConfig;

const config: Config = {
  ...InitialConfig,
  fields: {
      condition: {
          type: 'text',
      },
  },
  //  operators: conditionOptions.map(x => ({name: x.value, label: x.label})),

  // settings: {
  //   setOpOnChangeField: ['none'],
  // //   // renderField: (props: any) => <input {...props} />,
  // }
};

const RulesBuilder: React.FC = () => {
  const queryValue: JsonGroup = { id: QbUtils.uuid(), type: "group" };

  const { t } = useTranslation();
  const rules = useFlowStore(x => x.rules);

  const [state, setState] = useState({
    tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
    config: config
  });

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    setState(prevState => ({ ...prevState, tree: immutableTree, config: config }));

    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  }, []);

  const handleFieldChange = useFlowStore.getState().handleFieldChange;
  const variables = useServiceStore(state => state.getFlatVariables());

  const renderBuilder = useCallback((props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  return <>
      <Query
        {...config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
    {/* {rules.map((rule, i) => <Track
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
    </Track> */}
  </>;
}

export default RulesBuilder
