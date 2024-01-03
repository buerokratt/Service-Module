import { FC } from "react";
import { FormTextarea } from "../FormElements";
import Track from "../Track";
import { useTranslation } from "react-i18next";

type JsonRequestContentProps = {
  readonly isVisible: boolean;
  readonly jsonContent?: string | null;
}

const JsonRequestContent: FC<JsonRequestContentProps> = ({ isVisible, jsonContent }) => {
  const { t } = useTranslation();
  if (!isVisible) return <></>;

  return (
    <>
      <Track direction='vertical' align="left" style={{ width: '100%', padding: 16 }}>
        <label htmlFor="json">JSON</label>
        <FormTextarea
          name="json"
          label="JSON"
          placeholder={t('serviceFlow.popup.jsonRequestPlaceholder')!}
          hideLabel={true}
          maxRows={20}
          style={{
            backgroundColor: '#F0F0F2',
            resize: 'vertical',
          }}
          defaultValue={JSON.stringify(jsonContent, undefined, 4)}
          readOnly
        >
        </FormTextarea>
      </Track>
    </>
  );
}

export default JsonRequestContent;
