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
  Modal,
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
import withUnsavedChanges, { WithUnsavedChangesProps } from "hoc/withUnsavedChanges";

const ServiceFlowPage: FC<WithUnsavedChangesProps> = ({
  hasUnsavedChanges,
  setHasUnsavedChanges,
  showConfirmation,
  proceedNavigation,
  cancelNavigation,
  handleProgrammaticNavigation,
}) => {
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
        backOnClick={() => {
          if (hasUnsavedChanges) {
            handleProgrammaticNavigation(ROUTES.OVERVIEW_ROUTE);
          } else {
            useServiceStore.getState().resetState();
            navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
          }
        }}
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
            await useServiceListStore.getState().changeServiceStateToDraft(serviceResponse.data);
            navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, serviceId));
          } else {
            await useServiceListStore.getState().changeServiceStateToDraft();
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
                      setHasUnsavedChanges(true);
                      const value = e.target.value.trimStart().replaceAll(/_+/g, "_");
                      const hasSpecialCharacters = /[^\p{L}\p{N}_ ]/u;
                      if (!hasSpecialCharacters.test(value) && !value.startsWith(" ")) {
                        useServiceStore.getState().changeServiceName(value);
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
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      useServiceStore.getState().setDescription(e.target.value);
                    }}
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
                  onCheckedChange={(e) => {
                    setHasUnsavedChanges(true);
                    useServiceStore.getState().setIsCommon(e);
                  }}
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
          {isChooseSlotsModalVisible && (
            <ChooseSlotModel
              onModalClose={(selection) => {
                if (selection) {
                  setHasUnsavedChanges(true);
                }
                setIsChooseSlotsModalVisible(false);
              }}
            />
          )}
          {showConfirmation && (
            <Modal title={t("newService.popup.unsavedChanges")} onClose={() => {}}>
              <Track gap={10} align="center" justify="end">
                <Button
                  appearance="error"
                  onClick={() => {
                    cancelNavigation();
                  }}
                >
                  {t("global.cancel")}
                </Button>
                <Button
                  appearance="primary"
                  style={{ marginLeft: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    proceedNavigation();
                    useServiceStore.getState().resetState();
                    setHasUnsavedChanges(false);
                  }}
                >
                  {t("global.continue")}
                </Button>
              </Track>
            </Modal>
          )}
        </>
      )}
    </>
  );
};

export default withUnsavedChanges(withAuthorization(ServiceFlowPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]));
