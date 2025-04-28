import React, { CSSProperties, FC, useEffect, useState } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import { EndpointResponseVariable } from "types/endpoint/endpoint-response-variables";
import OutputElementBox from "components/OutputElementBox";
import { StepType } from "types";
import { Assign } from "../../types/assign";
import { useTranslation } from "react-i18next";
import { ObjectTree } from "./ObjectTree";
import { stringToTemplate, templateToString } from "utils/string-util";
import { getTypeColor, isObject } from "utils/object-util";
import Tooltip from "../Tooltip";

type PreviousVariablesProps = {
  readonly nodeId: string;
};

// Unique key for input element, used below to identify it
// All other assign element keys are UUIDs
const INPUT_ELEMENT_KEY = "-1";

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const [endpoints, setEndpoints] = useState<EndpointResponseVariable[]>([]);
  const [assignedVariables, setAssignedVariables] = useState<Assign[]>([]);
  const [endpointsObjectTree, setEndpointsObjectTree] = useState<{
    data: unknown;
    path: string | number;
  } | null>(null);
  const [assignedObjectTree, setAssignedObjectTree] = useState<{ data: unknown; path: string | number } | null>(null);
  // New elements added in Assign node before saving
  const newAssignElements = useServiceStore((state) => state.assignElements);

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
    // todo input w/o slot -- arrange call with guys -- check input flow in chat module first
    // todo implement slicing for other arrays too MAYBE
    const inputElement: Assign = {
      id: INPUT_ELEMENT_KEY,
      key: "input",
      value: stringToTemplate("incoming.body.input"),
      // Can only be a string array, see trigger-service.yaml in Buerokratt-Chatbot
      // Value is not known at this point, so passing a dummy to correctly infer type
      data: [],
    };

    setAssignedVariables([...assignElements, inputElement, ...newAssignElements]);
  }, [endpointsVariables, newAssignElements]);

  const popupBodyCss: CSSProperties = {
    padding: 16,
    backgroundColor: "#F9F9F9",
    width: "100%",
  };

  const border = "1px solid #D2D3D8";

  return (
    <Track direction="vertical" align="stretch">
      {assignedVariables.length > 0 && (
        <Track
          direction="vertical"
          align="left"
          style={{
            ...popupBodyCss,
            borderBottom: assignedObjectTree ? undefined : border,
          }}
        >
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
            {assignedVariables.map((variable) => {
              const typeColor = getTypeColor(variable.data);

              return isObject(variable.data) && variable.id !== INPUT_ELEMENT_KEY ? (
                <Tooltip content={`${variable.value} : ${typeColor.type}`}>
                  <OutputElementBox
                    className="tooltip"
                    dragData={variable}
                    style={{ cursor: "pointer" }}
                    borderColor={typeColor.color}
                    onClick={() => {
                      setAssignedObjectTree(
                        assignedObjectTree?.path === variable.value
                          ? null
                          : {
                              data: variable.data,
                              path: variable.value,
                            }
                      );
                    }}
                  >
                    {assignedObjectTree?.path === variable.value ? variable.key + " ▲" : variable.key + " ▼"}
                  </OutputElementBox>
                </Tooltip>
              ) : (
                <Tooltip content={`${variable.value} : ${typeColor.type}`}>
                  <OutputElementBox
                    dragData={variable.key ? variable : undefined}
                    style={{ cursor: variable.key ? "grab" : "default" }}
                    value={variable.value}
                    useValue
                    borderColor={typeColor.color}
                  >
                    {variable.key.length > 0 ? variable.key : t("serviceFlow.previousVariables.noName")}
                  </OutputElementBox>
                </Tooltip>
              );
            })}
          </Track>
        </Track>
      )}

      {isObject(assignedObjectTree?.data) && (
        <ObjectTree
          data={assignedObjectTree.data}
          path={templateToString(assignedObjectTree.path)}
          style={{ borderBottom: border, borderTop: border }}
        />
      )}

      {endpoints.map((endpoint) => (
        <Track key={endpoint.name} direction="vertical" align="left" style={{ ...popupBodyCss, borderBottom: border }}>
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
            {endpoint.chips.map((chip) => {
              const typeColor = getTypeColor(chip.data);
              const dragData: Assign = {
                id: "",
                key: chip.name,
                value: stringToTemplate(chip.value),
                data: chip.data,
              };

              return isObject(chip.data) ? (
                <Tooltip content={`${chip.data} : ${typeColor.type}`}>
                  <OutputElementBox
                    value={stringToTemplate(chip.value)}
                    dragData={dragData}
                    style={{ cursor: "pointer" }}
                    borderColor={typeColor.color}
                    onClick={() => {
                      setEndpointsObjectTree(
                        endpointsObjectTree?.path === chip.value
                          ? null
                          : {
                              data: chip.data,
                              path: chip.value,
                            }
                      );
                    }}
                  >
                    {endpointsObjectTree?.path === chip.value ? chip.name + " ▲" : chip.name + " ▼"}
                  </OutputElementBox>
                </Tooltip>
              ) : (
                <Tooltip content={`${chip.data} : ${typeColor.type}`}>
                  <OutputElementBox
                    borderColor={typeColor.color}
                    value={stringToTemplate(chip.value)}
                    dragData={dragData}
                    useValue
                  >
                    {chip.name}
                  </OutputElementBox>
                </Tooltip>
              );
            })}
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
