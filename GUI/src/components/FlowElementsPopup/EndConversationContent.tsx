import { CSSProperties, FC } from "react";
import { useTranslation } from "react-i18next";
import { Track } from "..";

const EndConversationContent: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Track direction="vertical" style={{ padding: 16 }} align="left">
        <p style={{ color: '#9799A4', fontSize: 14 }}>
          {t("serviceFlow.popup.endConversation")}
        </p>
      </Track>
    </>
  );
}

export default EndConversationContent;
