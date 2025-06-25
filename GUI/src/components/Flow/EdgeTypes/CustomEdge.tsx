import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { CSSProperties, memo, useEffect, useState } from "react";
import { Collapsible, Dropdown, StepElement, Track } from "components";
import useServiceStore from "store/new-services.store";
import ApiEndpoint from "components/ApiEndpoint";
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
  const steps = useServiceStore((state) => state.mapEndpointsToSetps());
  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "245px" };

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
            <Collapsible defaultOpen={true} title={t("serviceFlow.apiElements.title")} contentStyle={contentStyle}>
              <Track direction="vertical" align="stretch" gap={4}>
                {steps.map((step) => (
                  <button key={step.id} onClick={() => setDropdownOpen(false)}>
                    <ApiEndpoint step={step} />
                  </button>
                ))}
              </Track>
            </Collapsible>

            <DndContext
              modifiers={[restrictToParentElement]}
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <Collapsible title={t("serviceFlow.allElements")} contentStyle={contentStyle} defaultOpen>
                <Track direction="vertical" align="stretch" gap={4}>
                  <SortableContext items={allElements} strategy={verticalListSortingStrategy}>
                    {allElements.map((element) => (
                      <StepElement
                        key={element.id}
                        step={element}
                        onClick={(step) => {
                          setDropdownOpen(false);
                        }}
                      />
                    ))}
                  </SortableContext>
                </Track>
              </Collapsible>
            </DndContext>
          </Track>
        </Dropdown>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
