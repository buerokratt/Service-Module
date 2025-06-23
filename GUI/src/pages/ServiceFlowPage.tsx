import Chat from "components/chat/chat";
import withAuthorization, { ROLES } from "hoc/with-authorization";
import { CSSProperties, FC, useEffect, useRef, useState } from "react";
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
  StepElement,
  Switch,
  Track,
} from "../components";
import { ROUTES } from "../resources/routes-constants";
import { Step, stepsLabels, StepType } from "../types";
import "./ServiceFlowPage.scss";

import ApiEndpoint from "components/ApiEndpoint";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import api from "../services/api-dev";
import { changeServiceStatus, userStepPreferences } from "resources/api-constants";
import { Mosaic } from "react-loading-indicators";
import { MdOutlineEdit } from "react-icons/md";
import ChooseSlotModel from "./Integration/ChooseSlotModel";
import ConnectServiceToIntentModel from "./Integration/ConnectServiceToIntentModel";
import { Intent } from "types/Intent";
import useServiceListStore from "store/services.store";

const ServiceFlowPage: FC = () => {
  const { t } = useTranslation();

  const [allElements, setAllElements] = useState<Step[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const name = useServiceStore((state) => state.serviceNameDashed());
  const description = useServiceStore((state) => state.description);
  const slot = useServiceStore((state) => state.slot);
  const steps = useServiceStore((state) => state.mapEndpointsToSetps());
  const [isChooseSlotsModalVisible, setIsChooseSlotsModalVisible] = useState(false);
  const [isIntentConnectionModalVisible, setIsIntentConnectionModalVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const selectedService = useServiceListStore((state) => state.selectedService);
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
  const stepPreferences = useServiceStore((state) => state.stepPreferences);

  useEffect(() => {
    const elements: Step[] = [];
    stepPreferences.forEach((preference, index) => {
      elements.push({
        id: index,
        label: t(`${stepsLabels[preference as StepType]}`),
        type: preference as StepType,
      });
    });
    setAllElements(elements);
  }, [stepPreferences]);

  const setNodes = useServiceStore((state) => state.setNodes);

  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "245px" };

  function updateStepPreference(steps: Step[]) {
    api.post(userStepPreferences(), {
      steps: steps.map((e) => e.type),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAllElements((elements) => {
        const oldIndex = elements.findIndex((item) => item.id === active.id);
        const newIndex = elements.findIndex((item) => item.id === over.id);
        const newElements = arrayMove(elements, oldIndex, newIndex);
        updateStepPreference(newElements);
        return newElements;
      });
    }
    setActiveElement(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeElement, setActiveElement] = useState<Step | null>(null);
  const handleDragStart = (event: DragStartEvent) => {
    const step = event.active.data.current?.step as Step;
    setActiveElement(step);
  };
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  function getEditingButton(onClick: () => void) {
    return (
      <Button appearance="text" onClick={onClick} style={{ boxShadow: "none" }}>
        <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
      </Button>
    );
  }

  const requestServiceIntentConnection = (intent: string) => {
    useServiceListStore
      .getState()
      .requestServiceIntentConnection(
        () => setIsIntentConnectionModalVisible(false),
        t("overview.service.toast.connectedToIntentSuccessfully"),
        t("overview.service.toast.failed.failedToConnectToIntent"),
        intent,
        {
          pageIndex: 0,
          pageSize: 10,
        },
        []
      )
      .then(() => {
        navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
        useServiceStore.getState().resetState();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <NewServiceHeader
        activeStep={activeStep}
        continueOnClick={() => {
          if (activeStep === 1) {
            useServiceStore
              .getState()
              .onContinueClick()
              .then(() => {
                setActiveStep(2);
                setIsIntentConnectionModalVisible(true);
                useServiceStore.getState().loadService(id);
              })
              .catch((error) => {
                console.error(error);
              });
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
            defaultOpen={false}
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
            <div className="graph__controls">
                <Track direction="vertical" gap={16} align="stretch">
                  {steps && (
                    <Collapsible title={t("serviceFlow.apiElements.title")} contentStyle={contentStyle}>
                      <Track direction="vertical" align="stretch" gap={4}>
                        {steps.map((step) => (
                          <ApiEndpoint step={step} key={step.id} />
                        ))}
                      </Track>
                    </Collapsible>
                  )}
                  {allElements && (
                    <DndContext
                      modifiers={[restrictToWindowEdges]}
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragEnd={handleDragEnd}
                      onDragStart={handleDragStart}
                    >
                      <Collapsible title={t("serviceFlow.allElements")} contentStyle={contentStyle}>
                        <Track direction="vertical" align="stretch" gap={4}>
                          <SortableContext items={allElements} strategy={verticalListSortingStrategy}>
                            {allElements.map((element) => (
                              <StepElement key={element.id} step={element} activeStep={activeElement} />
                            ))}
                          </SortableContext>
                        </Track>
                      </Collapsible>
                      <DragOverlay>
                        {activeElement ? <StepElement key={activeElement.id} step={activeElement} /> : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </Track>
              </div>
            <div style={{ width: "100%", height: `${isInfoOpen ? 55 : 84.5}%` }}>
              <FlowBuilder description={description} nodes={nodes} setNodes={setNodes} edges={edges} />
            </div>
            <Chat />
          </ReactFlowProvider>
          {isChooseSlotsModalVisible && <ChooseSlotModel onModalClose={() => setIsChooseSlotsModalVisible(false)} />}
          {isIntentConnectionModalVisible && (
            <ConnectServiceToIntentModel
              onModalClose={() => {
                api
                  .post(changeServiceStatus(), {
                    id: selectedService?.serviceId ?? "",
                    state: "draft",
                    type: selectedService?.type ?? "POST",
                  })
                  .then(() => {
                    setIsIntentConnectionModalVisible(false);
                    setActiveStep(1);
                    useServiceStore.getState().loadService(id);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }}
              onConnect={(intent: Intent) => requestServiceIntentConnection(intent.intent)}
              canCancel={false}
              canSkip={true}
              onSkip={() => {
                navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
                useServiceStore.getState().resetState();
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default withAuthorization(ServiceFlowPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
