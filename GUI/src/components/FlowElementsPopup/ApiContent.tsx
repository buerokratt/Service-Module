import { t } from "i18next";
import { FormInput, FormTextarea } from "../FormElements";
import Track from "../Track";
import { FC } from "react";
import { EndpointData } from "../../types/endpoint";

type ApiContentProps = {
  readonly endpoint: (endpoint: EndpointData) => void;
};

const ApiContent: FC<ApiContentProps> = ({ endpoint }) => {
  console.log(endpoint);
  return (
    <>
      <Track direction="vertical" align="left" style={{ width: "100%", padding: 16 }}>
        <label htmlFor="endpointInformation" style={{ paddingBottom: 10 }}>
          {t("serviceFlow.popup.endpointInformation")}
        </label>
        <FormTextarea
          name={"endpointInformation"}
          label={""}
          defaultValue={"Testing"}
          style={{
            backgroundColor: "#F0F0F2",
            resize: "vertical",
            color: " #9799A4",
          }}
          readOnly
        ></FormTextarea>
      </Track>
    </>
  );
};

export default ApiContent;
