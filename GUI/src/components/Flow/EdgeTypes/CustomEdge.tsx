import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { CSSProperties, memo, useEffect, useState } from "react";
import { ApiEndpointCard, Button, Collapsible, Dropdown, Modal, StepElement, Track } from "components";
import useServiceStore from "store/new-services.store";
import ApiEndpoint from "components/ApiEndpoint";
import { useTranslation } from "react-i18next";
import { Step, stepsLabels, StepType } from "types";
import { v4 as uuid } from "uuid";
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
import { EndpointData } from "types/endpoint";
import { saveEndpoints } from "services/service-builder";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const contentStyle: CSSProperties = {
    overflowY: "auto",
    maxHeight: "calc(30vh - 42px)",
    minHeight: "80px",
  };
  const [isAddEndpointModalVisible, setIsAddEndpointModalVisible] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const [endpointNameExists, setEndpointNameExists] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<EndpointData>({
    endpointId: uuid(),
    name: "",
    definitions: [],
    isNew: true,
  });
  const { id: idParam } = useParams();
  const [endpointName, setEndpointName] = useState<string>(endpoint.name ?? "");
  const [isCommonEndpoint, setIsCommonEndpoint] = useState<boolean>(endpoint.isCommon ?? false);
  const { setHasUnsavedChanges } = useServiceStore();

  const stepPreferences = useServiceStore((state) => state.stepPreferences);
  const apiElements = useServiceStore((state) => state.apiElements);
  const setApiElements = useServiceStore((state) => state.setApiElements);

  const onEdgeAdd = useEdgeAdd(id);

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
      updateEndpointPreference(newElements);
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
    });
  }

  function updateEndpointPreference(endpoints: Step[]) {
    const endpointIds = endpoints.map((e) => e.data?.endpointId).filter(Boolean);

    api.post(userStepPreferences(), {
      steps: stepPreferences || [],
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
          <Modal
            title={t("newService.createNewEndpoint")}
            onClose={() => {
              setEndpoint({ endpointId: uuid(), name: "", definitions: [], isNew: true });
              setIsAddEndpointModalVisible(false);
            }}
          >
            <Track isMultiline gap={16} direction="vertical" align="stretch">
              <ApiEndpointCard
                endpoint={endpoint}
                isDeletable={false}
                onNameExists={setEndpointNameExists}
                onNameChange={setEndpointName}
                onCommonChange={setIsCommonEndpoint}
              />
              <Track justify="end" gap={16}>
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setEndpoint({ endpointId: uuid(), name: "", definitions: [], isNew: true });
                    setIsAddEndpointModalVisible(false);
                  }}
                >
                  {t("overview.cancel")}
                </Button>
                <Button
                  appearance={isCreatingEndpoint ? "loading" : "primary"}
                  disabled={endpointName === "" || endpointNameExists}
                  onClick={() => {
                    const passedEndpoint = endpoint;
                    passedEndpoint.name = endpointName;
                    passedEndpoint.isCommon = isCommonEndpoint;
                    setIsCreatingEndpoint(true);
                    saveEndpoints(
                      [passedEndpoint],
                      () => {
                        useServiceStore.getState().addEndpoint(passedEndpoint);
                        setIsAddEndpointModalVisible(false);
                        setEndpoint({ endpointId: uuid(), name: "", definitions: [], isNew: true });
                        useToastStore.getState().success({ title: t("serviceFlow.apiElements.createSuccess") });
                        setIsCreatingEndpoint(false);
                      },
                      (error) => {
                        console.error(`Error creating API endpoint: ${error}`);
                        useToastStore.getState().error({ title: t("serviceFlow.apiElements.createError") });
                        setIsCreatingEndpoint(false);
                      }
                    );
                  }}
                >
                  {t("global.create")}
                </Button>
              </Track>
            </Track>
          </Modal>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
