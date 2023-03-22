import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  EndpointCustom,
  EndpointOpenAPI,
  FormInput,
  FormSelect,
  FormTextarea,
  Layout,
  NewServiceHeader,
  Track,
} from "../components";
import { Option } from "../types/option";

const NewServicePage: React.FC = () => {
  const [option, setOption] = useState<Option | null>();

  const options: Option[] = [
    { label: "Open API", value: "openAPI" },
    { label: "Custom endpoint", value: "custom" },
  ];

  const { t } = useTranslation();

  return (
    <Layout disableMenu customHeader={<NewServiceHeader />}>
      <Track
        style={{ width: 800, alignSelf: "center" }}
        direction="vertical"
        gap={16}
        align="stretch"
      >
        <h1>Teenuse seadistamine</h1>
        <Card>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="name">Nimetus</label>
              <FormInput name="name" label="Nimetus" hideLabel />
            </div>
            <div>
              <label htmlFor="description">Kirjeldus</label>
              <FormTextarea
                name="description"
                label="Kirjeldus"
                hideLabel
                style={{
                  height: 120,
                  resize: "vertical",
                }}
              />
            </div>
          </Track>
        </Card>
        <Card header={<h5>API otspunkt</h5>}>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="service-type">Teenus kasutab</label>
              <FormSelect
                name="service-type"
                label={"Teenus kasutab"}
                options={options}
                hideLabel
                placeholder="Vali.."
                onSelectionChange={(selection) => setOption(selection)}
              />
            </div>
            {option?.value === "openAPI" && <EndpointOpenAPI />}
            {option?.value === "custom" && <EndpointCustom />}
          </Track>
        </Card>
        <Button appearance="text">+ Lisa API otspunkt</Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
