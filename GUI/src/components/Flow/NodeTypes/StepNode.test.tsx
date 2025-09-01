import { render, screen } from '@testing-library/react';
import { StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';
import { describe, expect, it, vi } from 'vitest';

import StepNode, { isStepInvalid } from './StepNode';

describe('isStepInvalid', () => {
  const createMockData = (overrides: Partial<NodeDataProps> = {}): NodeDataProps => ({
    label: 'Test Step',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    type: 'step',
    stepType: StepType.Textfield,
    readonly: false,
    childrenCount: 0,
    setClickedNode: vi.fn(),
    ...overrides,
  });

  describe('testingPassed flag', () => {
    it('should return true when testingPassed is false', () => {
      const data = createMockData({ testingPassed: false });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should continue validation when testingPassed is true', () => {
      const data = createMockData({ testingPassed: true, readonly: true, message: 'test' });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('Input and Condition step types', () => {
    it('should return true when rules.children is undefined', () => {
      const data = createMockData({ stepType: StepType.Input });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when rules.children is empty array', () => {
      const data = createMockData({
        stepType: StepType.Input,
        rules: {
          children: [],
          id: '',
          type: 'and',
          not: false,
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when rule has empty values', () => {
      const data = createMockData({
        stepType: StepType.Input,
        rules: {
          children: [{ field: '', operator: '', value: '', id: 'test-id' }],
          id: '',
          type: 'and',
          not: false,
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when rule has valid values', () => {
      const data = createMockData({
        stepType: StepType.Input,
        rules: {
          children: [{ field: 'test', operator: 'equals', value: 'value', id: 'test-id' }],
          id: '',
          type: 'and',
          not: false,
        },
      });
      expect(isStepInvalid(data)).toBe(false);
    });

    it('should return true when group has empty children', () => {
      const data = createMockData({
        stepType: StepType.Condition,
        rules: {
          children: [
            {
              children: [],
              id: 'test-id',
              type: 'and',
              not: false,
            },
          ],
          id: '',
          type: 'and',
          not: false,
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });
  });

  describe('MultiChoiceQuestion step type', () => {
    it('should return true when question is missing', () => {
      const data = createMockData({
        stepType: StepType.MultiChoiceQuestion,
        multiChoiceQuestion: {
          buttons: [],
          question: '',
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when button has empty title', () => {
      const data = createMockData({
        stepType: StepType.MultiChoiceQuestion,
        multiChoiceQuestion: {
          question: 'Test question',
          buttons: [
            {
              title: '',
              id: '',
              payload: '',
            },
          ],
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when question and buttons are valid', () => {
      const data = createMockData({
        stepType: StepType.MultiChoiceQuestion,
        multiChoiceQuestion: {
          question: 'Test question',
          buttons: [
            {
              title: 'Option 1',
              id: '',
              payload: '',
            },
          ],
        },
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('DynamicChoices step type', () => {
    it('should return true when list is missing', () => {
      const data = createMockData({
        stepType: StepType.DynamicChoices,
        dynamicChoices: {
          serviceName: 'test',
          key: 'test',
          list: '',
          payloadKeys: '',
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when serviceName is missing', () => {
      const data = createMockData({
        stepType: StepType.DynamicChoices,
        dynamicChoices: {
          list: 'test',
          key: 'test',
          serviceName: '',
          payloadKeys: '',
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when key is missing', () => {
      const data = createMockData({
        stepType: StepType.DynamicChoices,
        dynamicChoices: {
          list: 'test',
          serviceName: 'test',
          key: '',
          payloadKeys: '',
        },
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when all required fields are present', () => {
      const data = createMockData({
        stepType: StepType.DynamicChoices,
        dynamicChoices: {
          list: 'test',
          serviceName: 'test',
          key: 'test',
          payloadKeys: '',
        },
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('UserDefined step type', () => {
    it('should return false for UserDefined step type', () => {
      const data = createMockData({ stepType: StepType.UserDefined });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('OpenWebpage step type', () => {
    it('should return true when link is missing', () => {
      const data = createMockData({
        stepType: StepType.OpenWebpage,
        linkText: 'Click here',
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when linkText is missing', () => {
      const data = createMockData({
        stepType: StepType.OpenWebpage,
        link: 'https://example.com',
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when both link and linkText are present', () => {
      const data = createMockData({
        stepType: StepType.OpenWebpage,
        link: 'https://example.com',
        linkText: 'Click here',
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('FileGenerate step type', () => {
    it('should return true when fileName is missing', () => {
      const data = createMockData({
        stepType: StepType.FileGenerate,
        fileContent: 'test content',
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when fileContent is missing', () => {
      const data = createMockData({
        stepType: StepType.FileGenerate,
        fileName: 'test.txt',
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when both fileName and fileContent are present', () => {
      const data = createMockData({
        stepType: StepType.FileGenerate,
        fileName: 'test.txt',
        fileContent: 'test content',
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('FileSign step type', () => {
    it('should return true when signOption is missing', () => {
      const data = createMockData({ stepType: StepType.FileSign });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when signOption is present', () => {
      const data = createMockData({
        stepType: StepType.FileSign,
        signOption: { label: 'Sign', value: 'sign' },
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('Assign step type', () => {
    it('should return true when assignElements is undefined', () => {
      const data = createMockData({ stepType: StepType.Assign });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when assignElements is empty array', () => {
      const data = createMockData({
        stepType: StepType.Assign,
        assignElements: [],
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when assign element has empty key', () => {
      const data = createMockData({
        stepType: StepType.Assign,
        assignElements: [
          {
            key: '',
            value: 'test',
            id: '',
          },
        ],
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when assign element has empty value', () => {
      const data = createMockData({
        stepType: StepType.Assign,
        assignElements: [
          {
            key: 'test',
            value: '',
            id: '',
          },
        ],
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when assign elements are valid', () => {
      const data = createMockData({
        stepType: StepType.Assign,
        assignElements: [
          {
            key: 'test',
            value: 'value',
            id: '',
          },
        ],
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });

  describe('default case (Textfield and other step types)', () => {
    it('should return true when readonly is false and message is empty', () => {
      const data = createMockData({
        stepType: StepType.Textfield,
        readonly: false,
        message: '',
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return true when readonly is false and message is undefined', () => {
      const data = createMockData({
        stepType: StepType.Textfield,
        readonly: false,
        message: undefined,
      });
      expect(isStepInvalid(data)).toBe(true);
    });

    it('should return false when readonly is true', () => {
      const data = createMockData({
        stepType: StepType.Textfield,
        readonly: true,
        message: '',
      });
      expect(isStepInvalid(data)).toBe(false);
    });

    it('should return false when message has content', () => {
      const data = createMockData({
        stepType: StepType.Textfield,
        readonly: false,
        message: 'Test message',
      });
      expect(isStepInvalid(data)).toBe(false);
    });
  });
});

describe('StepNode Component', () => {
  it('should render without crashing', () => {
    const mockData: NodeDataProps = {
      label: 'Test Step',
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      type: 'step',
      stepType: StepType.Textfield,
      readonly: false,
      childrenCount: 0,
      setClickedNode: vi.fn(),
      message: 'Test message',
    };

    render(<StepNode data={mockData} />);
    expect(screen.getByText('Test Step')).toBeInTheDocument();
  });
});
