export type MultiChoiceQuestion = {
  question: string;
  buttons: MultiChoiceQuestionButton[];
};

export type MultiChoiceQuestionButton = {
  id: string;
  title: string;
  payload: string;
};
