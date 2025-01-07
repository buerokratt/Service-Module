import { v4 as uuidv4 } from 'uuid';

export interface ElementGroupBuilderProps {
  group?: AssignGroup;
  onRemove?: (id: string) => void;
  onChange: (config: any) => void;
  seedGroup?: any;
}

export interface Assign {
  id: string;
  key: string;
  value: string;
}

export interface AssignGroup {
  id: string;
  children: Assign[];
}

export const getInitialElement = () => {
  return {
    id: uuidv4(),
    key: '',
    value: '',
  };
}

export const getInitialAssignGroup = () => {
  return {
    id: uuidv4(),
    children: [getInitialElement()],
  } as AssignGroup;
};
