import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { CSSProperties, memo, useEffect, useState } from "react";
import { Collapsible, Dropdown, StepElement, Track } from "components";
import useServiceStore from "store/new-services.store";
import ApiEndpoint from "components/ApiEndpoint";
import AddEndpointModal from "./AddEndpointModal";
import { useTranslation } from "react-i18next";
import { Step, stepsLabels, StepType } from "types";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { userStepPreferences } from "resources/api-constants";
import api from "services/api";
import useEdgeAdd from "hooks/flow/useEdgeAdd";
import useToastStore from "store/toasts.store";
import { useParams } from "react-router-dom";

function reorderElements<T>(elements: T[], activeId: string | number, overId: string | number): T[] {
  const oldIndex = elements.findIndex((item: any) => item.id === activeId);
  const newIndex = elements.findIndex((item: any) => item.id === overId);
  return arrayMove(elements, oldIndex, newIndex);
}

function CustomEdge({
  id,
  label,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { t } = useTranslation();
  const [allElements, setAllElements] = useState<Step[]>([]);
  const [apiElements, setApiElements] = useState<Step[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const contentStyle: CSSProperties = {
    overflowY: "auto",
    maxHeight: "calc(30vh - 42px)",
    minHeight: "80px",
  };
  const [isAddEndpointModalVisible, setIsAddEndpointModalVisible] = useState(false);
  const { id: idParam } = useParams();
  const { setHasUnsavedChanges } = useServiceStore();

  const stepPreferences = useServiceStore((state) => state.stepPreferences);
  const mapEndpointsToSteps = useServiceStore((state) => state.mapEndpointsToSteps);
  const endpoints = useServiceStore((state) => state.endpoints);

  const onEdgeAdd = useEdgeAdd(id);

  useEffect(() => {
    const elements: Step[] = [];
    stepPreferences.forEach((preference, index) => {
      // Add more steps when they are ready
      const allowedSteps = [
        StepType.Condition,
        StepType.Assign,
        StepType.MultiChoiceQuestion,
        StepType.FinishingStepRedirect,
        StepType.FinishingStepEnd,
      ];

      if (allowedSteps.includes(preference as StepType)) {
        elements.push({
          id: index,
          label: t(`${stepsLabels[preference as StepType]}`),
          type: preference as StepType,
        });
      }
    });
    setAllElements(elements);
  }, [stepPreferences]);

  useEffect(() => {
    const steps = mapEndpointsToSteps();
    setApiElements(steps);
    // endpoints in the dependency array below needed to re-run when new endpoints are added
  }, [mapEndpointsToSteps, endpoints]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAllElements((elements) => {
        const newElements = reorderElements(elements, active.id, over.id);
        updateStepPreference(newElements);
        return newElements;
      });
    }
  }

  function handleApiDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentElements = apiElements;
      const newElements = reorderElements(currentElements, active.id, over.id);
      setApiElements(newElements);
      const endpointIds = newElements.map((e) => e.data!.endpointId);
      updateEndpointPreference(endpointIds);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function updateStepPreference(steps: Step[]) {
    api.post(userStepPreferences(), {
      steps: steps.map((e) => e.type),
      endpoints: apiElements.map((e) => e.data!.endpointId),
    });
  }

  function updateEndpointPreference(endpointIds: string[]) {
    api.post(userStepPreferences(), {
      steps: stepPreferences,
      endpoints: endpointIds,
    });
  }

  return (
    <>
      <BaseEdge id={id} style={style} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <Dropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          onClose={() => setDropdownOpen(false)}
          title={t("serviceFlow.elements").toString()}
          trigger={
            <button
              style={{
                transform: `translate(${edgeCenterX}px, ${edgeCenterY}px) translate(-50%, -50%)`,
              }}
              onClick={() => {}}
              className="edge-button nodrag nopan"
            >
              {label ?? "+"}
            </button>
          }
        >
          {/* All elements */}
          <Track direction="vertical" align="stretch" gap={15}>
            <DndContext
              modifiers={[restrictToParentElement]}
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <Collapsible title={t("serviceFlow.allElements")} contentStyle={contentStyle} defaultOpen>
                {allElements.length > 0 && (
                  <Track direction="vertical" align="stretch" gap={4}>
                    <SortableContext items={allElements} strategy={verticalListSortingStrategy}>
                      {allElements.map((element) => (
                        <StepElement
                          key={element.id}
                          step={element}
                          onClick={(step) => {
                            onEdgeAdd(step);
                            setDropdownOpen(false);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      ))}
                    </SortableContext>
                  </Track>
                )}
              </Collapsible>
            </DndContext>

            {/* API elements */}
            <DndContext
              modifiers={[restrictToParentElement]}
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleApiDragEnd}
            >
              <Collapsible
                defaultOpen={true}
                title={t("serviceFlow.apiElements.title")}
                contentStyle={contentStyle}
                onAddClick={async () => {
                  if (!idParam) {
                    useToastStore.getState().error({
                      title: t("newService.toast.serviceNotFound"),
                      message: t("newService.toast.serviceNotFoundEndpointsMessage"),
                    });
                  } else {
                    setIsAddEndpointModalVisible(true);
                  }
                }}
              >
                {apiElements.length > 0 && (
                  <Track direction="vertical" align="stretch" gap={4}>
                    <SortableContext items={apiElements} strategy={verticalListSortingStrategy}>
                      {apiElements.map((step) => (
                        <ApiEndpoint
                          key={step.id}
                          step={step}
                          onClick={(step) => {
                            onEdgeAdd(step).then(() => {
                              useServiceStore.getState().loadEndpointsResponseVariables();
                            });
                            setDropdownOpen(false);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      ))}
                    </SortableContext>
                  </Track>
                )}
              </Collapsible>
            </DndContext>
          </Track>
        </Dropdown>

        {/* Add endpoint modal */}
        {isAddEndpointModalVisible && (
          <AddEndpointModal
            onClose={() => setIsAddEndpointModalVisible(false)}
            onUpdatePreferences={updateEndpointPreference}
            currentEndpointIds={apiElements.map((e) => e.data!.endpointId)}
          />
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
