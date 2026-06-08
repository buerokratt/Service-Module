import { Node } from '@xyflow/react';
import { Group, Rule } from 'components/FlowElementsPopup/RuleBuilder/types';
import { t } from 'i18next';
import { Assign, Step, StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const getNodeLabel = (step: Step, nodes: Node[]) => {
  const baseLabel = step.label.split(' - ').pop() ?? '';
  const existingNumbers = nodes
    .filter((node) => node.data.stepType === step.type)
    .map((node) => node.data.label as string)
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

export const generateUniqueId = () => {
  return crypto.randomUUID();
};

export const generateUniqueLabel = (originalLabel: string, existingNodes: Node[]): string => {
  const parts = originalLabel.split(' - ');
  const baseLabel = parts.length > 1 ? parts.slice(0, -1).join(' - ') : originalLabel;

  const existingLabels = existingNodes
    .map((node: any) => node.data?.label)
    .filter((label) => label?.startsWith(baseLabel))
    .map((label) => {
      const labelParts = label.split(' - ');
      if (labelParts.length > 1) {
        const num = parseInt(labelParts[labelParts.length - 1] as string);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .sort((a, b) => a - b);

  let nextNumber = 1;
  for (const num of existingLabels) {
    if (num === nextNumber) {
      nextNumber++;
    } else if (num > nextNumber) {
      break;
    }
  }

  return `${baseLabel} - ${nextNumber}`;
};

export const validateStep = (node: NodeDataProps): ValidationResult => {
  // End service node and similar
  if (node.readonly) return { isValid: true };

  // Failed testing with Ruuter request
  if (node.testingPassed === false) return { isValid: false };

  switch (node.stepType) {
    case StepType.Input:
    case StepType.Condition:
      return validateInputOrConditionStep(node);

    case StepType.MultiChoiceQuestion:
      return validateMultiChoiceQuestionStep(node);

    case StepType.DynamicChoices:
      return validateDynamicChoicesStep(node);

    case StepType.Assign:
      return validateAssignStep(node);

    case StepType.Textfield:
      return validateTextfieldStep(node);

    case StepType.UserDefined:
      return validateUserDefinedStep();

    case StepType.OpenWebpage:
      return validateOpenWebpageStep(node);

    case StepType.FileGenerate:
      return validateFileGenerateStep(node);

    case StepType.FileSign:
      return validateFileSignStep(node);

    case StepType.JumpToService:
      return validateJumpToServiceStep(node);

    default:
      return { isValid: true };
  }
};

// Error messages are implemented only for the steps that are actually enabled
// More need to be added later
export const validateInputOrConditionStep = (node: NodeDataProps): ValidationResult => {
  const hasInvalidRules = (elements: any[]): boolean => {
    if (!Array.isArray(elements)) return true;
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

  const rulesChildren = Array.isArray(node.rules?.children) ? node.rules.children : [];
  const invalidRulesExist = hasInvalidRules(rulesChildren);

  if (!Array.isArray(node.rules?.children) || node.rules.children.length === 0) {
    const errorMessage =
      node.stepType === StepType.Input
        ? (t('chat.service-flow-error.client-input-rules-required') as string)
        : (t('chat.service-flow-error.condition-rules-required') as string);
    return { isValid: false, error: errorMessage };
  }

  if (invalidRulesExist) {
    const errorMessage =
      node.stepType === StepType.Input
        ? (t('chat.service-flow-error.client-input-rule-fields-required') as string)
        : (t('chat.service-flow-error.condition-rule-fields-required') as string);
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true };
};

export const validateMultiChoiceQuestionStep = (node: NodeDataProps): ValidationResult => {
  if (!node?.multiChoiceQuestion?.question) {
    return { isValid: false, error: t('chat.service-flow-error.question-required') as string };
  }

  if (node.multiChoiceQuestion?.buttons?.find((e) => e.title === '') !== undefined) {
    return { isValid: false, error: t('chat.service-flow-error.button-titles-required') as string };
  }

  return { isValid: true };
};

export const validateDynamicChoicesStep = (node: NodeDataProps): ValidationResult => {
  if (!node?.dynamicChoices?.list) {
    return { isValid: false, error: t('chat.service-flow-error.dynamic-choices-list-required') as string };
  }

  if (!node?.dynamicChoices?.serviceName) {
    return { isValid: false, error: t('chat.service-flow-error.service-name-required') as string };
  }

  if (!node?.dynamicChoices?.key) {
    return { isValid: false, error: t('chat.service-flow-error.key-required') as string };
  }

  return { isValid: true };
};

export const validateAssignStep = (node: NodeDataProps): ValidationResult => {
  const hasInvalidElements = (elements: any[]): boolean => {
    return elements.some((e) => {
      const element = e as Assign;
      return element.key === '' || element.value === '';
    });
  };

  const invalidElementsExist = hasInvalidElements(node.assignElements ?? []);

  if (node?.assignElements === undefined || node?.assignElements.length === 0) {
    return { isValid: false, error: t('chat.service-flow-error.assign-elements-required') as string };
  }

  if (invalidElementsExist) {
    return { isValid: false, error: t('chat.service-flow-error.key-value-fields-required') as string };
  }

  return { isValid: true };
};

export const validateTextfieldStep = (node: NodeDataProps): ValidationResult => {
  return node.message?.length
    ? { isValid: true }
    : { isValid: false, error: t('chat.service-flow-error.message-text-missing') as string };
};

export const validateUserDefinedStep = (): ValidationResult => {
  return { isValid: true };
};

export const validateOpenWebpageStep = (node: NodeDataProps): ValidationResult => {
  return { isValid: Boolean(node.link && node.linkText) };
};

export const validateFileGenerateStep = (node: NodeDataProps): ValidationResult => {
  return { isValid: Boolean(node.fileName && node.fileContent) };
};

export const validateFileSignStep = (node: NodeDataProps): ValidationResult => {
  return { isValid: Boolean(node.signOption) };
};

export const validateJumpToServiceStep = (node: NodeDataProps): ValidationResult => {
  return node.jumpToService?.serviceName
    ? { isValid: true }
    : { isValid: false, error: t('chat.service-flow-error.service-name-required') as string };
};
