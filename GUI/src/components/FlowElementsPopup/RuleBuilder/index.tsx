import { Icon, Track } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdDeleteOutline } from 'react-icons/md';

import ConnectorToggle from './ConnectorToggle';
import RuleElement from './ruleElement';
import { Group, GroupOrRule, isInstanceOfRule, Rule, RuleGroupBuilderProps } from './types';
import { useRuleBuilder } from './useRuleBuilder';
import '../styles.scss';

const RuleBuilder: React.FC<RuleGroupBuilderProps> = ({ group, onRemove, onChange, seedGroup }) => {
  const { t } = useTranslation();
  const {
    groupInfo,
    elements,
    addRule,
    addGroup,
    remove,
    toggleNot,
    changeConnector,
    toggleConnectorNot,
    changeRule,
    onSubGroupChange,
  } = useRuleBuilder({
    group,
    root: !onRemove,
    onChange,
    seedGroup,
  });

  const notButtonClassName = groupInfo.not ? 'rule-red' : 'rule-gray';

  return (
    <Track gap={16} direction="vertical" align="stretch" className="rule-action-container">
      <Track justify="between">
        <Track>
          <button className={`small-rule-group-button ${notButtonClassName}`} onClick={toggleNot}>
            {t('serviceFlow.popup.not')}
          </button>
        </Track>
        <Track gap={8}>
          <button className="small-rule-button rule-blue" onClick={addRule}>
            {t('serviceFlow.popup.addRule')}
          </button>
          <button className="small-rule-button rule-blue" onClick={addGroup}>
            {t('serviceFlow.popup.addGroup')}
          </button>
          {onRemove && (
            <button className="small-rule-button rule-red" onClick={() => onRemove(group!.id)}>
              <Icon icon={<MdDeleteOutline />} />
            </button>
          )}
        </Track>
      </Track>
      {elements?.map((element: GroupOrRule, index: number) => (
        <React.Fragment key={element.id}>
          {index > 0 && (
            <ConnectorToggle
              connector={element.connector ?? 'and'}
              connectorNot={!!element.connectorNot}
              onChangeConnector={(connector) => changeConnector(element.id, connector)}
              onToggleNot={() => toggleConnectorNot(element.id)}
            />
          )}
          {isInstanceOfRule(element) ? (
            <RuleElement rule={element as Rule} onRemove={remove} onChange={changeRule} />
          ) : (
            <RuleBuilder group={element as Group} onRemove={remove} onChange={onSubGroupChange(element.id)} />
          )}
        </React.Fragment>
      ))}
    </Track>
  );
};

export default RuleBuilder;
