import { CSSProperties, FC, useEffect, useState } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import { endpointResponseVariables } from "types/endpoint/endpoint-response-variables";
import OutputElementBox from "components/OutputElementBox";
import { StepType } from "types";
import { Assign } from "./AssignBuilder/assign-types";
import { useTranslation } from "react-i18next";

type PreviousVariablesProps = {
  readonly nodeId: string;
};

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const [endpoints, setEndpoints] = useState<endpointResponseVariables[]>([]);
  const [assignedVariables, setAssignedVariables] = useState<Assign[]>([]);

  useEffect(() => {
    const previousNodes = nodes.slice(
      0,
      nodes.findIndex((node) => node.id === nodeId)
    );

    // Get Endpoints variables
    const endpointNodes = previousNodes.filter((node) => node.data.stepType === StepType.UserDefined);
    const names = endpointNodes.map((node) => node.data.label);
    endpointsVariables = endpointsVariables.filter((endpoint) => names.includes(endpoint.name));
    setEndpoints(endpointsVariables);

    // Get Assign variables
    const assignNodes = previousNodes.filter((node) => node.data.stepType === StepType.Assign);
    const assignElements = assignNodes.map((node) => node.data.assignElements).flat();
    setAssignedVariables(assignElements);
  }, [endpointsVariables]);

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  return (
    <Track direction="vertical" align="stretch">
      {assignedVariables.length > 0 && (
        <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}>
          <label
            htmlFor="json"
            style={{ marginBottom: "10px", textTransform: "capitalize", cursor: "auto" }}
          >{t('serviceFlow.previousVariables.assignElements')}</label>
          <Track
            direction="horizontal"
            gap={4}
            justify="start"
            isMultiline
            style={{ maxHeight: "30vh", overflow: "auto" }}
          >
            {assignedVariables.map((assign) => (
              <OutputElementBox
                key={assign.id}
                text={assign.key}
                draggable={true}
                value={`\${${assign.key}}`}
                useValue
              ></OutputElementBox>
            ))}
          </Track>
        </Track>
      )}
      {endpoints.map((endpoint) => (
        <Track
          key={endpoint.name}
          direction="vertical"
          align="left"
          style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}
        >
          <label
            htmlFor="json"
            style={{ marginBottom: "10px", textTransform: "capitalize", cursor: "auto" }}
          >{`${endpoint.name}`}</label>
          <Track
            direction="horizontal"
            gap={4}
            justify="start"
            isMultiline
            style={{ maxHeight: "30vh", overflow: "auto" }}
          >
            {endpoint.chips.map((chip) => (
              <OutputElementBox
                key={chip.value}
                text={chip.name}
                draggable={true}
                value={chip.value}
                useValue
              ></OutputElementBox>
            ))}
          </Track>
        </Track>
      ))}
    </Track>
  );
};

export default PreviousVariables;
