export type MultiChoiceQuestion = {
  question: string;
  buttons: MultiChoiceQuestionButton[];
};

export type MultiChoiceQuestionButton = {
  title: string;
  payload: string;
};
