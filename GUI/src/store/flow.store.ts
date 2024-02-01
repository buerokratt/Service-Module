import { create } from 'zustand';
import { v4 as uuidv4 } from "uuid";
import { ConditionRuleType } from 'types';

interface FlowState {
  rules: ConditionRuleType[];
  addRule: () => void;
  removeRule: (id: string) => void;
  handleFieldChange: (id: string, field: string, value?: string) => void;
  isYesNoQuestion: boolean;
  setIsYesNoQuestion: (value: boolean) => void;
  setRules: (rules: ConditionRuleType[], isYesNoQuestion: boolean) => void;
  reset: () => void;
}

const useFlowStore = create<FlowState>((set, get, store) => ({
  rules: [],
  isYesNoQuestion: false,
  setRules: (rules, isYesNoQuestion) => {
    set({
      rules,
      isYesNoQuestion,
    });
  },
  reset: () => {
    set({
      rules: [],
      isYesNoQuestion: false,
    });
  },
  addRule: () => {
    set(state => ({
      rules: [
        ...state.rules,
        {
          id: uuidv4(),
          name: '',
          value: '',
          condition: conditionOptions[0].value,
        }
      ]
    }))
  },
  removeRule: (id: string) => {
    set(state => ({
      rules: state.rules.filter(x => x.id !== id),
    }))
  },
  handleFieldChange: (id: string, field: string, value?: string) => {
    if (!value) return;
    const updater = (x: any) => x.id === id ? { ...x, [field]: value } : x;
    set(state => ({
      rules: state.rules.map(updater),
    }));
  },
  setIsYesNoQuestion: (value: boolean) => {
    const rules = !value ? [] : [
      {
        id: uuidv4(),
        name: '',
        condition: 'Yes',
        value: '',
      },
      {
        id: uuidv4(),
        name: '',
        condition: 'No',
        value: '',
      },
    ];

    set({
      rules,
      isYesNoQuestion: value,
    });
  },
}));

export default useFlowStore;

export const conditionOptions = [ 
  '==', '===', '!=', '!==', '>', '<', '>=', '<='
].map(x=>({ label: x, value: x }))
