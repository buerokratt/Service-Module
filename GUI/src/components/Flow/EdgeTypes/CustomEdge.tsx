import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { Collapsible, Dropdown, StepElement, Track } from 'components';
import useEdgeAdd from 'hooks/flow/useEdgeAdd';
import { CSSProperties, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userStepPreferences } from 'resources/api-constants';
import api from 'services/api';
import useServiceStore from 'store/new-services.store';
import { Step, stepsLabels, StepType } from 'types';

import ApiElementsPanel from './ApiElementsPanel';

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
    overflowY: 'auto',
    maxHeight: 'calc(30vh - 42px)',
    minHeight: '80px',
  };
  const { setHasUnsavedChanges } = useServiceStore();

  const stepPreferences = useServiceStore((state) => state.stepPreferences);

  const onEdgeAdd = useEdgeAdd(id);

  useEffect(() => {
    const elements: Step[] = [];
    stepPreferences.forEach((preference, index) => {
      // Add more steps when they are ready
      const allowedSteps = [
        StepType.Condition,
        StepType.Assign,
        StepType.Textfield,
        StepType.MultiChoiceQuestion,
        StepType.DynamicChoices,
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
  }, [stepPreferences, t]);

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function updateStepPreference(steps: Step[]) {
    void api.post(userStepPreferences(), {
      steps: steps.map((e) => e.type),
    });
  }

  return (
    <>
      <BaseEdge id={id} style={style} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <Dropdown
          open={dropdownOpen}
          centered={true}
          onOpenChange={setDropdownOpen}
          onClose={() => setDropdownOpen(false)}
          title={t('serviceFlow.elements').toString()}
          trigger={
            <button
              style={{
                transform: `translate(${edgeCenterX}px, ${edgeCenterY}px) translate(-50%, -50%)`,
              }}
              onClick={() => {}}
              className="edge-button nodrag nopan"
            >
              {label ?? '+'}
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
              <Collapsible title={t('serviceFlow.allElements')} contentStyle={contentStyle} defaultOpen>
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

            {/* API elements — mini registry */}
            <ApiElementsPanel
              onAddToCanvas={(step) => {
                onEdgeAdd(step);
                useServiceStore.getState().loadEndpointsResponseVariables();
                setDropdownOpen(false);
                setHasUnsavedChanges(true);
              }}
            />
          </Track>
        </Dropdown>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
