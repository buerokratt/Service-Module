import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import { ROUTES } from "../resources/routes-constants";
import { Option } from "../types/option";

const NewServicePage: React.FC = () => {
  const [option, setOption] = useState<Option | null>();

  const options: Option[] = [
    { label: "Open API", value: "openAPI" },
    { label: "Custom endpoint", value: "custom" },
  ];

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout disableMenu customHeader={<NewServiceHeader activeStep={2} continueOnClick={() => navigate(ROUTES.NEWSERVICE_FLOW_ROUTE)} />}>
      <Track
        style={{ width: 800, alignSelf: "center" }}
        direction="vertical"
        gap={16}
        align="stretch"
      >
        <h1>{t("newService.serviceSetup")}</h1>
        <Card>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="name">{t("newService.name")}</label>
              <FormInput name="name" label="" />
            </div>
            <div>
              <label htmlFor="description">{t("newService.description")}</label>
              <FormTextarea
                name="description"
                label=""
                style={{
                  height: 120,
                  resize: "vertical",
                }}
              />
            </div>
          </Track>
        </Card>
        <Card header={<h5>{t("newService.endpoint.api")}</h5>}>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="service-type">{t("newService.uses")}</label>
              <FormSelect
                name="service-type"
                label={""}
                options={options}
                placeholder="Vali.."
                onSelectionChange={(selection) => setOption(selection)}
              />
            </div>
            {option?.value === "openAPI" && <EndpointOpenAPI />}
            {option?.value === "custom" && <EndpointCustom />}
          </Track>
        </Card>
        <Button appearance="text">{t("newService.endpoint.add")}</Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
