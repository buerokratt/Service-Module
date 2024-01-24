import { useTranslation } from "react-i18next";
import { FormSelect, FormTextarea } from "../FormElements";
import Track from "../Track";

type FileSignContentProps = {
  readonly onOptionChange: (selection: { label: string; value: string } | null) => void;
  signOption?: { label: string; value: string } | null;
};

const FileSignContent: React.FC<FileSignContentProps> = ({ onOptionChange, signOption }) => {
  const { t } = useTranslation();
  const signOptions = [
    { label: "ID Card", value: "ID Card", name: "" },
    { label: "Smart Id", value: "Smart Id", name: "" },
    { label: "Mobile Id", value: "Mobile Id", name: "" },
  ];

  return (
    <>
      <Track direction="vertical" align="left" style={{ width: "100%", padding: 16 }}>
        <label htmlFor="messageToClient" style={{ paddingBottom: 5 }}>
          {t("serviceFlow.popup.signType")}
        </label>
        <FormSelect
          name="service-type"
          label={""}
          options={signOptions}
          placeholder={t("global.choose") ?? ""}
          onSelectionChange={(selection) => onOptionChange(selection)}
          value={signOption?.value ?? ""}
          defaultValue={signOption?.value ?? ""}
        />
        <label htmlFor="messageToClient" style={{ paddingBottom: 5, paddingTop: 5 }}>
          {t("serviceFlow.popup.clientSeesMessage")}
        </label>
        <FormTextarea
          name={"messageToClient"}
          label={""}
          defaultValue={t("serviceFlow.popup.fileSignYesNo").toString()}
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

export default FileSignContent;
