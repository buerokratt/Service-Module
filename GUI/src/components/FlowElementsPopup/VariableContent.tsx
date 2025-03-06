import { FC } from "react";

type VariableContentProps = {
  content: unknown;
};

export const VariableContent: FC<VariableContentProps> = ({ content }) => {
  return <>{JSON.stringify(content)}</>;
};
