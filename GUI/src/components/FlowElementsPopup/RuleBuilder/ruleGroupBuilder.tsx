import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Rule, RuleGroupBuilderProps, isInstanceOfRule } from './types';
import RuleElement from './ruleElement';
import { useRuleBuilder } from './useRuleBuilder';

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
   } = useRuleBuilder({ group, onRemove, onChange });

  return (
    <>
      <div style={{ margin: '10px', padding: '10px', background: '#f001', borderRadius: '4px', border: '1px solid #f002' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <button style={{ padding: '4px', minWidth: '40px', textAlign: 'center', background: groupInfo.not ? '#f00' : '#0001' }} onClick={toggleNot}>{t('serviceFlow.popup.not')}</button>
            <button style={{ padding: '4px', minWidth: '40px', textAlign: 'center', background: groupInfo.type === 'and' ? '#0b0' : '#0001' }} onClick={changeToAnd}>{t('serviceFlow.popup.and')}</button>
            <button style={{ padding: '4px', minWidth: '40px', textAlign: 'center', background: groupInfo.type === 'or' ? '#0b0' : '#0001' }} onClick={changeToOr}>{t('serviceFlow.popup.or')}</button>
          </div>
          <div>
            <button style={{ padding: '4px', margin: '4px', background: '#00f5' }} onClick={addRule}>{t('serviceFlow.popup.addRule')}</button>
            <button style={{ padding: '4px', margin: '4px', background: '#00f5' }} onClick={addGroup}>{t('serviceFlow.popup.addGroup')}</button>
            {
              onRemove &&
              <button style={{ padding: '4px', margin: '4px', background: '#f005' }} onClick={() => onRemove(group!.id)}>{t('serviceFlow.popup.remove')}</button>
            }
          </div>
        </div>
        {
          elements.map(element =>
            isInstanceOfRule(element)
            ? <RuleElement key={element.id} rule={element as Rule} onRemove={remove} />
            : <RuleGroupBuilder key={element.id} group={element as Group} onRemove={remove} onChange={onChange} />
          )
        }
      </div>
    </>
  );
};

export default RuleGroupBuilder;
