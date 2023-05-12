import { FC, memo } from "react";

import { ExclamationBadge, Track } from "../";
import { StepType } from "../../types";

type NodeDataProps = {
  data: {
    childrenCount: number;
    clientInputId: number;
    label: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    type: string;
    stepType: StepType;
    readonly: boolean;
    name?: string;
    condition?: string;
    value?: string;
    message?: string;
    link?: string;
    linkText?: string;
    fileName?: string;
    fileContent?: string;
  };
};

const StepNode: FC<NodeDataProps> = ({ data }) => {
  const boldText = {
    fontWeight: 500,
  };
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
      {data.stepType === StepType.Textfield && (
        <div style={boldText} dangerouslySetInnerHTML={createMarkup(data.message ?? "")}></div>
      )}
      {data.stepType === StepType.Auth && <p style={boldText}>"Jätkamiseks palun logi sisse läbi TARA"</p>}
      {data.stepType === StepType.Input && (
        <p>
          <span style={boldText}>Muutuja</span>
          <span style={{ marginLeft: 8 }} className="client-input-variable-tag">
            ClientInput_{data.clientInputId}
          </span>
        </p>
      )}
      {data.stepType === StepType.OpenWebpage && (
        <p>
          <span className="webpage-link-text">{data.linkText}</span>
          {data.link && (
            <span className="webpage-link" style={{ marginLeft: 8 }}>
              ({data.link})
            </span>
          )}
        </p>
      )}
      {data.stepType === StepType.FileGenerate && data.fileName && (
        <p>
          <span style={boldText}>{data.fileName}</span>
          <span className="file-name-extension" style={{ marginLeft: 8 }}>
            {data.fileName}.zip
          </span>
        </p>
      )}
      {data.stepType === StepType.FileSign && <p style={boldText}>“Kas soovid dokumendi allkirjastada?”</p>}
      {data.stepType === StepType.FinishingStepEnd && <p style={boldText}>“Teenus on lõpetatud”</p>}
      {data.stepType === StepType.FinishingStepRedirect && (
        <p style={boldText}>“Vestlus suunatakse klienditeenindajale”</p>
      )}
      {data.stepType === StepType.Rule && (
        <p>
          {data.name && (
            <span style={{ marginRight: 8 }} className="client-input-variable-tag">
              {data.name}
            </span>
          )}
          {data.condition && <span style={boldText}>{data.condition}</span>}
          {data.value && <span style={{ ...boldText, marginLeft: 8 }}>{data.value}</span>}
        </p>
      )}
    </Track>
  );
};

export default memo(StepNode);
