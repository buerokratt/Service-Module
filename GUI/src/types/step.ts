import { EndpointData } from "./endpoint";
import { StepType } from "./step-type.enum";

export interface Step {
  readonly id: number;
  label: string;
  type: StepType;
  action?: string;
  data?: EndpointData;
}

export const stepsLabels: Record<StepType, string> = {
  [StepType.Auth]: "serviceFlow.element.taraAuthentication",
  [StepType.Textfield]: "serviceFlow.element.textfield",
  [StepType.Input]: "serviceFlow.element.clientInput",
  [StepType.Assign]: "serviceFlow.element.assign",
  [StepType.Condition]: "serviceFlow.element.condition",
  [StepType.RuleDefinition]: "serviceFlow.element.ruleDefinition",
  [StepType.OpenWebpage]: "serviceFlow.element.openNewWebpage",
  [StepType.FileGenerate]: "serviceFlow.element.fileGeneration",
  [StepType.FileSign]: "serviceFlow.element.fileSigning",
  [StepType.Step]: "serviceFlow.element.step",
  [StepType.Rule]: "serviceFlow.element.rule",
  [StepType.FinishingStepEnd]: "serviceFlow.element.conversationEnd",
  [StepType.FinishingStepRedirect]: "serviceFlow.element.redirectConversationToSupport",
  [StepType.UserDefined]: "serviceFlow.element.userDefined",
  [StepType.RasaRules]: "serviceFlow.element.rasaRules",
  [StepType.SiGa]: "serviceFlow.element.siga",
};
 
