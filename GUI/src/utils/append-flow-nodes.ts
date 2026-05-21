import { Edge, Node } from '@xyflow/react';
import { updateFlowInputRules } from 'services/flow-builder';
import useServiceStore from 'store/new-services.store';
import { StepType } from 'types';
import { generateUniqueId, generateUniqueLabel } from 'utils/flow-utils';

export const appendFlowNodes = (
  currentNodes: Node[],
  currentEdges: Edge[],
  importedNodes: Node[],
  importedEdges: Edge[],
): { nodes: Node[]; edges: Edge[] } => {
  const nodesToAdd = importedNodes.filter((node) => node.type !== 'start' && node.type !== 'ghost');
  const importedIds = new Set(nodesToAdd.map((node) => node.id));
  const edgesToAdd = importedEdges.filter((edge) => importedIds.has(edge.source) && importedIds.has(edge.target));

  if (nodesToAdd.length === 0) {
    return { nodes: currentNodes, edges: currentEdges };
  }

  const store = useServiceStore.getState();
  const idMap = new Map<string, string>();
  const processedLabels = new Set<string>();

  const newNodes = nodesToAdd.map((node) => {
    const newId = generateUniqueId();
    idMap.set(node.id, newId);

    const labelContext = [...currentNodes];
    processedLabels.forEach((label) => {
      labelContext.push({ id: 'virtual', data: { label }, position: { x: 0, y: 0 } });
    });
    const uniqueLabel = generateUniqueLabel(node.data?.label as string, labelContext);
    processedLabels.add(uniqueLabel);

    return {
      ...node,
      id: newId,
      selected: false,
      data: {
        ...node.data,
        label: uniqueLabel,
        onDelete: store.onDelete,
        setClickedNode: store.setClickedNode,
        onEdit: store.handleNodeEdit,
        update: updateFlowInputRules,
      },
    };
  });

  const newEdges = edgesToAdd.map((edge) => ({
    ...edge,
    id: generateUniqueId(),
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
  }));

  const ghostNodes: Node[] = [];
  const ghostEdges: Edge[] = [];

  const addGhost = (sourceId: string, x: number, y: number, label: string) => {
    const ghostNode: Node = {
      id: generateUniqueId(),
      type: 'ghost',
      position: { x, y },
      data: { type: 'ghost' },
      className: 'ghost',
      selectable: false,
      draggable: false,
    };
    ghostEdges.push({
      id: generateUniqueId(),
      source: sourceId,
      target: ghostNode.id,
      type: 'step',
      animated: true,
      deletable: false,
      label,
    });
    ghostNodes.push(ghostNode);
  };

  nodesToAdd.forEach((node) => {
    const newId = idMap.get(node.id);
    if (!newId) return;

    const stepType = node.data?.stepType;
    if (stepType === StepType.Condition || stepType === StepType.Input) {
      ['Success', 'Failure'].forEach((label, index) => {
        if (!edgesToAdd.some((edge) => edge.source === node.id && edge.label === label)) {
          addGhost(newId, node.position.x + 200, node.position.y + index * 100, label);
        }
      });
    } else if (stepType === StepType.MultiChoiceQuestion) {
      const buttons = (node.data?.multiChoiceQuestion as { buttons?: { title?: unknown }[] })?.buttons ?? [
        { title: 'Jah' },
        { title: 'Ei' },
      ];
      buttons.forEach((button, index) => {
        if (!edgesToAdd.some((edge) => edge.source === node.id && edge.label === button.title)) {
          const title = typeof button.title === 'string' ? button.title : String(button.title ?? '');
          addGhost(newId, node.position.x + 200, node.position.y + index * 100, title);
        }
      });
    }
  });

  const endNodes = nodesToAdd.filter((node) => !edgesToAdd.some((edge) => edge.source === node.id));
  const skipEndGhost = new Set([
    StepType.FinishingStepEnd,
    StepType.FinishingStepRedirect,
    StepType.DynamicChoices,
    StepType.Condition,
    StepType.Input,
    StepType.MultiChoiceQuestion,
  ]);

  endNodes.forEach((node) => {
    const newId = idMap.get(node.id);
    if (!newId || skipEndGhost.has(node.data?.stepType as StepType)) return;
    addGhost(newId, node.position.x, node.position.y, '+');
  });

  return {
    nodes: [...currentNodes, ...newNodes, ...ghostNodes],
    edges: [...currentEdges, ...newEdges, ...ghostEdges],
  };
};
