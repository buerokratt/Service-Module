import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Icon, Track } from 'components';
import { Assign, ElementGroupBuilderProps } from "./assign-types";
import AssignElement from "./assignElement";
import { useAssignBuilder } from './useAssignBuilder';
import '../styles.scss';

const AssignBuilder: React.FC<ElementGroupBuilderProps> = ({ group, onRemove, onChange, seedGroup }) => {
  const { t } = useTranslation();
  const {
    elements,
    addElement,
    remove,
    changeElement,
  } = useAssignBuilder({ 
    group,
    root: !onRemove,
    onChange,
    seedGroup,
   });
  
  return (
    <Track gap={16} direction="vertical" align="stretch" className="rule-action-container">
      <Track justify="end">
        <Track gap={8}>
          <button className="small-rule-button rule-blue" onClick={addElement}>
            {t("serviceFlow.popup.addRule")}
          </button>
          {onRemove && (
            <button className="small-rule-button rule-red" onClick={() => onRemove(group!.id)}>
              <Icon icon={<MdDeleteOutline />} />
            </button>
          )}
        </Track>
      </Track>
      {elements?.map((element) => (
        <AssignElement key={element.id} element={element as Assign} onRemove={remove} onChange={changeElement} />
      ))}
    </Track>
  );
};

export default AssignBuilder;
