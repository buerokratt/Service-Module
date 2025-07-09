import Chat from "components/chat/chat";
import withAuthorization, { ROLES } from "hoc/with-authorization";
import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useServiceStore from "store/new-services.store";
import {
  Button,
  Card,
  Collapsible,
  FlowBuilder,
  FlowElementsPopup,
  FormInput,
  Icon,
  NewServiceHeader,
  Switch,
  Track,
} from "../components";
import { ROUTES } from "../resources/routes-constants";
import "./ServiceFlowPage.scss";
import { Mosaic } from "react-loading-indicators";
import { MdOutlineEdit } from "react-icons/md";
import ChooseSlotModel from "./Integration/ChooseSlotModel";
import { Service } from "types";
import { getServiceById } from "resources/api-constants";
import useServiceListStore from "store/services.store";
import api from "services/api";

const ServiceFlowPage: FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const name = useServiceStore((state) => state.serviceNameDashed());
  const description = useServiceStore((state) => state.description);
  const slot = useServiceStore((state) => state.slot);
  const [isChooseSlotsModalVisible, setIsChooseSlotsModalVisible] = useState(false);
  const isCommon = useServiceStore((state) => state.isCommon);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      useServiceStore.getState().loadStepPreferences();
      return;
    }
    setLoading(true);
    useServiceStore
      .getState()
      .loadService(id)
      .then(() => {
        useServiceStore.getState().loadEndpointsResponseVariables();
        useServiceStore
          .getState()
          .loadStepPreferences()
          .then(() => {
            setLoading(false);
          });
      });
  }, []);

  const edges = useServiceStore((state) => state.edges);
  const nodes = useServiceStore((state) => state.nodes);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  function getEditingButton(onClick: () => void) {
    return (
      <Button appearance="text" onClick={onClick} style={{ boxShadow: "none" }}>
        <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
      </Button>
    );
  }

  return (
    <>
      <NewServiceHeader
        activeStep={1}
        continueOnClick={() => {
          useServiceStore
            .getState()
            .onContinueClick()
            .then(() => {
              navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
              useServiceStore.getState().resetState();
            })
            .catch((error) => {
              console.error(error);
            });
        }}
        saveOnClick={async () => {
          if (!id) {
            const serviceId = useServiceStore.getState().serviceId;
            const serviceResponse = await api.get<Service>(getServiceById(serviceId));
            useServiceListStore.getState().setSelectedService(serviceResponse.data);
            navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, serviceId));
          }
        }}
      />
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Mosaic
            color="#005aa3"
            size="medium"
            text={`${t("global.loading")}...`}
            textColor="black"
            style={{ textAlign: "end" }}
          />
        </div>
      ) : (
        <>
          <Collapsible
            title={t("serviceFlow.serviceInfo")}
            defaultOpen={!id}
            contentStyle={{ padding: "0" }}
            onStateChange={(open) => setIsInfoOpen(open)}
          >
            <Card isBodyDivided={true} borderless={true} isBackground={true}>
              <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
                <div>
                  <FormInput
                    ref={titleRef}
                    name={""}
                    placeholder={t("newService.title").toString()}
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      const hasSpecialCharacters = /[^\p{L}\p{N} ]/u;
                      if (!hasSpecialCharacters.test(value) && !value.startsWith(" ")) {
                        useServiceStore.getState().changeServiceName(e.target.value);
                      }
                    }}
                    style={{
                      minWidth: "250px",
                      width: "20vw",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "1.5em",
                    }}
                  />
                </div>
                {getEditingButton(() => {
                  titleRef?.current?.focus();
                })}
                {!name && <label style={{ color: "#d73e3e" }}>{t("newService.titleRequired")}</label>}
              </Track>
              <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
                <div>
                  <FormInput
                    ref={descriptionRef}
                    name={""}
                    placeholder={t("newService.description").toString()}
                    value={description}
                    onChange={(e) => useServiceStore.getState().setDescription(e.target.value)}
                    style={{
                      minWidth: "250px",
                      width: "20vw",
                      backgroundColor: "transparent",
                      border: "none",
                      textOverflow: "ellipsis",
                    }}
                  />
                </div>
                {getEditingButton(() => {
                  descriptionRef?.current?.focus();
                })}
              </Track>
              <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
                  <FormInput
                    name={""}
                    placeholder={t("newService.chooseMemorySlots").toString()}
                    value={""}
                    readOnly={true}
                    onClick={() => setIsChooseSlotsModalVisible(true)}
                    style={{
                      minWidth: slot ? "130px" : "250px",
                      width: slot ? "17vw" : "20vw",
                      backgroundColor: "transparent",
                      border: "none",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                    }}
                  />
                  {slot && (
                    <button
                      style={{
                        border: "1px solid",
                        padding: "7px",
                        fontSize: "0.9em",
                        minWidth: "130px",
                        maxWidth: "130px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                      }}
                      onClick={() => {
                        setIsChooseSlotsModalVisible(true);
                      }}
                    >
                      {slot ?? ""}
                    </button>
                  )}
                </div>
                {getEditingButton(() => {
                  setIsChooseSlotsModalVisible(true);
                })}
              </Track>
              <Track style={{ paddingLeft: "26px" }}>
                <Switch
                  name="isCommon"
                  label={t("newService.isCommon")}
                  onLabel={t("global.yes").toString()}
                  offLabel={t("global.no").toString()}
                  value={isCommon}
                  checked={isCommon}
                  onCheckedChange={(e) => useServiceStore.getState().setIsCommon(e)}
                />
              </Track>
            </Card>
          </Collapsible>
          <FlowElementsPopup />
          <ReactFlowProvider>
            <div style={{ width: "100%", height: `${isInfoOpen ? 55 : 84.5}%` }}>
              <FlowBuilder nodes={nodes} edges={edges} />
            </div>
            <Chat />
          </ReactFlowProvider>
          {isChooseSlotsModalVisible && <ChooseSlotModel onModalClose={() => setIsChooseSlotsModalVisible(false)} />}
        </>
      )}
    </>
  );
};

export default withAuthorization(ServiceFlowPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
