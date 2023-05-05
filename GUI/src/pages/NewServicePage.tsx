import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button, Card, FormInput, ApiEndpointCard, FormTextarea, Layout, NewServiceHeader, Track } from "../components";
import { v4 as uuid } from "uuid";
import { ROUTES } from "../resources/routes-constants";
import { Node } from "reactflow";
import axios from "axios";
import { getTaraAuthResponseVariables } from "../resources/api-constants";
import { EndpointData } from "../types/endpoint";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState<EndpointData[]>(location.state?.endpoints ?? []);
  const { intentName } = useParams();
  const [serviceName, setServiceName] = useState<string | undefined>(intentName);

  const onDelete = (id: string) => {
    setEndpoints((prevEndpoints) => prevEndpoints.filter((prevEndpoint) => prevEndpoint.id !== id));
  };
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);

  useEffect(() => {
    const nodes: Node[] | undefined = location.state?.flow ? JSON.parse(location.state?.flow)?.nodes : undefined;
    const variables: string[] = [];
    nodes
      ?.filter((node) => node.data.stepType === "input")
      .forEach((node) => variables.push(`{{ClientInput.${node.data.clientInputId}}}`));
    if (nodes?.find((node) => node.data.stepType === "auth")) loadTaraVariables();
    setAvailableVariables(variables);
  }, []);

  const loadTaraVariables = () => {
    axios.post(getTaraAuthResponseVariables()).then((result) => {
      const data: { [key: string]: any } = result.data?.response?.body ?? {};
      const taraVariables: string[] = [];
      Object.keys(data).forEach((key) => taraVariables.push(`{{TARA.${key}}}`));
      setAvailableVariables((oldVaraibles) => {
        taraVariables.forEach((tv) => {
          if (!oldVaraibles.includes(tv)) oldVaraibles.push(tv);
        });
        return oldVaraibles;
      });
    });
  };

  const saveDraft = () => {
    console.log(
      endpoints.map((endpoint) => {
        return {
          ...endpoint,
          selectedEndpoint: endpoint.definedEndpoints.find((definedEndpoint) => definedEndpoint.isSelected),
        };
      })
    );
  };

  const getSelectedEndpoints = () => {
    return endpoints.map((endpoint) => {
      return {
        ...endpoint,
        selectedEndpoint: endpoint.definedEndpoints.find((definedEndpoint) => definedEndpoint.isSelected),
      };
    });
  };

  const getAvailableRequestValues = (endpointId: string): string[] => {
    const requestValues: string[] = [...availableVariables];
    const otherEndpoints = getSelectedEndpoints().filter((otherEndpoint) => otherEndpoint.id !== endpointId);
    otherEndpoints.forEach((endpoint) => {
      endpoint.selectedEndpoint?.response?.forEach((response) => {
        requestValues.push(`{{${endpoint.name === "" ? endpoint.id : endpoint.name}.${response.name}}}`);
      });
    });
    return requestValues;
  };

  return (
    <Layout
      disableMenu
      customHeader={
        <NewServiceHeader
          activeStep={2}
          saveDraftOnClick={saveDraft}
          endpoints={endpoints}
          flow={location.state?.flow}
          continueOnClick={() => {
            navigate(ROUTES.FLOW_ROUTE, { state: { endpoints: endpoints, flow: location.state?.flow } });
          }}
        />
      }
    >
      <Track style={{ width: 800, alignSelf: "center" }} direction="vertical" gap={16} align="stretch">
        <h1>{t("newService.serviceSetup")}</h1>
        <Card>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="name">{t("newService.name")}</label>
              <FormInput name="name" label="" defaultValue={serviceName} />
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
            endpoint={endpoint}
            setEndpoints={setEndpoints}
            requestValues={getAvailableRequestValues(endpoint.id)}
          />
        ))}
        <Button
          appearance="text"
          onClick={() =>
            setEndpoints((endpoints) => {
              return [...endpoints, { id: uuid(), name: "", definedEndpoints: [] }];
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
