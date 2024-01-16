import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { conditionOptions } from 'store/flow.store';
import { Rule, getInitialRule } from "./types";

interface RuleElementProps {
  rule: Rule;
  onRemove: (id: string) => void;
}

const RuleElement: React.FC<RuleElementProps> = ({ rule, onRemove }) => {
  const { t } = useTranslation();
  const [currentRule, setCurrentRule] = useState(getInitialRule());

  return (
    <div style={{ padding: '10px', display: 'flex', gap: '16px' }}>
      <div style={{ width: '100%', display: 'flex', gap: '16px'}}>
        <input
          type="text"
          value={currentRule.field}
          name='field'
          onChange={(e) => setCurrentRule({ ...currentRule, field: e.target.value })}
          style={{ border: '1px solid black', width: '100%' }}
        />
        <select
          value={currentRule.operator}
          name='operator'
          onChange={(e) => setCurrentRule({ ...currentRule, operator: e.target.value })}
          style={{ border: '1px solid black' }}
        >
          {conditionOptions.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
        <input
          type="text"
          value={currentRule.value}
          name='value'
          onChange={(e) => setCurrentRule({ ...currentRule, value: e.target.value })}
          style={{ border: '1px solid black', width: '100%' }}
        />
      </div>
      <button style={{ padding: '4px', margin: '4px', background: '#f005' }} onClick={() => onRemove(rule.id)}>{t('serviceFlow.popup.remove')}</button>
    </div>
  )
}

export default RuleElement;
