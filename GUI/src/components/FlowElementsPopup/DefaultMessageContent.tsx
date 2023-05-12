import { CSSProperties, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormTextarea } from "../FormElements";
import Track from "../Track";

const DefaultMessageContent: FC<{ message: string }> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <>
      <Track direction='vertical' align="left" style={{ width: '100%', padding: 16 }}>
        <label htmlFor="messageToClient">{t("serviceFlow.popup.clientSeesMessage")}</label>
        <FormTextarea
          name={"messageToClient"}
          label={""}
          defaultValue={message}
          style={{
            backgroundColor: '#F0F0F2',
            resize: 'vertical',
            color: ' #9799A4',
          }}
          readOnly
        >
        </FormTextarea>
      </Track>
    </>
  );
};

export default DefaultMessageContent;
