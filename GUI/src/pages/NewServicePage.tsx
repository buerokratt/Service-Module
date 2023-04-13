import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  APIEndpointCard,
  Button,
  Card,
  FormInput,
  FormTextarea,
  Layout,
  NewServiceHeader,
  Track,
} from "../components";
import { v4 as uuid } from "uuid";

const NewServicePage: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ReactNode[]>([]);
  const { t } = useTranslation();

  return (
    <Layout disableMenu customHeader={<NewServiceHeader />}>
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
        {endpoints}
        <Button
          appearance="text"
          onClick={() =>
            setEndpoints((endpoints) => [
              ...endpoints,
              <APIEndpointCard key={uuid()} />,
            ])
          }
        >
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
