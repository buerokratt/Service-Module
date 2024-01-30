import { v4 as uuidv4 } from 'uuid';

export interface RuleGroupBuilderProps {
  group?: Group;
  onRemove?: (id: string) => void;
  onChange: (config: any) => void;
}

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export type GroupType = 'and' | 'or';

export interface Group {
  id: string;
  children: (Rule | Group)[];
  type: GroupType;
  not: boolean;
}

export const isInstanceOfRule = (x: Rule | Group): boolean => 'operator' in x;

export const getInitialRule = () => {
  return {
    id: uuidv4(),
    field: '',
    operator: '',
    value: '',
  };
}

export const getInitialGroup = () => {
  return {
    id: uuidv4(),
    children: [getInitialRule()],
    type: 'and',
    not: false,
  } as Group;
}
