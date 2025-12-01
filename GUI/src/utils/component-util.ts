import React from 'react';
import { Assign, Step } from 'types';

export const ASSIGN_DRAG_TYPE = 'text/plain';

export const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
  event.dataTransfer.setData('application/reactflow-label', step.label);
  event.dataTransfer.setData('application/reactflow-type', step.type);
  event.dataTransfer.setData('application/reactflow-originalDefinedNodeId', step.data?.endpointId ?? '');
  event.dataTransfer.effectAllowed = 'move';
};

export const getDragData = (event: React.DragEvent<HTMLDivElement>): Assign => {
  event.preventDefault();

  // This should never happen
  if (!event.dataTransfer.getData(ASSIGN_DRAG_TYPE)) console.error('getDragData: No drag data found');

  return JSON.parse(event.dataTransfer.getData(ASSIGN_DRAG_TYPE));
};
