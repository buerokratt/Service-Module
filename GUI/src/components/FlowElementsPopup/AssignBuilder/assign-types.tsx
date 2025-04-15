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
  data?: unknown;
}
