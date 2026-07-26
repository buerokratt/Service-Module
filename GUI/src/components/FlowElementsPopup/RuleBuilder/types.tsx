import { Assign } from 'types';
import { v4 as uuidv4 } from 'uuid';

export interface RuleGroupBuilderProps {
  group?: Group;
  onRemove?: (id: string) => void;
  onChange: (config: any) => void;
  seedGroup?: Group | GroupOrRule[];
}

export type GroupType = 'and' | 'or';

interface WithConnector {
  connector?: GroupType;
  connectorNot?: boolean;
}

export interface Rule extends WithConnector {
  id: string;
  field: string;
  operator: string;
  value: string;
  fieldDragElement?: Assign;
  valueDragElement?: Assign;
  isFieldManual?: boolean;
  isValueManual?: boolean;
}

export interface Group extends WithConnector {
  id: string;
  children: GroupOrRule[];
  not: boolean;
  type?: GroupType;
}

export type GroupOrRule = Group | Rule;

export const isInstanceOfRule = (x: GroupOrRule): boolean => 'operator' in x;

export const getInitialRule = (connector: GroupType = 'and') => {
  return {
    id: uuidv4(),
    field: '',
    operator: '',
    value: '',
    fieldDragElement: undefined,
    valueDragElement: undefined,
    isFieldManual: false,
    isValueManual: false,
    connector,
    connectorNot: false,
  };
};

export const getInitialGroup = (connector: GroupType = 'and') => {
  return {
    id: uuidv4(),
    children: [getInitialRule()],
    not: false,
    connector,
    connectorNot: false,
  } as Group;
};

export const withMigratedConnectors = (children: GroupOrRule[], legacyType?: GroupType): GroupOrRule[] =>
  children.map((child, index) => ({
    ...child,
    connector: child.connector ?? (index === 0 ? undefined : (legacyType ?? 'and')),
    connectorNot: child.connectorNot ?? false,
  }));
