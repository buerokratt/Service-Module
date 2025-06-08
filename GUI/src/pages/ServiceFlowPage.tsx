import Chat from "components/chat/chat";
import withAuthorization, { ROLES } from "hoc/with-authorization";
import { CSSProperties, FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { saveFlowClick } from "services/service-builder";
import useServiceStore from "store/new-services.store";
import { Button, Card, Collapsible, FlowElementsPopup, FormInput, FormSelect, Icon, Label, NewServiceHeader, StepElement, Track } from "../components";
import FlowBuilder from "../components/FlowBuilder/FlowBuilder";
import { ROUTES } from "../resources/routes-constants";
import { Step, stepsLabels, StepType } from "../types";
import "./ServiceFlowPage.scss";

import ApiEndpoint from "components/ApiEndpoint";
import { closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import api from "../services/api-dev";
import { userStepPreferences } from "resources/api-constants";
import { Mosaic } from "react-loading-indicators";
import { MdOutlineEdit } from "react-icons/md";
import ChooseSlotModel from "./Integration/ChooseSlotModel";

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

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    useServiceStore
      .getState()
      .loadService(id)
      .then(() => {
        useServiceStore.getState().loadEndpointsResponseVariables();
        useServiceStore.getState().loadStepPreferences().then(() => {
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
        type: preference as StepType
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
  
  return (
    <>
      <NewServiceHeader
        activeStep={1}
        saveDraftOnClick={() => saveFlowClick()}
        continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
      />
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Mosaic color="#005aa3" size="medium" text={`${t('global.loading')}...`} textColor="black" style={{ textAlign: "end" }} />
        </div>
      ) : (
        <>
          <Card isBodyDivided={true} borderless={true} isBackground={true}>
            <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
              <div>
                <FormInput
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
              <Button appearance="text" onClick={() => {}} style={{ boxShadow: "none" }} disabled={true}>
                <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
              </Button>
              {!name && <label style={{ color: "#d73e3e" }}>{t("newService.titleRequired")}</label>}
            </Track>
            <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
              <div>
                <FormInput
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
              <Button appearance="text" onClick={() => {}} style={{ boxShadow: "none" }}>
                <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
              </Button>
            </Track>
            <Track style={{ alignItems: "center", gap: 8, width: "fit-content" }}>
              <FormInput
                name={""}
                placeholder={t("newService.chooseMemorySlots").toString()}
                value={""}
                readOnly={true}
                onClick={() => setIsChooseSlotsModalVisible(true)}
                style={{
                  minWidth: slot ? "112px":  '250px',
                  width: slot ? "12vw" : "20vw",
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
              <Button appearance="text" onClick={() => {}} style={{ boxShadow: "none" }}>
                <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
              </Button>
            </Track>
          </Card>
          <FlowElementsPopup />
          <ReactFlowProvider>
            <div className="graph">
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
              <FlowBuilder description={description} nodes={nodes} setNodes={setNodes} edges={edges} />
              <Chat />
            </div>
          </ReactFlowProvider>
          {isChooseSlotsModalVisible && <ChooseSlotModel onModalClose={() => setIsChooseSlotsModalVisible(false)} />}
        </>
      )}
    </>
  );
};

export default withAuthorization(ServiceFlowPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
