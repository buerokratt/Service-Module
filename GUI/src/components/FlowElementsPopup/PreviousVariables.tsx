import { Edge, Node } from '@xyflow/react';
import OutputElementBox from 'components/OutputElementBox';
import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { environmentVariables, helperVariables } from 'resources/variables-constants';
import { StepType } from 'types';
import { EndpointResponseVariable } from 'types/endpoint/endpoint-response-variables';
import { NodeDataProps } from 'types/service-flow';
import { getHelperTooltips } from 'utils/constants';
import { getTypeColor, isObject } from 'utils/object-util';
import { stringToTemplate, templateToString } from 'utils/string-util';
import { v4 } from 'uuid';

import DateTimeBuilder from './DateTimeBuilder';
import { ObjectTree } from './ObjectTree';
import useServiceStore from '../../store/new-services.store';
import { Assign } from '../../types/assign';
import Tooltip from '../Tooltip';
import Track from '../Track';

type PreviousVariablesProps = {
  readonly nodeId: string;
};

// Unique key for predefined elements, used below to identify it
// All other assign element keys are UUIDs
const predefinedInputKeys = ['-1', '-2'];

const PreviousVariables: FC<PreviousVariablesProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  let endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const nodes = useServiceStore((state) => state.nodes);
  const edges = useServiceStore((state) => state.edges);
  const [endpoints, setEndpoints] = useState<EndpointResponseVariable[]>([]);
  const [assignedVariables, setAssignedVariables] = useState<Assign[]>([]);
  const [endpointsObjectTree, setEndpointsObjectTree] = useState<{
    data: unknown;
    path: string | number;
  } | null>(null);
  const [assignedObjectTree, setAssignedObjectTree] = useState<{ data: unknown; path: string | number } | null>(null);
  // New elements added in Assign node before saving
  const newAssignElements = useServiceStore((state) => state.assignElements);
  const helperVariablesWithTooltips = helperVariables.map((variable, index) => {
    return {
      ...variable,
      tooltip: getHelperTooltips()[index],
    };
  });

  useEffect(() => {
    const currentNodeIndex = nodes.findIndex((node) => node.id === nodeId);
    const currentNode = nodes[currentNodeIndex];

    let startIndex = nodes.findLastIndex(
      (node, i) => i < currentNodeIndex && node.data.stepType === StepType.MultiChoiceQuestion,
    );

    let previousNodes = nodes.slice(startIndex === -1 ? 0 : startIndex, currentNodeIndex);

    if (startIndex != -1) {
      previousNodes = getCurrentBranchNodesUp(nodes, edges, currentNode);
    }

    // Get Endpoints variables
    const endpointNodes = previousNodes.filter((node) => node.data.stepType === StepType.UserDefined);
    const names = endpointNodes.map((node) => node.data.label?.toString().split(' ')[0]);
    endpointsVariables = endpointsVariables.filter((endpoint) => names.includes(endpoint.name));
    setEndpoints(endpointsVariables);

    // Get Assign variables
    const assignNodes: Node<NodeDataProps>[] =
      (previousNodes.filter((node) => node.data.stepType === StepType.Assign) as Node<NodeDataProps>[]) ?? [];
    const assignElements = assignNodes.map((node) => node.data.assignElements).flat();
    const predefinedInputElements: Assign[] = [
      {
        id: predefinedInputKeys[0],
        key: 'input',
        value: stringToTemplate('incoming.body.input'),
        // Can only be a string array, see trigger-service.yaml in Buerokratt-Chatbot
        // Value is not known at this point, so passing a dummy to correctly infer type
        data: [],
      },
      {
        id: predefinedInputKeys[1],
        key: 'Empty Content Type',
        value: stringToTemplate(''),
        // Can only be a string array, see trigger-service.yaml in Buerokratt-Chatbot
        // Value is not known at this point, so passing a dummy to correctly infer type
        data: [],
      },
    ];

    setAssignedVariables([...assignElements, ...predefinedInputElements, ...newAssignElements]);
  }, [endpointsVariables, newAssignElements]);

  function getCurrentBranchNodesUp(nodes: Node[], edges: Edge[], currentNode: Node) {
    const branchNodes: Node[] = [];
    let parentNode: Node | undefined = getParentNode(nodes, edges, currentNode);

    while (parentNode) {
      if (parentNode.data?.stepType === StepType.MultiChoiceQuestion) {
        break;
      }
      branchNodes.unshift(parentNode);
      parentNode = getParentNode(nodes, edges, parentNode);
    }

    return branchNodes;
  }

  function getParentNode(nodes: Node[], edges: Edge[], node: Node): Node | undefined {
    const parentEdge = edges.findLast((edge) => edge.target === node.id);
    return parentEdge ? nodes.findLast((n) => n.id === parentEdge.source) : undefined;
  }

  const popupBodyCss: CSSProperties = {
    padding: 16,
    backgroundColor: '#F9F9F9',
    width: '100%',
  };

  const border = '1px solid #D2D3D8';

  return (
    <Track direction="vertical" align="stretch">
      {assignedVariables.length > 0 && (
        <VariableSection
          title={t('serviceFlow.previousVariables.assignElements')}
          variables={[...assignedVariables]}
          assignedObjectTree={assignedObjectTree}
          setAssignedObjectTree={setAssignedObjectTree}
          popupBodyCss={popupBodyCss}
          border={border}
          isAssignSection={true}
        />
      )}
      <VariableSection
        title={t('serviceFlow.previousVariables.environmentVariables.title')}
        variables={[...environmentVariables]}
        assignedObjectTree={assignedObjectTree}
        setAssignedObjectTree={setAssignedObjectTree}
        popupBodyCss={popupBodyCss}
        border={border}
      />
      <DateTimeBuilder border={border} popupBodyCss={popupBodyCss} />
      <VariableSection
        title={t('serviceFlow.previousVariables.helpers.title')}
        variables={[...helperVariablesWithTooltips]}
        assignedObjectTree={assignedObjectTree}
        setAssignedObjectTree={setAssignedObjectTree}
        popupBodyCss={popupBodyCss}
        border={border}
      />
      {isObject(assignedObjectTree?.data) && (
        <ObjectTree
          data={assignedObjectTree.data}
          path={templateToString(assignedObjectTree.path)}
          style={{ borderBottom: border, borderTop: border }}
        />
      )}
      {endpoints.map((endpoint) => (
        <Track key={v4()} direction="vertical" align="left" style={{ ...popupBodyCss, borderBottom: border }}>
          <label
            htmlFor="json"
            style={{ marginBottom: '10px', textTransform: 'capitalize', cursor: 'auto' }}
          >{`${endpoint.name}`}</label>
          <Track
            direction="horizontal"
            gap={4}
            justify="start"
            isMultiline
            style={{ maxHeight: '30vh', overflow: 'auto' }}
          >
            {endpoint.chips.map((chip) => {
              const typeColor = getTypeColor(chip.data);
              const dragData: Assign = {
                id: v4(),
                key: chip.name,
                value: stringToTemplate(chip.value),
                data: chip.data,
              };

              return isObject(chip.data) ? (
                <Tooltip content={`${JSON.stringify(chip.data)} : ${typeColor.type}`} key={dragData.id}>
                  <OutputElementBox
                    dragData={dragData}
                    style={{ cursor: 'pointer' }}
                    borderColor={typeColor.color}
                    onClick={() => {
                      setEndpointsObjectTree(
                        endpointsObjectTree?.path === chip.value
                          ? null
                          : {
                              data: chip.data,
                              path: chip.value,
                            },
                      );
                    }}
                  >
                    {endpointsObjectTree?.path === chip.value ? chip.name + ' ▲' : chip.name + ' ▼'}
                  </OutputElementBox>
                </Tooltip>
              ) : (
                <Tooltip content={`${chip.data} : ${typeColor.type}`} key={dragData.id}>
                  <OutputElementBox borderColor={typeColor.color} dragData={dragData}>
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

const VariableSection = ({
  title,
  variables,
  assignedObjectTree,
  setAssignedObjectTree,
  popupBodyCss,
  border,
  isAssignSection = false,
}: any) => {
  const { t } = useTranslation();

  return (
    <Track
      direction="vertical"
      align="left"
      style={{
        ...popupBodyCss,
        borderBottom: assignedObjectTree ? undefined : border,
      }}
    >
      <label htmlFor="json" style={{ marginBottom: '10px', textTransform: 'capitalize', cursor: 'auto' }}>
        {title}
      </label>
      <Track direction="horizontal" gap={4} justify="start" isMultiline style={{ maxHeight: '30vh', overflow: 'auto' }}>
        {variables.map((variable: any) => {
          const typeColor = getTypeColor(variable?.value);

          const rawName =
            title === t('serviceFlow.previousVariables.environmentVariables.title') ||
            title === t('serviceFlow.previousVariables.assignElements')
              ? variable.key
              : t(variable.key);
          const name = rawName.length > 0 ? rawName : t('serviceFlow.previousVariables.noName');

          return isObject(variable.data) && !predefinedInputKeys.includes(variable.id) ? (
            <Tooltip
              content={
                variable.tooltip ? `${variable.value}\n\n${variable.tooltip}` : `${variable.value} : ${typeColor.type}`
              }
              key={variable.id}
            >
              <OutputElementBox
                className="tooltip"
                dragData={variable}
                style={{ cursor: 'pointer' }}
                borderColor={typeColor.color}
                onClick={() => {
                  setAssignedObjectTree(
                    assignedObjectTree?.path === variable.value
                      ? null
                      : {
                          data: variable.data,
                          path: variable.value,
                        },
                  );
                }}
              >
                {assignedObjectTree?.path === variable.value ? t(variable.key) + ' ▲' : t(variable.key) + ' ▼'}
              </OutputElementBox>
            </Tooltip>
          ) : (
            <Tooltip
              content={
                variable.tooltip ? `${variable.value}\n\n${variable.tooltip}` : `${variable.value} : ${typeColor.type}`
              }
              key={variable.id}
            >
              <OutputElementBox
                dragData={variable.key ? variable : undefined}
                style={{ cursor: variable.key ? 'grab' : 'default' }}
                borderColor={typeColor.color}
                isAssignElement={isAssignSection ? !predefinedInputKeys.includes(variable.id) : false}
              >
                {name}
              </OutputElementBox>
            </Tooltip>
          );
        })}
      </Track>
    </Track>
  );
};

export default PreviousVariables;
