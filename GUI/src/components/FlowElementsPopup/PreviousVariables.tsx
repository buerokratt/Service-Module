import { CSSProperties, FC, useEffect, useState } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import { EndpointResponseVariable } from "types/endpoint/endpoint-response-variables";
import OutputElementBox from "components/OutputElementBox";
import { StepType } from "types";
import { Assign } from "./AssignBuilder/assign-types";
import { useTranslation } from "react-i18next";
import { ObjectTree } from "./ObjectTree";

type PreviousVariablesProps = {
  readonly nodeId: string;
};

const isObject = (x: unknown) => {
  return typeof x === "object" && x !== null;
};

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const [endpoints, setEndpoints] = useState<EndpointResponseVariable[]>([]);
  const [assignedVariables, setAssignedVariables] = useState<Assign[]>([]);
  const [objectTreeData, setObjectTreeData] = useState<unknown>(null);
  const [objectTreePath, setObjectTreePath] = useState<string | number>("");
  // const

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
    const inputElement: Assign = {
      id: "-1",
      key: "input",
      value: "${incoming.body.input}",
    };
    setAssignedVariables([...assignElements, inputElement]);
  }, [endpointsVariables]);

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  return (
    <Track direction="vertical" align="stretch">
      {assignedVariables.length > 0 && (
        <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}>
          <label htmlFor="json" style={{ marginBottom: "10px", textTransform: "capitalize", cursor: "auto" }}>
            {t("serviceFlow.previousVariables.assignElements")}
          </label>
          <Track
            direction="horizontal"
            gap={4}
            justify="start"
            isMultiline
            style={{ maxHeight: "30vh", overflow: "auto" }}
          >
            {/* todo not ready for assigned variables */}
            {/* todo maybe can be common element with the other one */}
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
            {endpoint.chips.map((chip) =>
              isObject(chip.content) ? (
                <OutputElementBox
                  text={chip.name}
                  draggable={false}
                  value={chip.value}
                  useValue
                  // todo logic to close
                  // todo close open indicator
                  // todo cursor if object not null
                  onClick={() => {
                    setObjectTreeData(chip.content);
                    setObjectTreePath(chip.value);
                  }}
                />
              ) : (
                <OutputElementBox text={chip.name} value={"${" + chip.value + "}"} useValue />
              )
            )}
          </Track>
        </Track>
      ))}
      {objectTreeData ? <ObjectTree data={objectTreeData} path={objectTreePath} /> : <></>}
    </Track>
  );
};

export default PreviousVariables;
