import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import apiIconTag from "../../assets/images/api-icon-tag.svg";
import axios from "axios";
import { useParams } from "react-router-dom";
import Box from "components/Box";
import Button from "components/Button";
import Collapsible from "components/Collapsible";
import Icon from "components/Icon";
import Track from "components/Track";
import { getServicesByEndpointId } from "resources/api-constants";
import { Step, StepType } from "types";
import { EndpointData } from "types/endpoint";

interface ApiElementsListProps {
  steps: Step[];
  contentStyle: React.CSSProperties;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, step: Step) => void;
}

const ApiElementsList: FC<ApiElementsListProps> = ({ steps, contentStyle, onDragStart }) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [showDeleteServicePopup, setShowDeleteServicePopup] = useState(false);
  const [showDeleteEndpointPopup, setShowDeleteEndpointPopup] = useState(false);

  const deleteApiElement = async (endpoint: EndpointData) => {
    console.log("DATA", endpoint);

    console.log("making request", {
      endpointId: endpoint.id,
      excludedServiceId: id,
    });

    const services = await axios.get(getServicesByEndpointId(endpoint.id, id));
    console.log("got services", services);
  };

  return (
    <Collapsible title={t("serviceFlow.apiElements")} contentStyle={contentStyle}>
      <Track direction="vertical" align="stretch" gap={4}>
        {steps.map((step) => (
          <Box
            key={step.id}
            color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
            onDragStart={(event) => onDragStart(event, step)}
            draggable
          >
            <Track gap={8} style={{ overflow: "hidden" }}>
              {step.type === "user-defined" && <img alt="" src={apiIconTag} />}
              {step.label}

              <Button appearance="text" onClick={() => deleteApiElement(step.data!)}>
                <Icon icon={<MdDeleteOutline />} size="medium" />
                {t("serviceFlow.delete")}
              </Button>
            </Track>
          </Box>
        ))}
      </Track>
    </Collapsible>
  );
};

export default ApiElementsList;
