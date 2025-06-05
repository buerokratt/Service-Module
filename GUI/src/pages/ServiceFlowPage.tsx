import Chat from "components/chat/chat";
import withAuthorization, { ROLES } from "hoc/with-authorization";
import { CSSProperties, FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { saveFlowClick } from "services/service-builder";
import useServiceStore from "store/new-services.store";
import { Collapsible, FlowElementsPopup, NewServiceHeader, StepElement, Track } from "../components";
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

const ServiceFlowPage: FC = () => {
  const { t } = useTranslation();

  const [allElements, setAllElements] = useState<Step[]>([]);

  const navigate = useNavigate();
  const description = useServiceStore((state) => state.description);
  const steps = useServiceStore((state) => state.mapEndpointsToSetps());
  const name = useServiceStore((state) => state.serviceNameDashed());
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    useServiceStore
      .getState()
      .loadService(id)
      .then(() => {
        useServiceStore.getState().loadEndpointsResponseVariables();
      });
    useServiceStore.getState().loadStepPreferences();  
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
      <h1 style={{ paddingLeft: 16, paddingTop: 16 }}>
        {t("serviceFlow.flow")} "{name}"
      </h1>
      <h5
        style={{
          paddingLeft: 16,
          paddingBottom: 5,
          wordBreak: "break-all",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {description}
      </h5>
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
    </>
  );
};

export default withAuthorization(ServiceFlowPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
