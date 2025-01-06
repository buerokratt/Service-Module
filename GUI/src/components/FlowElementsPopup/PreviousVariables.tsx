import { CSSProperties, FC, useEffect, useState } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import { endpointResponseVariables } from "types/endpoint/endpoint-response-variables";
import OutputElementBox from "components/OutputElementBox";

type PreviousVariablesProps = {
  readonly nodeId: string;
};

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const [endpoints, setEndpoints] = useState<endpointResponseVariables[]>([]);

  useEffect(() => {
    const previousNodes = nodes.slice(
      0,
      nodes.findIndex((node) => node.id === nodeId)
    );
    const endpointNodes = previousNodes.filter((node) => node.data.stepType === "user-defined");
    const names = endpointNodes.map((node) => node.data.label);
    endpointsVariables = endpointsVariables.filter((endpoint) => names.includes(endpoint.name));
    setEndpoints(endpointsVariables);
  }, [endpointsVariables]);

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  return (
    <Track direction="vertical" align="stretch">
      {endpoints.map((endpoint) => (
        <Track key={endpoint.name} direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}>
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
