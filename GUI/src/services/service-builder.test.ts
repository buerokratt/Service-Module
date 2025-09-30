import { NodeDataProps } from 'types/service-flow';
import { describe, expect, it, vi } from 'vitest';

import {
  validateAssign,
  validateCondition,
  validateDynamicChoices,
  validateFileGenerate,
  validateMultiChoiceQuestion,
  validateOpenWebpage,
  validateTextField,
} from './service-builder';

// Mock i18next
vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
  t: vi.fn((key: string) => key),
}));

describe('Validation Functions', () => {
  describe('validateTextField', () => {
    it('should return null when message is defined', () => {
      const nodeData = { message: 'Test message' };
      const result = validateTextField(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when message is undefined', () => {
      const nodeData = { message: undefined };
      const result = validateTextField(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-textfield-message');
    });
  });

  describe('validateOpenWebpage', () => {
    it('should return null when both link and linkText are defined', () => {
      const nodeData = { link: 'https://example.com', linkText: 'Example' };
      const result = validateOpenWebpage(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when link is undefined', () => {
      const nodeData = { link: undefined, linkText: 'Example' };
      const result = validateOpenWebpage(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-website');
    });

    it('should return error when linkText is undefined', () => {
      const nodeData = { link: 'https://example.com', linkText: undefined };
      const result = validateOpenWebpage(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-website');
    });

    it('should return error when both are undefined', () => {
      const nodeData = { link: undefined, linkText: undefined };
      const result = validateOpenWebpage(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-website');
    });
  });

  describe('validateFileGenerate', () => {
    it('should return null when both fileName and fileContent are defined', () => {
      const nodeData = { fileName: 'test.txt', fileContent: 'Test content' };
      const result = validateFileGenerate(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when fileName is undefined', () => {
      const nodeData = { fileName: undefined, fileContent: 'Test content' };
      const result = validateFileGenerate(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-file-generation');
    });

    it('should return error when fileContent is undefined', () => {
      const nodeData = { fileName: 'test.txt', fileContent: undefined };
      const result = validateFileGenerate(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-file-generation');
    });
  });

  describe('validateAssign', () => {
    it('should return null when assignElements is defined and not empty', () => {
      const nodeData = { assignElements: [{ id: '1', key: 'test', value: 'value' }] };
      const result = validateAssign(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when assignElements is undefined', () => {
      const nodeData = { assignElements: undefined };
      const result = validateAssign(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-assign-elements');
    });

    it('should return error when assignElements is empty array', () => {
      const nodeData = { assignElements: [] };
      const result = validateAssign(nodeData as unknown as NodeDataProps);
      expect(result).toBe('toast.missing-assign-elements');
    });
  });

  describe('validateMultiChoiceQuestion', () => {
    it('should return null when question and buttons are properly defined', () => {
      const nodeData = {
        multiChoiceQuestion: {
          question: 'Test question',
          buttons: [{ id: '1', title: 'Option 1', payload: 'payload1' }],
        },
      };
      const result = validateMultiChoiceQuestion(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when question is undefined', () => {
      const nodeData = {
        multiChoiceQuestion: {
          question: undefined,
          buttons: [{ id: '1', title: 'Option 1', payload: 'payload1' }],
        },
      };
      const result = validateMultiChoiceQuestion(nodeData as unknown as NodeDataProps);
      expect(result).toBe('toast.missing-mcq-question');
    });

    it('should return error when question is empty string', () => {
      const nodeData = {
        multiChoiceQuestion: {
          question: '',
          buttons: [{ id: '1', title: 'Option 1', payload: 'payload1' }],
        },
      };
      const result = validateMultiChoiceQuestion(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-mcq-question');
    });

    it('should return error when buttons are undefined', () => {
      const nodeData = {
        multiChoiceQuestion: {
          question: 'Test question',
          buttons: undefined,
        },
      };
      const result = validateMultiChoiceQuestion(nodeData as unknown as NodeDataProps);
      expect(result).toBe('toast.missing-mcq-options');
    });

    it('should return error when buttons array is empty', () => {
      const nodeData = {
        multiChoiceQuestion: {
          question: 'Test question',
          buttons: [],
        },
      };
      const result = validateMultiChoiceQuestion(nodeData as unknown as NodeDataProps);
      expect(result).toBe('toast.missing-mcq-options');
    });
  });

  describe('validateDynamicChoices', () => {
    it('should return null when all required fields are defined', () => {
      const nodeData = {
        dynamicChoices: {
          list: 'test list',
          serviceName: 'test service',
          key: 'test key',
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBeNull();
    });

    it('should return error when list is undefined', () => {
      const nodeData = {
        dynamicChoices: {
          list: undefined,
          serviceName: 'test service',
          key: 'test key',
        },
      };
      const result = validateDynamicChoices(nodeData as unknown as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-list');
    });

    it('should return error when list is empty string', () => {
      const nodeData = {
        dynamicChoices: {
          list: '',
          serviceName: 'test service',
          key: 'test key',
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-list');
    });

    it('should return error when serviceName is undefined', () => {
      const nodeData = {
        dynamicChoices: {
          list: 'test list',
          serviceName: undefined,
          key: 'test key',
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-service-name');
    });

    it('should return error when serviceName is empty string', () => {
      const nodeData = {
        dynamicChoices: {
          list: 'test list',
          serviceName: '',
          key: 'test key',
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-service-name');
    });

    it('should return error when key is undefined', () => {
      const nodeData = {
        dynamicChoices: {
          list: 'test list',
          serviceName: 'test service',
          key: undefined,
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-key');
    });

    it('should return error when key is empty string', () => {
      const nodeData = {
        dynamicChoices: {
          list: 'test list',
          serviceName: 'test service',
          key: '',
        },
      };
      const result = validateDynamicChoices(nodeData as NodeDataProps);
      expect(result).toBe('toast.missing-dynamic-choices-key');
    });
  });

  describe('validateCondition', () => {
    it('should not throw when rules are valid', () => {
      const nodeData = {
        rules: {
          children: [{ field: 'test', operator: 'equals', value: 'value' }],
        },
      };
      expect(() => validateCondition(nodeData as NodeDataProps)).not.toThrow();
    });

    it('should throw error when rules children are undefined', () => {
      const nodeData = { rules: { children: undefined } };
      expect(() => validateCondition(nodeData as unknown as NodeDataProps)).toThrow('toast.missing-condition-rules');
    });

    it('should throw error when rules children are empty', () => {
      const nodeData = { rules: { children: [] } };
      expect(() => validateCondition(nodeData as unknown as NodeDataProps)).toThrow('toast.missing-condition-rules');
    });

    it('should throw error when rules are undefined', () => {
      const nodeData = { rules: undefined };
      expect(() => validateCondition(nodeData as unknown as NodeDataProps)).toThrow('toast.missing-condition-rules');
    });
  });
});
