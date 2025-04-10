import axios from "axios";
import clsx from "clsx";
import Box from "components/Box";
import Button from "components/Button";
import Icon from "components/Icon";
import Popup from "components/Popup";
import Track from "components/Track";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { getServicesByEndpointId } from "resources/api-constants";
import { Step, StepType } from "types";
import { EndpointData } from "types/endpoint";
import { onDragStart } from "utils/component-util";
import apiIconTag from "../../assets/images/api-icon-tag.svg";
import styles from "./ApiEndpoint.module.scss";

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

  const [isGettingRelatedServices, setIsGettingRelatedServices] = useState(false);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const canDeleteEndpoint = async (endpoint: EndpointData) => {
    if (endpoint.isCommon) {
      setIsGettingRelatedServices(true);

      const services = (await axios.get<RelatedService[]>(getServicesByEndpointId(endpoint.id, id))).data;
      if (services.length > 0) {
        setRelatedServices(services);
      } else {
        setShowDeletePopup(true);
      }

      setIsGettingRelatedServices(false);
    } else {
      setShowDeletePopup(true);
    }
  };

  const deleteEndpoint = async (endpoint: EndpointData) => {
    // todo delete also from canvas
    console.log("deleting", endpoint, id);
  };

  return (
    <>
      {/* todo implement */}
      {showDeletePopup && (
        <Popup title={t("serviceFlow.deleteConfirmation")} onClose={() => setShowDeletePopup(false)}>
          <p>{t("serviceFlow.deleteConfirmationMessage")}</p>
          <Button appearance="error" onClick={() => deleteEndpoint(step.data!)}>
            {t("serviceFlow.delete")}
          </Button>
          <Button appearance="primary" onClick={() => setShowDeletePopup(false)}>
            {t("global.cancel")}
          </Button>
        </Popup>
      )}

      {relatedServices.length > 0 && (
        <Popup title={t("serviceFlow.deletionImpossible")} onClose={() => setRelatedServices([])}>
          <p>{t("serviceFlow.deletionImpossibleMessage")}</p>
          <ol className={styles.popupListPadding}>
            {relatedServices.map((service) => (
              <li key={service.serviceId}>
                <Link to={`/flow/${service.serviceId}`}>{service.name}</Link>
              </li>
            ))}
          </ol>
        </Popup>
      )}

      <Box
        className={styles.box}
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
        onDragStart={(event) => onDragStart(event, step)}
        draggable
      >
        <Track gap={8} style={{ justifyContent: "space-between", overflow: "hidden" }}>
          <div className={styles.labelContainer}>
            {step.type === "user-defined" && <img alt="" src={apiIconTag} />}
            <span className={styles.label}>{step.label}</span>
          </div>

          {isGettingRelatedServices ? (
            <div className={clsx("loader", styles.loader)} />
          ) : (
            <Button className={styles.deleteButton} appearance="text" onClick={() => canDeleteEndpoint(step.data!)}>
              <Icon icon={<MdDeleteOutline />} size="medium" />
              {t("serviceFlow.delete")}
            </Button>
          )}
        </Track>
      </Box>
    </>
  );
};

export default ApiEndpoint;
