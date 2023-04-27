export interface Step {
  readonly id: number;
  label: string;
  type: StepType;
  action?: string;
}


export enum StepType {
  Auth = 'auth',
  Textfield = 'textfield',
  Input = 'input',
  RuleDefinition = 'rule-definition',
  OpenWebpage = 'open-webpage',
  FileGenerate = 'file-generate',
  FileSign = 'file-sign',
  Step = 'step',
  Rule = 'rule',
  FinishingStepEnd = 'finishing-step-end',
  FinishingStepRedirect = 'finising-step-redirect'
}
