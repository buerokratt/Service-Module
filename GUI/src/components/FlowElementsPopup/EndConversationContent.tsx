import { CSSProperties, FC } from "react";
import { Track } from "..";

const EndConversationContent: FC = () => {
  return (
    <>
      <Track direction="vertical" style={{ padding: 16 }} align="left">
        <p style={{ color: '#9799A4', fontSize: 14 }}>
          Selle sammuga lõpeb suhtlus. Et teenusvoogu jätkata, tuleb vestluse lõpetamine voost eemaldada.
        </p>
      </Track>
    </>
  );
}

export default EndConversationContent;
