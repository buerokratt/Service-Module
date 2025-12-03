import * as Tabs from '@radix-ui/react-tabs';
import { Edge, getConnectedEdges, getIncomers, getOutgoers, Node } from '@xyflow/react';
import React, { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import useServiceListStore from 'store/services.store';
import useToastStore from 'store/toasts.store';
import { DynamicChoices } from 'types/dynamic-choices';
import { EndpointData } from 'types/endpoint';
import { MultiChoiceQuestionButton } from 'types/multi-choice-question';
import { NodeDataProps } from 'types/service-flow';
import { getValueByPath } from 'utils/object-util';
import { isTemplate, removeTrailingUnderscores, stringToTemplate, templateToString } from 'utils/string-util';

import { Button, Track } from '..';
import Popup from '../Popup';
import ApiContent from './ApiContent';
import AssignContent from './AssignContent';
import ConditionBuilderContent from './ConditionBuilderContent';
import ConditionContent from './ConditionContent';
import DefaultMessageContent from './DefaultMessageContent';
import DynamicChoicesContent from './DynamicChoicesContent';
import EndConversationContent from './EndConversationContent';
import FileGenerateContent from './FileGenerateContent';
import FileSignContent from './FileSignContent';
import JsonRequestContent from './JsonRequestContent';
import MultiChoiceQuestionContent from './MultiChoiceQuestionContent';
import OpenWebPageContent from './OpenWebPageContent';
import OpenWebPageTestContent from './OpenWebPageTestContent';
import RasaRulesContent from './RasaRulesContent';
import TextfieldContent from './TextfieldContent';
import TextfieldTestContent from './TextfieldTestContent';
import { servicesRequestsExplain } from '../../resources/api-constants';
import api from '../../services/api-dev';
import { StepType } from '../../types';
import { getInitialGroup } from './RuleBuilder/types';
import './styles.scss';

const FlowElementsPopup: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState(true);
  const { isJsonRequestVisible, jsonRequestContent, setJsonRequestVisible, setJsonRequestContent } = useServiceStore();
  const node = useServiceStore((state) => state.selectedNode);
  const selectedService = useServiceListStore((state) => state.selectedService);
  const instance = useServiceStore.getState().reactFlowInstance;

  const isUserDefinedNode = node?.data?.stepType === StepType.UserDefined;

  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const rules = useServiceStore((state) => state.rules);
  const assignElements = useServiceStore((state) => state.assignElements);
  const endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);
  const stepType = node?.data.stepType;

  const defaultMultiChoiceQuestionButtons = useMemo(
    () => [
      {
        id: '1',
        title: 'Jah',
        payload: `#service, /${selectedService?.type ?? 'POST'}/services/active/${serviceName}_mcq_${
          node?.data.label[node?.data.label.length - 1]
        }_0`,
      },
      {
        id: '2',
        title: 'Ei',
        payload: `#service, /${selectedService?.type ?? 'POST'}/services/active/${serviceName}_mcq_${
          node?.data.label[node?.data.label.length - 1]
        }_1`,
      },
    ],
    [selectedService?.type, serviceName, node?.data.label],
  );

  const defaultDynamicChoices: DynamicChoices = useMemo(
    () => ({
      list: '',
      serviceName: '',
      key: '',
      payloadKeys: '',
    }),
    [],
  );

  useEffect(() => {
    if (node) {
      const rulesCheck = node.data.rules
        ? { ...node.data.rules, children: rules }
        : { ...getInitialGroup(), children: rules };
      node.data.rules =
        node.data.stepType === StepType.Condition || node.data.stepType === StepType.Input ? rulesCheck : undefined;
    }
  }, [node, rules]);

  // StepType.Textfield
  const [textfieldMessage, setTextfieldMessage] = useState<string | null>(null);
  const [textfieldMessagePlaceholders, setTextfieldMessagePlaceholders] = useState<{ [key: string]: string }>({});
  // StepType.OpenWebpage
  const [webpageName, setWebpageName] = useState<string | null>(null);
  const [webpageUrl, setWebpageUrl] = useState<string | null>(null);
  // StepType.FileGenerate
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  // StepType.FileSign
  const [signOption, setSignOption] = useState<{ label: string; value: string } | null>(node?.data.signOption ?? null);
  // StepType.MultiChoiceQuestion
  const [multiChoiceQuestionQuestion, setMultiChoiceQuestionQuestion] = useState<string>(
    node?.data.multiChoiceQuestion?.question ?? '',
  );
  const [multiChoiceQuestionButtons, setMultiChoiceQuestionButtons] = useState<MultiChoiceQuestionButton[]>(
    node?.data.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons,
  );
  const [dynamicChoices, setDynamicChoices] = useState<DynamicChoices>(
    node?.data.dynamicChoices ?? defaultDynamicChoices,
  );

  const [nodeEndpoint, setNodeEndpoint] = useState<EndpointData | undefined>(node?.data.endpoint);
  const [title, setTitle] = useState(node?.data.label ?? '');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!node) return;

    setTitle(node.data.label ?? '');

    switch (stepType) {
      case StepType.Input:
      case StepType.Condition:
        if (node.data?.rules) {
          useServiceStore.getState().changeRulesNode(node.data.rules.children);
        }
        break;

      case StepType.Assign:
        if (node.data?.assignElements) {
          useServiceStore.getState().changeAssignNode(node.data.assignElements);
        } else {
          useServiceStore.getState().changeAssignNode([]);
        }
        break;

      case StepType.MultiChoiceQuestion:
        setMultiChoiceQuestionQuestion(node.data?.multiChoiceQuestion?.question ?? '');
        setMultiChoiceQuestionButtons(node.data?.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons);
        break;

      case StepType.DynamicChoices:
        setDynamicChoices(node.data?.dynamicChoices ?? defaultDynamicChoices);
        break;

      default:
        break;
    }
  }, [defaultDynamicChoices, defaultMultiChoiceQuestionButtons, node, stepType]);

  if (!node) return <></>;

  const isReadonly = node.data.readonly;

  const onClose = () => {
    setSelectedTab(null);
    setJsonRequestVisible(false);
    setJsonRequestContent(null);
    setTextfieldMessage(null);
    setWebpageName(null);
    setWebpageUrl(null);
    setFileName(null);
    setFileContent(null);
    setTextfieldMessagePlaceholders({});
    setMultiChoiceQuestionQuestion('');
    setMultiChoiceQuestionButtons(defaultMultiChoiceQuestionButtons);
    setIsSaveEnabled(true);
    setDynamicChoices(defaultDynamicChoices);
    useServiceStore.getState().resetSelectedNode();
    useServiceStore.getState().resetRules();
    useServiceStore.getState().resetAssign();
  };

  const handleSaveClick = () => {
    const updatedNode: Node<NodeDataProps> = {
      ...node,
      data: {
        ...node.data,
        label: title,
        message: textfieldMessage ?? node.data?.message,
        link: webpageUrl ?? node.data?.link,
        linkText: webpageName ?? node.data?.linkText,
        fileName: fileName ?? node.data?.fileName,
        fileContent: fileContent ?? node.data?.fileContent,
        signOption: signOption ?? node.data?.signOption,
        multiChoiceQuestion:
          node.data.stepType === StepType.MultiChoiceQuestion
            ? {
                question: multiChoiceQuestionQuestion,
                buttons: multiChoiceQuestionButtons,
              }
            : undefined,
        dynamicChoices: node.data.stepType === StepType.DynamicChoices ? dynamicChoices : undefined,
        endpoint: nodeEndpoint ?? node.data?.endpoint,
        testingPassed: undefined,
      },
    };

    if (stepType === StepType.Input || stepType === StepType.Condition) {
      updatedNode.data.rules = updatedNode.data.rules
        ? { ...updatedNode.data.rules, children: rules }
        : { ...getInitialGroup(), children: rules };
    }

    if (stepType === StepType.MultiChoiceQuestion) {
      saveMultiChoicePopup(node, updatedNode);
    }

    if (stepType === StepType.UserDefined) {
      const newLabel = updatedNode.data.label?.toString().split(' ');
      if (updatedNode.data.endpoint?.name) {
        newLabel[0] = updatedNode.data.endpoint?.name ?? node.data.label?.toString().split(' ')[0];
        const nodeWithSameLabel = instance
          ?.getNodes()
          .find((n) => n.data.label === newLabel.join(' ') && n.id !== updatedNode.id);
        if (nodeWithSameLabel) {
          useToastStore.getState().error({
            title: t('newService.toast.elementNameAlreadyExists'),
            message: t('newService.toast.elementNameAlreadyExistsMessage'),
          });
          return;
        }
        updatedNode.data.label = newLabel.join(' ');
      }
      useServiceStore.getState().loadEndpointsResponseVariables();
    }

    if (stepType === StepType.Assign) {
      const flatEndpointVariables = endpointsVariables.map((endpoint) => endpoint.chips).flat();
      assignElements.forEach((element) => {
        // Convert simple values such as "some input" to simple string
        if (!isTemplate(element.value)) {
          element.value = stringToTemplate('"' + element.value + '"');
          return;
        }

        const fullPath = templateToString(element.value);
        const endpointVariable = flatEndpointVariables.find((variable) => fullPath.startsWith(String(variable.value)));

        if (!endpointVariable) {
          // Element is not an object so no data for ObjectTree
          return;
        }

        const value = String(endpointVariable.value);
        const remainingPath = fullPath.substring(
          fullPath[value.length] === '['
            ? // Uses array notation, e.g. endpointVariable[1].something; needed for backwards compatibility
              value.length
            : // Uses object notation, e.g. endpointVariable.1.something
              value.length + 1,
        );
        element.data = remainingPath ? getValueByPath(endpointVariable.data, remainingPath) : endpointVariable.data;
      });
      updatedNode.data.assignElements = assignElements;
    }

    useServiceStore.getState().handlePopupSave(updatedNode);
    onClose();
  };

  const handleJsonRequestClick = async () => {
    if (isJsonRequestVisible) {
      setJsonRequestVisible(false);
      return;
    }

    try {
      const endpoint = node.data.endpoint?.definitions[0];

      if (!endpoint) return;

      const response = await api.post(servicesRequestsExplain(), {
        requests: [
          {
            url: endpoint.url,
            method: endpoint.methodType,
            headers: extractMapValues(endpoint.headers),
            body: extractMapValues(endpoint.body),
            params: extractMapValues(endpoint.params),
          },
        ],
      });
      setJsonRequestContent(response.data.response);
      setJsonRequestVisible(true);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  function extractMapValues(element: any) {
    if (element?.rawData && element?.rawData?.length > 0) {
      return element.rawData.value;
    }

    let result: any = {};
    if (element?.variables) {
      for (const entry of element.variables) {
        result = { ...result, [entry.name]: entry.value };
      }
    }
    return result;
  }

  const getJsonRequestButtonTitle = () => {
    if (!isUserDefinedNode || selectedTab === t('serviceFlow.tabs.test')) return '';
    if (isJsonRequestVisible) return t('serviceFlow.popup.hideJsonRequest');
    return t('serviceFlow.popup.showJsonRequest');
  };

  const saveMultiChoicePopup = (originalNode: Node<NodeDataProps>, updatedNode: Node<NodeDataProps>) => {
    if (!instance) return;

    const currentButtons = originalNode.data.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons;
    const newButtons = updatedNode.data.multiChoiceQuestion?.buttons ?? [];

    const edges = instance.getEdges();
    const nodes = instance.getNodes();

    const connectedEdges = getConnectedEdges([originalNode], edges);

    const currentButtonMap = new Map(currentButtons.map((btn) => [btn.id, btn]));
    const newButtonMap = new Map(newButtons.map((btn) => [btn.id, btn]));

    const addedButtons = newButtons.filter((btn) => !currentButtonMap.has(btn.id));
    const removedButtons = currentButtons.filter((btn) => !newButtonMap.has(btn.id));
    const renamedButtons = currentButtons
      .filter((btn) => newButtonMap.has(btn.id))
      .filter((btn) => newButtonMap.get(btn.id)!.title !== btn.title)
      .map((btn) => ({
        oldTitle: btn.title,
        newTitle: newButtonMap.get(btn.id)!.title,
        id: btn.id,
      }));

    const updatedEdges = edges.map((edge) => {
      if (!edge.label || !connectedEdges.some((ce) => ce.id === edge.id)) return edge;
      const rename = renamedButtons.find((r) => r.oldTitle === edge.label);
      if (rename) {
        return { ...edge, label: rename.newTitle };
      }
      return edge;
    });

    const edgesToRemove = connectedEdges.filter((edge) => {
      if (!edge.label || edge.source !== originalNode.id) return false;
      return removedButtons.some((btn) => btn.title === edge.label);
    });

    const filteredEdges = updatedEdges.filter((e) => !edgesToRemove.some((edgeToRemove) => edgeToRemove.id === e.id));

    const existingButtonTitles = new Set(
      filteredEdges
        .filter((edge) => edge.source === originalNode.id)
        .map((edge) => edge.label)
        .filter(Boolean),
    );

    const buttonsNeedingEdges = addedButtons.filter((btn) => !existingButtonTitles.has(btn.title));

    const newEdges = buttonsNeedingEdges.map((button) => {
      const newEdge: Edge = {
        id: `${originalNode.id}->${button.id}`,
        source: originalNode.id,
        target: `ghost-${button.id}`,
        type: 'step',
        animated: true,
        deletable: false,
        label: button.title,
      };
      return newEdge;
    });

    const newGhostNodes = newEdges.map((edge) => ({
      id: edge.target,
      type: 'ghost',
      position: {
        x: originalNode.position.x + 200,
        y: originalNode.position.y,
      },
      data: { type: 'ghost' },
      className: 'ghost',
      selectable: false,
      draggable: false,
    }));

    let finalNodes = [...nodes.filter((n) => n.id !== updatedNode.id), updatedNode, ...newGhostNodes];
    let finalEdges = [...filteredEdges, ...newEdges];

    finalNodes = finalNodes.filter(
      (node) =>
        node.type !== 'ghost' ||
        getIncomers(node, finalNodes, finalEdges).length > 0 ||
        getOutgoers(node, finalNodes, finalEdges).length > 0,
    );

    instance.setNodes(finalNodes);
    instance.setEdges(finalEdges);
  };

  return (
    <Popup
      style={{ maxWidth: 700 }}
      title={title}
      onClose={onClose}
      footer={
        <Track direction="horizontal" gap={16} justify="between" style={{ width: '100%' }}>
          <Button appearance="text" onClick={handleJsonRequestClick}>
            {getJsonRequestButtonTitle()}
          </Button>
          <Track gap={16}>
            {!isReadonly && (
              <Button appearance="secondary" onClick={onClose}>
                {t('global.cancel')}
              </Button>
            )}
            <Button disabled={!isSaveEnabled} onClick={handleSaveClick}>
              {t(isReadonly ? 'global.close' : 'global.save')}
            </Button>
          </Track>
        </Track>
      }
      titleEditable
      onTitleChange={(newTitle) => {
        const nodeWithSameLabel = instance?.getNodes().find((n) => n.data.label === newTitle && n.id !== node.id);
        setTitleError(nodeWithSameLabel ? t('newService.toast.elementNameAlreadyExists').toString() : undefined);
      }}
      onTitleSave={setTitle}
      onTitleEditCancel={() => {
        setTitleError(undefined);
        setTitle(node.data.label ?? '');
      }}
      titleError={titleError}
    >
      <Track direction="vertical" align="stretch" gap={16} className="flow-body-reverse-margin">
        <Tabs.Root
          className="vertical-tabs__column"
          orientation="horizontal"
          value={selectedTab ?? t('serviceFlow.tabs.setup')!}
          onValueChange={setSelectedTab}
        >
          <Tabs.List>
            <Tabs.Trigger className="vertical-tabs__trigger" value={t('serviceFlow.tabs.setup')}>
              {t('serviceFlow.tabs.setup')}
            </Tabs.Trigger>
            {!isReadonly && (
              <Tabs.Trigger className="vertical-tabs__trigger" value={t('serviceFlow.tabs.test')}>
                {t('serviceFlow.tabs.test')}
              </Tabs.Trigger>
            )}
          </Tabs.List>
          <Tabs.Content value={t('serviceFlow.tabs.setup')} className="vertical-tabs__body">
            {stepType === StepType.Textfield && (
              <TextfieldContent
                defaultMessage={node.data.message ?? textfieldMessage ?? undefined}
                node={node}
                onChange={(message, placeholders) => {
                  setTextfieldMessage(message);
                  setTextfieldMessagePlaceholders(placeholders);
                }}
              />
            )}
            {stepType === StepType.OpenWebpage && (
              <OpenWebPageContent
                onWebpageNameChange={setWebpageName}
                onWebpageUrlChange={setWebpageUrl}
                defaultWebpageUrl={node.data.link ?? webpageUrl ?? undefined}
                defaultWebpageName={node.data.linkText ?? webpageName ?? undefined}
              />
            )}
            {stepType === StepType.Input && (
              <DndProvider backend={HTML5Backend}>
                <ConditionBuilderContent />
              </DndProvider>
            )}
            {stepType === StepType.FileGenerate && (
              <DndProvider backend={HTML5Backend}>
                <FileGenerateContent
                  onFileNameChange={setFileName}
                  onFileContentChange={setFileContent}
                  defaultFileName={node?.data?.fileName ?? fileName ?? undefined}
                  defaultFileContent={node?.data?.fileContent ?? fileContent ?? undefined}
                />
              </DndProvider>
            )}
            {stepType === StepType.FinishingStepRedirect && (
              <DefaultMessageContent message={t('serviceFlow.popup.redirectToCustomerSupport')} />
            )}
            {stepType === StepType.Auth && <DefaultMessageContent message={t('serviceFlow.popup.loginWithTARA')} />}
            {stepType === StepType.FileSign && (
              <FileSignContent onOptionChange={setSignOption} signOption={signOption} />
            )}
            {stepType === StepType.FinishingStepEnd && <EndConversationContent />}
            {stepType === StepType.RasaRules && <RasaRulesContent />}
            {stepType === StepType.Assign && <AssignContent node={node} />}
            {stepType === StepType.Condition && <ConditionContent node={node} />}
            {stepType === StepType.DynamicChoices && (
              <DynamicChoicesContent
                node={node}
                dynamicChoices={dynamicChoices}
                onDynamicChoicesChange={setDynamicChoices}
              />
            )}
            {stepType === StepType.UserDefined && (
              <ApiContent
                node={node}
                endpoint={node.data.endpoint}
                onEndpointChange={(endpoint) => {
                  if (!endpoint) return;
                  setNodeEndpoint(endpoint);
                }}
              />
            )}
            {stepType === StepType.MultiChoiceQuestion && (
              <MultiChoiceQuestionContent
                question={multiChoiceQuestionQuestion}
                buttons={multiChoiceQuestionButtons}
                setQuestion={setMultiChoiceQuestionQuestion}
                setButtons={setMultiChoiceQuestionButtons}
                setIsSaveEnabled={setIsSaveEnabled}
              />
            )}
            <JsonRequestContent isVisible={isJsonRequestVisible} jsonContent={jsonRequestContent} />
          </Tabs.Content>
          {!isReadonly && (
            <Tabs.Content value={t('serviceFlow.tabs.test')} className="vertical-tabs__body">
              {stepType === StepType.Textfield && (
                <TextfieldTestContent
                  placeholders={textfieldMessagePlaceholders}
                  message={textfieldMessage ?? node.data.message}
                />
              )}
              {stepType === StepType.OpenWebpage && (
                <OpenWebPageTestContent websiteUrl={webpageUrl} websiteName={webpageName} />
              )}
            </Tabs.Content>
          )}
        </Tabs.Root>
      </Track>
    </Popup>
  );
};

export default FlowElementsPopup;
