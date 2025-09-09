import { Node } from '@xyflow/react';
import { Group, Rule } from 'components/FlowElementsPopup/RuleBuilder/types';
import { Assign, Step, StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';

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

export const isStepInvalid = (node: NodeDataProps): boolean => {
  if (node.testingPassed === false) return true;

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
    return node.rules?.children === undefined || invalidRulesExist || node.rules?.children.length === 0;
  }

  // todo multi
  if (node.stepType === StepType.MultiChoiceQuestion) {
    return (
      !node?.multiChoiceQuestion?.question ||
      node.multiChoiceQuestion?.buttons?.find((e) => e.title === '') != undefined
    );
  }

  // todo dynamic choices
  if (node.stepType === StepType.DynamicChoices) {
    return !node?.dynamicChoices?.list || !node?.dynamicChoices?.serviceName || !node?.dynamicChoices?.key;
  }

  if (node.stepType === StepType.UserDefined) return false;
  if (node.stepType === StepType.OpenWebpage) return !node.link || !node.linkText;
  if (node.stepType === StepType.FileGenerate) return !node.fileName || !node.fileContent;
  if (node.stepType === StepType.FileSign) return !node.signOption;
  // todo assign
  if (node.stepType === StepType.Assign) {
    const hasInvalidElements = (elements: any[]): boolean => {
      return elements.some((e) => {
        const element = e as Assign;
        return element.key === '' || element.value === '';
      });
    };

    const invalidElementsExist = hasInvalidElements(node.assignElements ?? []);
    return node?.assignElements === undefined || invalidElementsExist || node?.assignElements.length === 0;
  }

  // todo message length
  return !node.readonly && !node.message?.length;
};
