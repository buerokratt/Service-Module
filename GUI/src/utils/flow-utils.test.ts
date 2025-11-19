import { Node } from '@xyflow/react';
import { StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';
import { Step } from 'types/step';
import { describe, expect, it, vi } from 'vitest';

import {
  getNodeLabel,
  validateAssignStep,
  validateDynamicChoicesStep,
  validateFileGenerateStep,
  validateFileSignStep,
  validateInputOrConditionStep,
  validateMultiChoiceQuestionStep,
  validateOpenWebpageStep,
  validateStep,
  validateTextfieldStep,
  validateUserDefinedStep,
} from './flow-utils';

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn((key: string) => key),
}));

describe('validateStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.Textfield,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return valid for readonly nodes', () => {
    const readonlyNode = { ...mockNode, readonly: true };
    const result = validateStep(readonlyNode);
    expect(result).toEqual({ isValid: true });
  });

  it('should return invalid for failed testing', () => {
    const failedNode = { ...mockNode, testingPassed: false };
    const result = validateStep(failedNode);
    expect(result).toEqual({ isValid: false });
  });

  it('should delegate to appropriate validation function for each step type', () => {
    const testCases = [
      { stepType: StepType.Input, expectedValid: false },
      { stepType: StepType.Condition, expectedValid: false },
      { stepType: StepType.MultiChoiceQuestion, expectedValid: false },
      { stepType: StepType.DynamicChoices, expectedValid: false },
      { stepType: StepType.Assign, expectedValid: false },
      { stepType: StepType.Textfield, expectedValid: false },
      { stepType: StepType.UserDefined, expectedValid: true },
      { stepType: StepType.OpenWebpage, expectedValid: false },
      { stepType: StepType.FileGenerate, expectedValid: false },
      { stepType: StepType.FileSign, expectedValid: false },
    ];

    testCases.forEach(({ stepType, expectedValid }) => {
      const node = { ...mockNode, stepType };
      const result = validateStep(node);
      expect(result.isValid).toBe(expectedValid);
    });
  });
});

describe('validateInputOrConditionStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.Input,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return error when rules are undefined', () => {
    const node = { ...mockNode, rules: undefined };
    const result = validateInputOrConditionStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.client-input-rules-required',
    });
  });

  it('should return error when rules children are empty', () => {
    const node = {
      ...mockNode,
      rules: {
        id: 'test-id',
        children: [],
        type: 'and' as const,
        not: false,
      },
    };
    const result = validateInputOrConditionStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.client-input-rules-required',
    });
  });

  it('should return error when rules have invalid fields', () => {
    const node = {
      ...mockNode,
      rules: {
        id: 'test-id',
        children: [{ id: 'rule-1', field: '', operator: 'equals', value: 'test' }],
        type: 'and' as const,
        not: false,
      },
    };
    const result = validateInputOrConditionStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.client-input-rule-fields-required',
    });
  });

  it('should return valid when rules are properly configured', () => {
    const node = {
      ...mockNode,
      rules: {
        id: 'test-id',
        children: [{ id: 'rule-1', field: 'testField', operator: 'equals', value: 'testValue' }],
        type: 'and' as const,
        not: false,
      },
    };
    const result = validateInputOrConditionStep(node);
    expect(result).toEqual({ isValid: true });
  });

  it('should return different error messages for Input vs Condition steps', () => {
    const inputNode = { ...mockNode, stepType: StepType.Input };
    const conditionNode = { ...mockNode, stepType: StepType.Condition };

    const inputResult = validateInputOrConditionStep(inputNode);
    const conditionResult = validateInputOrConditionStep(conditionNode);

    expect(inputResult.error).toContain('client-input');
    expect(conditionResult.error).toContain('condition');
  });
});

describe('validateMultiChoiceQuestionStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.MultiChoiceQuestion,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return error when question is missing', () => {
    const node = {
      ...mockNode,
      multiChoiceQuestion: {
        question: '',
        buttons: [{ id: 'btn-1', title: 'Button 1', payload: 'payload1' }],
      },
    };
    const result = validateMultiChoiceQuestionStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.question-required',
    });
  });

  it('should return error when button titles are empty', () => {
    const node = {
      ...mockNode,
      multiChoiceQuestion: {
        question: 'Test question',
        buttons: [
          { id: 'btn-1', title: '', payload: 'payload1' },
          { id: 'btn-2', title: 'Valid Button', payload: 'payload2' },
        ],
      },
    };
    const result = validateMultiChoiceQuestionStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.button-titles-required',
    });
  });

  it('should return valid when question and buttons are properly configured', () => {
    const node = {
      ...mockNode,
      multiChoiceQuestion: {
        question: 'Test question',
        buttons: [
          { id: 'btn-1', title: 'Button 1', payload: 'payload1' },
          { id: 'btn-2', title: 'Button 2', payload: 'payload2' },
        ],
      },
    };
    const result = validateMultiChoiceQuestionStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateDynamicChoicesStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.DynamicChoices,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return error when list is missing', () => {
    const node = {
      ...mockNode,
      dynamicChoices: { list: '', serviceName: 'test', key: 'test', payloadKeys: 'test' },
    };
    const result = validateDynamicChoicesStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.dynamic-choices-list-required',
    });
  });

  it('should return error when service name is missing', () => {
    const node = {
      ...mockNode,
      dynamicChoices: { list: 'test', serviceName: '', key: 'test', payloadKeys: 'test' },
    };
    const result = validateDynamicChoicesStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.service-name-required',
    });
  });

  it('should return error when key is missing', () => {
    const node = {
      ...mockNode,
      dynamicChoices: { list: 'test', serviceName: 'test', key: '', payloadKeys: 'test' },
    };
    const result = validateDynamicChoicesStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.key-required',
    });
  });

  it('should return valid when all fields are provided', () => {
    const node = {
      ...mockNode,
      dynamicChoices: { list: 'test', serviceName: 'test', key: 'test', payloadKeys: 'test' },
    };
    const result = validateDynamicChoicesStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateAssignStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.Assign,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return error when assign elements are undefined', () => {
    const node = { ...mockNode, assignElements: undefined };
    const result = validateAssignStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.assign-elements-required',
    });
  });

  it('should return error when assign elements are empty', () => {
    const node = { ...mockNode, assignElements: [] };
    const result = validateAssignStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.assign-elements-required',
    });
  });

  it('should return error when assign elements have empty key or value', () => {
    const node = {
      ...mockNode,
      assignElements: [
        { id: 'assign-1', key: 'validKey', value: 'validValue' },
        { id: 'assign-2', key: '', value: 'validValue' },
      ],
    };
    const result = validateAssignStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.key-value-fields-required',
    });
  });

  it('should return valid when assign elements are properly configured', () => {
    const node = {
      ...mockNode,
      assignElements: [
        { id: 'assign-1', key: 'key1', value: 'value1' },
        { id: 'assign-2', key: 'key2', value: 'value2' },
      ],
    };
    const result = validateAssignStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateTextfieldStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.Textfield,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return error when message is missing', () => {
    const node = { ...mockNode, message: '' };
    const result = validateTextfieldStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.message-text-missing',
    });
  });

  it('should return error when message is undefined', () => {
    const node = { ...mockNode, message: undefined };
    const result = validateTextfieldStep(node);
    expect(result).toEqual({
      isValid: false,
      error: 'chat.service-flow-error.message-text-missing',
    });
  });

  it('should return valid when message is provided', () => {
    const node = { ...mockNode, message: 'Test message' };
    const result = validateTextfieldStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateUserDefinedStep', () => {
  it('should always return valid', () => {
    const result = validateUserDefinedStep();
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateOpenWebpageStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.OpenWebpage,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return invalid when link is missing', () => {
    const node = { ...mockNode, link: '', linkText: 'Test' };
    const result = validateOpenWebpageStep(node);
    expect(result).toEqual({ isValid: false });
  });

  it('should return invalid when linkText is missing', () => {
    const node = { ...mockNode, link: 'https://test.com', linkText: '' };
    const result = validateOpenWebpageStep(node);
    expect(result).toEqual({ isValid: false });
  });

  it('should return valid when both link and linkText are provided', () => {
    const node = { ...mockNode, link: 'https://test.com', linkText: 'Test Link' };
    const result = validateOpenWebpageStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateFileGenerateStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.FileGenerate,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return invalid when fileName is missing', () => {
    const node = { ...mockNode, fileName: '', fileContent: 'Test content' };
    const result = validateFileGenerateStep(node);
    expect(result).toEqual({ isValid: false });
  });

  it('should return invalid when fileContent is missing', () => {
    const node = { ...mockNode, fileName: 'test.txt', fileContent: '' };
    const result = validateFileGenerateStep(node);
    expect(result).toEqual({ isValid: false });
  });

  it('should return valid when both fileName and fileContent are provided', () => {
    const node = { ...mockNode, fileName: 'test.txt', fileContent: 'Test content' };
    const result = validateFileGenerateStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('validateFileSignStep', () => {
  const mockNode: NodeDataProps = {
    label: 'Test Node',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'test',
    stepType: StepType.FileSign,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
  };

  it('should return invalid when signOption is missing', () => {
    const node = { ...mockNode, signOption: undefined };
    const result = validateFileSignStep(node);
    expect(result).toEqual({ isValid: false });
  });

  it('should return valid when signOption is provided', () => {
    const node = { ...mockNode, signOption: { label: 'Test', value: 'test' } };
    const result = validateFileSignStep(node);
    expect(result).toEqual({ isValid: true });
  });
});

describe('getNodeLabel', () => {
  const createMockStep = (label: string, type: StepType): Step => ({
    id: 1,
    label,
    type,
  });

  const createMockNode = (label: string, stepType: StepType): Node => ({
    id: '1',
    type: 'step',
    position: { x: 0, y: 0 },
    data: {
      label,
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      type: 'step',
      stepType,
      readonly: false,
      childrenCount: 0,
      setClickedNode: vi.fn(),
    },
  });

  it('should return label with number 1 for first node of a type', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 1');
  });

  it('should extract base label from step label with dashes', () => {
    const step = createMockStep('Prefix - Test Step - Suffix', StepType.Textfield);
    const nodes: Node[] = [];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Suffix - 1');
  });

  it('should handle step label without dashes', () => {
    const step = createMockStep('SimpleLabel', StepType.Textfield);
    const nodes: Node[] = [];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('SimpleLabel - 1');
  });

  it('should handle empty step label', () => {
    const step = createMockStep('', StepType.Textfield);
    const nodes: Node[] = [];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe(' - 1');
  });

  it('should increment number for existing nodes of same type', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - 1', StepType.Textfield),
      createMockNode('Test Step - 2', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 3');
  });

  it('should find next available number when there are gaps', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - 1', StepType.Textfield),
      createMockNode('Test Step - 3', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 2');
  });

  it('should only consider nodes of the same step type', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - 1', StepType.Textfield),
      createMockNode('Test Step - 2', StepType.Input), // Different type - should be ignored
      createMockNode('Test Step - 3', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 2'); // Only considers Textfield nodes (1 and 3), so next is 2
  });

  it('should handle nodes with different base labels', () => {
    const step = createMockStep('New Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Old Step - 1', StepType.Textfield),
      createMockNode('Old Step - 2', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('New Step - 1');
  });

  it('should handle nodes with non-numeric suffixes', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - abc', StepType.Textfield),
      createMockNode('Test Step - def', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 1');
  });

  it('should handle mixed numeric and non-numeric suffixes', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - 1', StepType.Textfield),
      createMockNode('Test Step - abc', StepType.Textfield),
      createMockNode('Test Step - 2', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 3');
  });

  it('should handle nodes without number suffixes', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step', StepType.Textfield),
      createMockNode('Test Step - 1', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 2');
  });

  it('should handle complex label patterns', () => {
    const step = createMockStep('Complex - Label - Pattern', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Pattern - 1', StepType.Textfield),
      createMockNode('Pattern - 2', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Pattern - 3');
  });

  it('should handle large numbers correctly', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = Array.from({ length: 10 }, (_, i) =>
      createMockNode(`Test Step - ${i + 1}`, StepType.Textfield),
    );

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 11');
  });

  it('should handle unordered existing numbers', () => {
    const step = createMockStep('Test Step', StepType.Textfield);
    const nodes: Node[] = [
      createMockNode('Test Step - 5', StepType.Textfield),
      createMockNode('Test Step - 2', StepType.Textfield),
      createMockNode('Test Step - 8', StepType.Textfield),
      createMockNode('Test Step - 1', StepType.Textfield),
    ];

    const result = getNodeLabel(step, nodes);
    expect(result).toBe('Test Step - 3');
  });
});
