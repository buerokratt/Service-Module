import { CSSProperties, FC } from "react";
import { FormTextarea } from "../FormElements";
import Track from "../Track";

const DefaultMessageContent: FC<{ message: string }> = ({ message }) => {
  return (
    <>
      <Track direction='vertical' align="left" style={{ width: '100%', padding: 16 }}>
        <label htmlFor="messageToClient">Klient näeb sõnumit</label>
        <FormTextarea
          name={"messageToClient"}
          label={"Klient näeb sõnumit"}
          hideLabel={true}
          defaultValue={message}
          style={{
            backgroundColor: '#F0F0F2',
            resize: 'vertical',
          }}
          readOnly
        >
        </FormTextarea>
      </Track>
    </>
  );
};

export default DefaultMessageContent;
