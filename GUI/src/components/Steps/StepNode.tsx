import { FC, memo } from "react";

import { ExclamationBadge, Track } from "../";
import { StepType } from "../../types";

type NodeDataProps = {
  data: {
    childrenCount: number;
    label: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    type: string;
    stepType: StepType;
    readonly: boolean;
    message?: string;
    link?: string;
    linkText?: string;
    fileName?: string;
    fileContent?: string;
  };
};

const StepNode: FC<NodeDataProps> = ({ data }) => {
  const createMarkup = (text: string) => {
    return {
      __html: text,
    };
  };

  const isStepInvalid = () => {
    if (data.stepType === StepType.UserDefined) return false;
    if (data.stepType === StepType.Input) return data.childrenCount < 2;
    if (data.stepType === StepType.OpenWebpage) return !data.link || !data.linkText;
    if (data.stepType === StepType.FileGenerate) return !data.fileName || !data.fileContent;

    return !(data.readonly || !!data.message?.length);
  };

  return (
    <Track
      style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
      direction="vertical"
      align="left"
    >
      <p>
        {isStepInvalid() && <ExclamationBadge></ExclamationBadge>}
        {data.label}
      </p>
      {data.stepType === StepType.Textfield && <div dangerouslySetInnerHTML={createMarkup(data.message ?? "")}></div>}
      {data.stepType === StepType.Auth && <p style={{ fontWeight: 500 }}>Jätkamiseks palun logi sisse läbi TARA</p>}
    </Track>
  );
};

export default memo(StepNode);
