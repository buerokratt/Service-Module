import { v4 as uuidv4 } from 'uuid';
import { Assign } from 'types';

export interface RuleGroupBuilderProps {
  group?: Group;
  onRemove?: (id: string) => void;
  onChange: (config: any) => void;
  seedGroup?: any;
}

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  fieldDragElement?: Assign;
  valueDragElement?: Assign;
  isFieldManual?: boolean;
  isValueManual?: boolean;
}

export type GroupType = 'and' | 'or';

export interface Group {
  id: string;
  children: GroupOrRule[];
  type: GroupType;
  not: boolean;
}

export type GroupOrRule = Group | Rule;

export const isInstanceOfRule = (x: GroupOrRule): boolean => 'operator' in x;

export const getInitialRule = () => {
  return {
    id: uuidv4(),
    field: '',
    operator: '',
    value: '',
    fieldDragElement: undefined,
    valueDragElement: undefined,
    isFieldManual: false,
    isValueManual: false,
  };
};

export const getInitialGroup = () => {
  return {
    id: uuidv4(),
    children: [getInitialRule()],
    type: 'and',
    not: false,
  } as Group;
};
