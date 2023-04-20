import { CSSProperties, FC, useState } from "react";
import Button from "../Button";
import { FormInput } from "../FormElements";
import Track from "../Track";

type TextfieldTextContentProps = {
  readonly placeholders: { [key: string]: string };
  readonly message?: string;
}

const TextfieldTestContent: FC<TextfieldTextContentProps> = ({ placeholders, message }) => {
  const [messageTestOutput, setMessageTestOutput] = useState<string | null>(null)
  const [messageTestInputFields, setMessageTestInputFields] = useState<{ [key: string]: string }>({})


  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`
  }

  const onTestClick = () => {
    const regex = /{{(.*?)}}/g;
    const result = message?.replace(regex, (match, _) => messageTestInputFields[match.trim()] || match);
    if (result) setMessageTestOutput(result);
  }

  return (
    <Track direction="vertical" align="left" style={{ ...popupBodyCss }} gap={16}>
      {Object.keys(placeholders).map((key, i) => (
        <Track direction="vertical" align="left" style={{ width: '100%' }} key={key + i}>
          <>
            <label htmlFor={key}>{key}</label>
            <FormInput
              name={key}
              label={key}
              placeholder="Väärtus..."
              onChange={(event) => {
                setMessageTestInputFields((previous) => {
                  previous[key] = event.target.value;
                  return previous;
                })
              }}
              hideLabel
            ></FormInput>
          </>
        </Track>
      ))}
      <Track direction="vertical" align="left" style={{ width: '100%' }}>
        {messageTestOutput}
      </Track>
      <Button
        onClick={onTestClick}
      >Testi</Button>
    </Track>
  );
}

export default TextfieldTestContent;
