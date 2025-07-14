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
  const steps = useServiceStore((state) => state.mapEndpointsToSteps());
  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "245px" };
  const [isAddEndpointModalVisible, setIsAddEndpointModalVisible] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const [endpoint, setEndpoint] = useState<EndpointData>({
    endpointId: uuid(),
    name: "",
    definitions: [],
    isNew: true,
  });

  const stepPreferences = useServiceStore((state) => state.stepPreferences);

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
        const oldIndex = elements.findIndex((item) => item.id === active.id);
        const newIndex = elements.findIndex((item) => item.id === over.id);
        const newElements = arrayMove(elements, oldIndex, newIndex);
        updateStepPreference(newElements);
        return newElements;
      });
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
          <Track direction="vertical" align="stretch" gap={15}>
            <Collapsible
              defaultOpen={true}
              title={t("serviceFlow.apiElements.title")}
              contentStyle={contentStyle}
              onAddClick={() => {
                setIsAddEndpointModalVisible(true);
              }}
            >
              {steps.length > 0 && (
                <Track direction="vertical" align="stretch" gap={4}>
                  {steps.map((step) => (
                    <button key={step.id} onClick={() => setDropdownOpen(false)}>
                      <ApiEndpoint
                        step={step}
                        onClick={(step) => {
                          onEdgeAdd(step);
                          setDropdownOpen(false);
                        }}
                      />
                    </button>
                  ))}
                </Track>
              )}
            </Collapsible>

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
        {isAddEndpointModalVisible && (
          <Modal title={t("newService.createNewEndpoint")} onClose={() => setIsAddEndpointModalVisible(false)}>
            <Track isMultiline gap={16} direction="vertical" align="stretch">
              <ApiEndpointCard endpoint={endpoint} isDeletable={false} />
              <Track justify="end" gap={16}>
                <Button appearance="secondary" onClick={() => setIsAddEndpointModalVisible(false)}>
                  {t("overview.cancel")}
                </Button>
                <Button
                  appearance={isCreatingEndpoint ? "loading" : "primary"}
                  onClick={() => {
                    setIsCreatingEndpoint(true);
                    saveEndpoints(
                      [endpoint],
                      () => {
                        useServiceStore.getState().addEndpoint(endpoint);
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
