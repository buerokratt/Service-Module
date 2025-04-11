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
import { saveFlowClick } from "services/service-builder";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";
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

  const nodes = useServiceStore((state) => state.nodes);

  const { deleteEndpoint } = useServiceStore();

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

  const deleteSelectedEndpoint = async (endpoint: EndpointData) => {
    try {
      deleteEndpoint(endpoint.id);

      const nodeIdsToDelete = nodes
        .filter((node) => node.type === "customNode" && node.data.originalDefinedNodeId === endpoint.id)
        .map((node) => node.id);
      nodeIdsToDelete.forEach((nodeId) => useServiceStore.getState().onDelete(nodeId));

      saveFlowClick({ supressToast: true });
      // todo toast text
      useToastStore.getState().success({ title: "TODO PLACEHOLDER" });
    } catch (_) {
      // todo error text
      useToastStore.getState().error({ title: "TODO PLACEHOLDER" });
    }

    setShowDeletePopup(false);
  };

  return (
    <>
      {showDeletePopup && (
        <Popup title={t("serviceFlow.apiElements.deleteConfirmation")} onClose={() => setShowDeletePopup(false)}>
          <p className={styles.popupText}>{t("serviceFlow.apiElements.deleteConfirmationMessage")}</p>
          <Button appearance="error" onClick={() => deleteSelectedEndpoint(step.data!)}>
            {t("serviceFlow.apiElements.delete")}
          </Button>
          <Button appearance="primary" style={{ marginLeft: 10 }} onClick={() => setShowDeletePopup(false)}>
            {t("global.cancel")}
          </Button>
        </Popup>
      )}

      {relatedServices.length > 0 && (
        <Popup title={t("serviceFlow.apiElements.deletionImpossible")} onClose={() => setRelatedServices([])}>
          <p>{t("serviceFlow.apiElements.deletionImpossibleMessage")}</p>
          <ol className={styles.popupList}>
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
              {t("serviceFlow.apiElements.delete")}
            </Button>
          )}
        </Track>
      </Box>
    </>
  );
};

export default ApiEndpoint;
