import React from "react";
import { useTranslation } from "react-i18next";
import { Track } from "components";
import AssignElement from "./assignElement";
import { useAssignBuilder } from "./useAssignBuilder";
import "../styles.scss";
import { Assign } from "../../../types/assign";
import ObjectEditor from "./ObjectEditor";

interface AssignBuilderProps {
  onChange: (group: Assign[]) => void;
  seedGroup: Assign[];
}

const AssignBuilder: React.FC<AssignBuilderProps> = ({ onChange, seedGroup }) => {
  const { t } = useTranslation();
  const { elements, addElement, remove, changeElement } = useAssignBuilder({
    onChange,
    seedGroup,
  });

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
