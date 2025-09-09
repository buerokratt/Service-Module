import { Node } from '@xyflow/react';
import { Group, Rule } from 'components/FlowElementsPopup/RuleBuilder/types';
import { Assign, Step, StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const getNodeLabel = (step: Step, nodes: Node[]) => {
  const baseLabel = step.label.split(' - ').pop();
  const existingNumbers = nodes
    .filter((node: any) => node.data.stepType === step.type)
    .map((node: any) => node.data.label)
    .filter((label) => label.startsWith(baseLabel))
    .map((label) => {
      const parts = label.split(' - ');
      if (parts.length > 1) {
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .sort((a, b) => a - b);

  let nextNumber = 1;
  for (const num of existingNumbers) {
    if (num === nextNumber) {
      nextNumber++;
    } else if (num > nextNumber) {
      break;
    }
  }

  return `${baseLabel} - ${nextNumber}`;
};

// Error messages are implemented only for the steps that are actually enabled
// More need to be added later
export const isStepValid = (node: NodeDataProps): ValidationResult => {
  // End service node and similar
  if (node.readonly) return { isValid: true };

  if (node.testingPassed === false) return { isValid: false };

  console.log('node', node.stepType, node.name);

  // todo condition
  if (node.stepType === StepType.Input || node.stepType === StepType.Condition) {
    const hasInvalidRules = (elements: any[]): boolean => {
      return elements.some((e) => {
        if ('children' in e) {
          const group = e as Group;
          if (group.children.length === 0) return true;
          return hasInvalidRules(group.children);
        } else {
          const rule = e as Rule;
          return rule.value === '' || rule.field === '' || rule.operator === '';
        }
      });
    };

    const invalidRulesExist = hasInvalidRules(node.rules?.children ?? []);
    const isValid = node.rules?.children !== undefined && !invalidRulesExist && node.rules?.children.length > 0;
    if (!isValid) {
      const errorMessage =
        node.stepType === StepType.Input ? 'Client input rules required' : 'Condition rules required';
      return { isValid: false, error: errorMessage };
    }
    return { isValid: true };
  }

  if (node.stepType === StepType.MultiChoiceQuestion) {
    if (!node?.multiChoiceQuestion?.question) {
      return { isValid: false, error: 'Question is required' };
    }

    if (node.multiChoiceQuestion?.buttons?.find((e) => e.title === '') !== undefined) {
      return { isValid: false, error: 'Button titles are required' };
    }

    return { isValid: true };
  }

  if (node.stepType === StepType.DynamicChoices) {
    if (!node?.dynamicChoices?.list) {
      return { isValid: false, error: 'Dynamic choices list is required' };
    }

    if (!node?.dynamicChoices?.serviceName) {
      return { isValid: false, error: 'Service name is required' };
    }

    if (!node?.dynamicChoices?.key) {
      return { isValid: false, error: 'Key is required' };
    }

    return { isValid: true };
  }

  if (node.stepType === StepType.UserDefined) return { isValid: true };
  if (node.stepType === StepType.OpenWebpage) return { isValid: Boolean(node.link && node.linkText) };
  if (node.stepType === StepType.FileGenerate) return { isValid: Boolean(node.fileName && node.fileContent) };
  if (node.stepType === StepType.FileSign) return { isValid: Boolean(node.signOption) };

  if (node.stepType === StepType.Assign) {
    const hasInvalidElements = (elements: any[]): boolean => {
      return elements.some((e) => {
        const element = e as Assign;
        return element.key === '' || element.value === '';
      });
    };

    const invalidElementsExist = hasInvalidElements(node.assignElements ?? []);

    if (node?.assignElements === undefined || node?.assignElements.length === 0) {
      return { isValid: false, error: 'Assign elements are required' };
    }

    if (invalidElementsExist) {
      return { isValid: false, error: 'Key and value fields are required' };
    }

    return { isValid: true };
  }

  if (node.stepType === StepType.Textfield) {
    return node.message?.length ? { isValid: true } : { isValid: false, error: 'Message text is missing' };
  }
};
