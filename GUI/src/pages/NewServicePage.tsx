import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  FormInput,
  ApiEndpointCard,
  FormTextarea,
  Layout,
  NewServiceHeader,
  Track,
} from "../components";
import { v4 as uuid } from "uuid";
import { ROUTES } from "../resources/routes-constants";

const NewServicePage: React.FC = () => {
  const [endpoints, setEndpoints] = useState<{ id: string }[]>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onDelete = (id: string) => {
    setEndpoints((prevEndpoints) =>
      prevEndpoints.filter((prevEndpoint) => prevEndpoint.id !== id)
    );
  };
  return (
    <Layout disableMenu customHeader={<NewServiceHeader activeStep={2} continueOnClick={() => navigate(ROUTES.FLOW_ROUTE)}/>}>

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

        {endpoints.map((endpoint) => (
          <ApiEndpointCard
            key={endpoint.id}
            onDelete={() => onDelete(endpoint.id)}
          />
        ))}
        <Button
          appearance="text"
          onClick={() =>
            setEndpoints((endpoints) => {
              return [...endpoints, { id: uuid() }];
            })
          }
        >
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
