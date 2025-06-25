import { CSSProperties, FC, memo, useEffect, useState } from 'react';
import { Handle, Position } from "@xyflow/react";
import { Collapsible, Dropdown, StepElement, Track } from 'components';
import useServiceStore from 'store/new-services.store';
import ApiEndpoint from 'components/ApiEndpoint';
import { useTranslation } from 'react-i18next';
import { Step, stepsLabels, StepType } from 'types';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { userStepPreferences } from 'resources/api-constants';
import api from 'services/api';

const PlaceholderNode: FC = (props: any) => {
  const { t } = useTranslation();
  const [allElements, setAllElements] = useState<Step[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const label = props?.data.label;
  const { id, data, isConnectable } = props;
  const shouldOffsetHandles = data.childrenCount > 1;
  const handleOffset = 25;
  let offsetLeft = handleOffset * Math.floor(data.childrenCount / 2);
  if (data.childrenCount % 2 === 0) offsetLeft -= handleOffset / 2;
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
      setActiveElement(null);
    }

    const handleDragStart = (event: DragStartEvent) => {
      const step = event.active.data.current?.step as Step;
      setActiveElement(step);
    };
  
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


  const bottomHandles = (): JSX.Element => {
    return (
      <>
        {new Array(data.childrenCount).fill(0).map((_, i) => (
          <Handle
            key={`handle-${id}-${i}`}
            id={`handle-${id}-${i}`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={shouldOffsetHandles ? { marginLeft: -offsetLeft + i * handleOffset } : {}}
          />
        ))}
      </>
    );
  };

  return (
    <Dropdown
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      onClose={() => setDropdownOpen(false)}
      title={t("serviceFlow.elements").toString()}
      trigger={
        <button style={{ height: "100%", width: "100%" }}>
          <Handle type="target" position={Position.Top} />
          <p style={{ textAlign: "center" }}>{label ?? "+"}</p>
          {bottomHandles()}
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
          onDragStart={handleDragStart}
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
  );
};

export default memo(PlaceholderNode);
