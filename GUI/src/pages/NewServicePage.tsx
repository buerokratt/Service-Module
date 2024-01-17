import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  FormInput,
  ApiEndpointCard,
  FormTextarea,
  Layout,
  NewServiceHeader,
  Track,
  Switch,
} from "../components";
import { ROUTES } from "../resources/routes-constants";
import axios from "axios";
import { getSecretVariables as getSecretVariablesApi, getTaraAuthResponseVariables, jsonToYml } from "../resources/api-constants";
import {
  EndpointData,
  EndpointEnv,
  EndpointType,
  EndpointVariableData,
  PreDefinedEndpointEnvVariables,
} from "../types/endpoint";
import { ToastContext } from "../components/Toast/ToastContext";
import { Step } from "types/step";
import { StepType } from "types/step-type.enum";
import { RawData } from "types";
import useStore from "store/store";
import useServiceStore from "store/new-services.store";
import { saveEndpoints } from "services/service-builder";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userInfo = useStore((state) => state.userInfo);
  const { 
    serviceId,
    endpoints,
    flow,
    isCommon,
    setIsCommon,
    description,
    setDescription,
    secrets,
    availableVariables,
    serviceName,
    changeServiceName,
    addEndpoint,
    loadFlowData,
  } = useServiceStore();

  const toast = useContext(ToastContext);

  const { intentName } = useParams();
  useEffect(() => {
    const name = intentName?.trim();
    if(name) changeServiceName(name);
  }, [intentName])

  useEffect(() => {
    loadFlowData();
  }, []);

  const saveDraft = async () => {
    if (serviceName && description) {
      await saveEndpoints(
        endpoints,
        serviceName, 
        (r) => {
        console.log(r);
        toast.open({
          type: "success",
          title: t("newService.toast.success"),
          message: t("newService.toast.savedSuccessfully"),
        });
      },
      (e) => {
        console.log(e);
        toast.open({
          type: "error",
          title: t("newService.toast.failed"),
          message: t("newService.toast.saveFailed"),
        });
      });
    } else {
      toast.open({
        type: "error",
        title: t("newService.toast.missingFields"),
        message: t("newService.toast.serviceMissingFields"),
      });
    }
  };

  return (
    <Layout
      disableMenu
      customHeader={
        <NewServiceHeader
          activeStep={2}
          availableVariables={availableVariables}
          saveDraftOnClick={saveDraft}
          isSaveButtonEnabled={endpoints.length > 0}
          flow={flow}
          secrets={secrets}
          serviceDescription={description}
          serviceName={serviceName}
          serviceId={serviceId}
          isCommon={isCommon}
          continueOnClick={() => {
            if (serviceName && description) {
              navigate(ROUTES.FLOW_ROUTE, {
                state: {
                  endpoints,
                  secrets,
                  serviceName,
                  serviceId,
                  availableVariables,
                  flow,
                  serviceDescription: description,
                  isCommon,
                },
              });
            } else {
              toast.open({
                type: "error",
                title: t("newService.toast.missingFields"),
                message: t("newService.toast.serviceMissingFields"),
              });
            }
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
              <FormInput name="name" label="" value={serviceName} onChange={(e) => changeServiceName(e.target.value)} />
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
            {userInfo?.authorities.includes("ROLE_ADMINISTRATOR") && (
              <Track gap={16}>
                <label htmlFor="isCommon">{t("newService.isCommon")}</label>
                <Switch
                  name="isCommon"
                  label=""
                  onLabel={t("global.yes").toString()}
                  offLabel={t("global.no").toString()}
                  value={isCommon}
                  checked={isCommon}
                  onCheckedChange={(e) => setIsCommon(e)}
                />
              </Track>
            )}
          </Track>
        </Card>

        {endpoints.map((endpoint) => (
          <ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
        ))}
        <Button
          appearance="text"
          onClick={addEndpoint}
        >
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
