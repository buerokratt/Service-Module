import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import apiIconTag from "../../assets/images/api-icon-tag.svg";
import axios from "axios";
import { useParams } from "react-router-dom";
import Box from "components/Box";
import Button from "components/Button";
import Icon from "components/Icon";
import Track from "components/Track";
import { getServicesByEndpointId } from "resources/api-constants";
import { Step, StepType } from "types";
import { EndpointData } from "types/endpoint";
import Popup from "components/Popup";
import { onDragStart } from "utils/component-util";

interface RelatedService {
  serviceId: string;
  name: string;
}

interface ApiEndpointProps {
  step: Step;
}

const ApiEndpoint: FC<ApiEndpointProps> = ({ step }) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const deleteApiElement = async (endpoint: EndpointData) => {
    console.log("DATA", endpoint);

    console.log("making request", {
      endpointId: endpoint.id,
      excludedServiceId: id,
    });

    // todo check isCommon
    if (endpoint.isCommon) {
      const servicesResponse = await axios.get<RelatedService[]>(getServicesByEndpointId(endpoint.id, id));
      console.log("got services", servicesResponse);
      setRelatedServices(servicesResponse.data);
    } else {
      // todo other logic
      // todo delete also from canvas
    }
  };

  return (
    <>
      {/* todo content */}
      {relatedServices.length > 0 && (
        <Popup title={t("serviceFlow.deleteBlocked")} onClose={() => setRelatedServices([])}>
          <p>{t("serviceFlow.deleteBlockedMessage")}</p>
        </Popup>
      )}

      <Box
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
        onDragStart={(event) => onDragStart(event, step)}
        draggable
      >
        <Track gap={8} style={{ overflow: "hidden" }}>
          {step.type === "user-defined" && <img alt="" src={apiIconTag} />}
          {step.label}

          {/* todo style */}
          {/* todo on hover */}
          <Button appearance="text" onClick={() => deleteApiElement(step.data!)}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("serviceFlow.delete")}
          </Button>
        </Track>
      </Box>
    </>
  );
};

export default ApiEndpoint;
