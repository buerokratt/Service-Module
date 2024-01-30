import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Rule, RuleGroupBuilderProps, isInstanceOfRule } from './types';
import RuleElement from './ruleElement';
import { useRuleBuilder } from './useRuleBuilder';
import { Icon, Track } from 'components';
import { MdDeleteOutline } from 'react-icons/md';

const RuleGroupBuilder: React.FC<RuleGroupBuilderProps> = ({ group, onRemove, onChange }) => {
  const { t } = useTranslation();
  const {
    groupInfo,
    elements,
    addRule,
    addGroup,
    remove,
    toggleNot,
    changeToAnd,
    changeToOr,
    changeRule,
  } = useRuleBuilder({ 
    group,
    root: !onRemove,
    onChange,
   });

  const andButtonClassName = groupInfo.type === 'and' ? 'rule-green' : 'rule-gray';
  const orButtonClassName = groupInfo.type === 'or' ? 'rule-green' : 'rule-gray';
  const notButtonClassName = groupInfo.not ? 'rule-red' : 'rule-gray';

  return (
    <Track gap={16} direction='vertical' align='stretch' className='rule-action-container'>
      <Track justify='between'>
        <Track>
          <button className={`small-rule-group-button ${notButtonClassName}`} onClick={toggleNot}>
            {t('serviceFlow.popup.not')}
          </button>
          <button className={`small-rule-group-button ${andButtonClassName}`} onClick={changeToAnd}>
            {t('serviceFlow.popup.and')}
          </button>
          <button className={`small-rule-group-button ${orButtonClassName}`} onClick={changeToOr}>
            {t('serviceFlow.popup.or')}
          </button>
        </Track>
        <Track gap={8}>
          <button className='small-rule-button rule-blue' onClick={addRule}>
            {t('serviceFlow.popup.addRule')}
          </button>
          <button className='small-rule-button rule-blue' onClick={addGroup}>
            {t('serviceFlow.popup.addGroup')}
          </button>
          {
            onRemove &&
            <button className='small-rule-button rule-red' onClick={() => onRemove(group!.id)}>
              <Icon icon={<MdDeleteOutline />} />
            </button>
          }
        </Track>
      </Track>
      {
        elements.map(element =>
          isInstanceOfRule(element)
            ? <RuleElement key={element.id} rule={element as Rule} onRemove={remove} onChange={changeRule} />
            : <RuleGroupBuilder key={element.id} group={element as Group} onRemove={remove} onChange={onChange} />
        )
      }
    </Track>
  );
};

export default RuleGroupBuilder;
