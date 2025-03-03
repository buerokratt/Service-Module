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
  FormSelect,
} from "../components";
import { saveDraft } from "services/service-builder";
import useStore from "store/store";
import useServiceStore from "store/new-services.store";
import withAuthorization, { ROLES } from "hoc/with-authorization";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getSlots } from "resources/api-constants";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userInfo = useStore((state) => state.userInfo);
  const endpoints = useServiceStore((state) => state.endpoints);
  const isCommon = useServiceStore((state) => state.isCommon);
  const description = useServiceStore((state) => state.description);
  const slot = useServiceStore((state) => state.slot);
  const name = useServiceStore((state) => state.name);
  const { intentName, id } = useParams();
  const { data: slots } = useQuery<string[]>({
    queryKey: ["slots"],
    queryFn: () => axios.get(getSlots()).then((res) => res.data.response),
  });

  // TODO IMPORTANT reset select to empty string\
  // .concat({ label: "", value: "" })
  // todo make sure that scrolling works too todo

  useEffect(() => {
    const name = intentName?.trim();
    if (name) {
      useServiceStore.getState().changeServiceName(name);
    }
  }, [intentName]);

  useEffect(() => {
    useServiceStore.getState().loadService(id);
  }, [id]);

  return (
    <Layout
      disableMenu
      customHeader={
        <NewServiceHeader
          activeStep={2}
          saveDraftOnClick={() => saveDraft()}
          isSaveButtonEnabled={endpoints.length > 0}
          continueOnClick={() => useServiceStore.getState().onContinueClick(navigate)}
        />
      }
    >
      <Track style={{ width: 800, alignSelf: "center" }} direction="vertical" gap={16} align="stretch">
        <h1>{t("newService.serviceSetup")}</h1>
        <Card>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="name">{t("newService.name")}</label>
              <FormInput
                name="name"
                label=""
                value={name}
                onChange={(e) => useServiceStore.getState().changeServiceName(e.target.value)}
              />
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
            <div>
              <label htmlFor="slot">{t("newService.slot")}</label>
              <FormSelect
                name="slot"
                label=""
                options={slots?.map((slot) => ({ label: slot, value: slot })) ?? []}
                onSelectionChange={(selection) => useServiceStore.getState().setSlot(selection?.value ?? "")}
                defaultValue={slot}
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

        {endpoints
          .filter((endpoint) => endpoint.serviceId === id || !endpoint.hasOwnProperty("serviceId"))
          .map((endpoint) => (
            <ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
          ))}
        <Button appearance="text" onClick={useServiceStore.getState().addEndpoint}>
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default withAuthorization(NewServicePage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
