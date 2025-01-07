import React from 'react';
import { useTranslation } from 'react-i18next';
import { Track } from 'components';
import { ElementGroupBuilderProps } from "./assign-types";
import AssignElement from "./assignElement";
import { useAssignBuilder } from './useAssignBuilder';
import '../styles.scss';

const AssignBuilder: React.FC<ElementGroupBuilderProps> = ({ assignElements, onRemove, onChange, seedGroup }) => {
  const { t } = useTranslation();
  const {
    elements,
    addElement,
    remove,
    changeElement,
  } = useAssignBuilder({
    assignElements,
    root: !onRemove,
    onChange,
    seedGroup,
   });

   console.log('elements = ', elements);
  
  return (
    <Track gap={16} direction="vertical" align="stretch" className="assign-action-container">
      <Track justify="end">
        <Track gap={8}>
          <button className="small-assign-button assign-blue" onClick={addElement}>
            {t("serviceFlow.popup.addElement")}
          </button>
        </Track>
      </Track>
      {elements?.map((element) => (
        <AssignElement key={element.id} element={element} onRemove={remove} onChange={changeElement} />
      ))}
    </Track>
  );
};

export default AssignBuilder;
