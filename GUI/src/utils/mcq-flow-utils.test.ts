import { Edge, Node } from '@xyflow/react';
import { StepType } from 'types';
import { describe, expect, it } from 'vitest';

import { getEmptyMcqBranches, mcqHasEmptyBranches } from './mcq-flow-utils';

const mcqNode: Node = {
  id: 'mcq-1',
  type: 'custom',
  position: { x: 0, y: 0 },
  data: {
    stepType: StepType.MultiChoiceQuestion,
    multiChoiceQuestion: {
      question: 'Q?',
      buttons: [
        { id: '1', title: 'Yes', payload: '' },
        { id: '2', title: 'No', payload: '' },
      ],
    },
  },
};

describe('mcq-flow-utils', () => {
  it('finds empty branches connected to ghost nodes', () => {
    const nodes: Node[] = [
      mcqNode,
      { id: 'ghost-1', type: 'ghost', position: { x: 0, y: 0 }, data: {} },
      { id: 'step-1', type: 'custom', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'mcq-1', target: 'ghost-1', label: 'Yes' },
      { id: 'e2', source: 'mcq-1', target: 'step-1', label: 'No' },
    ];

    expect(getEmptyMcqBranches('mcq-1', nodes, edges)).toEqual([
      { edgeId: 'e1', label: 'Yes', ghostNodeId: 'ghost-1', handleIndex: 0 },
    ]);
    expect(mcqHasEmptyBranches('mcq-1', nodes, edges)).toBe(true);
  });

  it('returns false when all branches are connected', () => {
    const nodes: Node[] = [mcqNode, { id: 'step-1', type: 'custom', position: { x: 0, y: 0 }, data: {} }];
    const edges: Edge[] = [{ id: 'e1', source: 'mcq-1', target: 'step-1', label: 'Yes' }];

    expect(mcqHasEmptyBranches('mcq-1', nodes, edges)).toBe(false);
  });
});
