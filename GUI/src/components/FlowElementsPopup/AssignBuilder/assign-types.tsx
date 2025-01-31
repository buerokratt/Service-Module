import { v4 as uuidv4 } from 'uuid';

export interface ElementGroupBuilderProps {
  assignElements?: Assign[];
  onRemove?: (id: string) => void;
  onChange: (config: any) => void;
  seedGroup?: any;
}

export interface Assign {
  id: string;
  key: string;
  value: string;
}

export const getInitialElement = () => {
  return {
    id: uuidv4(),
    key: '',
    value: '',
  };
}
