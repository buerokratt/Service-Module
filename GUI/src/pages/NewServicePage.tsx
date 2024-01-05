import React, { useEffect } from "react";
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
import useStore from "store/store";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";
import { saveDraft } from "services/service-builder";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userInfo = useStore((state) => state.userInfo);
  const endpoints = useServiceStore(state => state.endpoints);
  const isCommon = useServiceStore(state => state.isCommon);
  const description = useServiceStore(state => state.description);
  const name = useServiceStore(state => state.name);
  const vaildServiceInfo = useServiceStore(state => state.vaildServiceInfo());
  const { intentName, id } = useParams();

  useEffect(() => {
    const name = intentName?.trim();
    if(name) {
      useServiceStore.getState().changeServiceName(name);
    }
  }, [intentName])

  useEffect(() => {
    useServiceStore.getState().loadService(id);
  }, []);

  return (
    <Layout
      disableMenu
      customHeader={
        <NewServiceHeader
          activeStep={2}
          saveDraftOnClick={saveDraft}
          isSaveButtonEnabled={endpoints.length > 0}
          serviceId={id}
          continueOnClick={() => {
            if (!vaildServiceInfo) {
              useToastStore.getState().error({
                title: t("newService.toast.missingFields"),
                message: t("newService.toast.serviceMissingFields"),
              });
              return;
            }

            navigate(`${ROUTES.FLOW_ROUTE}/${id}`);
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
              <FormInput name="name" label="" value={name} onChange={(e) => useServiceStore.getState().changeServiceName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="description">{t("newService.description")}</label>
              <FormTextarea
                name="description"
                label=""
                value={description}
                onChange={(e) => useServiceStore.getState().setDescription(e.target.value)}
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
                  onCheckedChange={(e) => useServiceStore.getState().setIsCommon(e)}
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
          onClick={useServiceStore.getState().addEndpoint}
        >
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
