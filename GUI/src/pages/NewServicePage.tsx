import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, FormInput, ApiEndpointCard, FormTextarea, Layout, NewServiceHeader, Track } from "../components";
import { v4 as uuid } from "uuid";
import { ROUTES } from "../resources/routes-constants";
import { Node } from "reactflow";
import axios from "axios";
import { getSecretVariables, getTaraAuthResponseVariables } from "../resources/api-constants";
import { EndpointData, PreDefinedEndpointEnvVariables } from "../types/endpoint";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState<EndpointData[]>(location.state?.endpoints ?? []);
  const { intentName } = useParams();
  const [serviceName, setServiceName] = useState<string>(location.state?.serviceName ?? intentName ?? "");
  const [description, setDescription] = useState<string>(location.state?.serviceDescription ?? "");
  const [secrets, setSecrets] = useState<{ [key: string]: any }>(location.state?.secrets ?? {});
  const onDelete = (id: string) => {
    setEndpoints((prevEndpoints) => prevEndpoints.filter((prevEndpoint) => prevEndpoint.id !== id));
  };
  const [availableVariables, setAvailableVariables] = useState<PreDefinedEndpointEnvVariables>({ prod: [], test: [] });

  useEffect(() => {
    const nodes: Node[] | undefined = location.state?.flow ? JSON.parse(location.state?.flow)?.nodes : undefined;
    const variables: string[] = [];
    nodes
      ?.filter((node) => node.data.stepType === "input")
      .forEach((node) => variables.push(`{{ClientInput_${node.data.clientInputId}}}`));
    loadSecretVariables();
    if (nodes?.find((node) => node.data.stepType === "auth")) loadTaraVariables();
    setAvailableVariables((prevVariables) => {
      variables.forEach((v) => {
        if (!prevVariables.prod.includes(v)) prevVariables.prod.push(v);
      });
      return prevVariables;
    });
  }, []);

  const getSecrets = (data: { [key: string]: any }, path: string, result: string[]) => {
    Object.keys(data).forEach((k) => {
      if (typeof data[k] === "object") {
        getSecrets(data[k], path.length > 0 ? `${path}.${k}` : k, result);
        return;
      }
      result.push(path.length > 0 ? `{{${path}.${k}}}` : `{{${k}}}`);
    });
  };

  const loadSecretVariables = () => {
    axios.get(getSecretVariables()).then((result) => {
      const data: { [key: string]: any } = result.data;
      if (!data) return;
      if (Object.keys(secrets).length === 0) setSecrets(data);
      const prodVariables: string[] = [];
      const testVariables: string[] = [];
      if (data.prod) getSecrets(data.prod, "", prodVariables);
      if (data.test) getSecrets(data.test, "", testVariables);

      setAvailableVariables((prevVariables) => {
        prodVariables.forEach((v) => {
          if (!prevVariables.prod.includes(v)) prevVariables.prod.push(v);
        });
        testVariables.forEach((v) => {
          if (!prodVariables.includes(v) && !prevVariables.test.includes(v)) prevVariables.test.push(v);
        });
        return prevVariables;
      });
    });
  };

  const loadTaraVariables = () => {
    axios.post(getTaraAuthResponseVariables()).then((result) => {
      const data: { [key: string]: any } = result.data?.response?.body ?? {};
      const taraVariables: string[] = [];
      Object.keys(data).forEach((key) => taraVariables.push(`{{TARA.${key}}}`));
      setAvailableVariables((oldVaraibles) => {
        taraVariables.forEach((tv) => {
          if (!oldVaraibles.prod.includes(tv)) oldVaraibles.prod.push(tv);
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

  const getAvailableRequestValues = (endpointId: string): PreDefinedEndpointEnvVariables => {
    const otherEndpoints = getSelectedEndpoints().filter((otherEndpoint) => otherEndpoint.id !== endpointId);
    otherEndpoints.forEach((endpoint) => {
      endpoint.selectedEndpoint?.response?.forEach((response) => {
        const variable = `{{${endpoint.name === "" ? endpoint.id : endpoint.name}.${response.name}}}`;
        if (!availableVariables.prod.includes(variable)) availableVariables.prod.push(variable);
      });
    });
    return availableVariables;
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
          secrets={secrets}
          serviceDescription={description}
          serviceName={serviceName}
          continueOnClick={() => {
            navigate(ROUTES.FLOW_ROUTE, {
              state: {
                endpoints,
                secrets,
                serviceName,
                flow: location.state?.flow,
                serviceDescription: description,
              },
            });
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
              <FormInput name="name" label="" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="description">{t("newService.description")}</label>
              <FormTextarea
                name="description"
                label=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
