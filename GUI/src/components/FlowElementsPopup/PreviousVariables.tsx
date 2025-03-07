import { CSSProperties, FC, useEffect, useState } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import { EndpointResponseVariable } from "types/endpoint/endpoint-response-variables";
import OutputElementBox from "components/OutputElementBox";
import { StepType } from "types";
import { Assign } from "./AssignBuilder/assign-types";
import { useTranslation } from "react-i18next";
import { ObjectTree } from "./ObjectTree";
import { stringToTemplate, templateToString } from "utils/string-util";
import { isObject } from "utils/object-util";

type PreviousVariablesProps = {
  readonly nodeId: string;
};

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const [endpoints, setEndpoints] = useState<EndpointResponseVariable[]>([]);
  const [assignedVariables, setAssignedVariables] = useState<Assign[]>([]);
  const [endpointsObjectTree, setEndpointsObjectTree] = useState<{ data: unknown; path: string | number } | null>(null);
  const [assignedObjectTree, setAssignedObjectTree] = useState<{ data: unknown; path: string | number } | null>(null);

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
      value: stringToTemplate("incoming.body.input"),
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
            {/* todo maybe can be common comp with the other one */}
            {/* todo merge assign and chip types? FlowVariable */}
            {assignedVariables.map((variable) =>
              isObject(variable.data) ? (
                <OutputElementBox
                  text={assignedObjectTree?.path === variable.value ? variable.key + " ▲" : variable.key + " ▼"}
                  draggable={false}
                  value={variable.value}
                  useValue
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setAssignedObjectTree(
                      assignedObjectTree?.path === variable.value ? null : { data: variable.data, path: variable.value }
                    );
                  }}
                />
              ) : (
                <OutputElementBox text={variable.key} value={variable.value} useValue />
              )
            )}
          </Track>
        </Track>
      )}

      {/* todo style bugs when expanded */}
      {isObject(assignedObjectTree?.data) && (
        <ObjectTree data={assignedObjectTree.data} path={templateToString(assignedObjectTree.path)} />
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
              isObject(chip.data) ? (
                <OutputElementBox
                  text={endpointsObjectTree?.path === chip.value ? chip.name + " ▲" : chip.name + " ▼"}
                  draggable={false}
                  value={chip.value}
                  useValue
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setEndpointsObjectTree(
                      endpointsObjectTree?.path === chip.value ? null : { data: chip.data, path: chip.value }
                    );
                  }}
                />
              ) : (
                <OutputElementBox text={chip.name} value={stringToTemplate(chip.value)} useValue />
              )
            )}
          </Track>
        </Track>
      ))}

      {isObject(endpointsObjectTree?.data) && (
        <ObjectTree data={endpointsObjectTree.data} path={endpointsObjectTree.path} />
      )}
    </Track>
  );
};

export default PreviousVariables;
