import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Popup from "../Popup";
import { Button, Track } from "..";
import FileGenerateContent from "./FileGenerateContent";
import ConditionBuilderContent from "./ConditionBuilderContent";
import { useTranslation } from "react-i18next";
import TextfieldContent from "./TextfieldContent";
import * as Tabs from "@radix-ui/react-tabs";
import TextfieldTestContent from "./TextfieldTestContent";
import DefaultMessageContent from "./DefaultMessageContent";
import EndConversationContent from "./EndConversationContent";
import JsonRequestContent from "./JsonRequestContent";
import { servicesRequestsExplain } from "../../resources/api-constants";
import OpenWebPageContent from "./OpenWebPageContent";
import OpenWebPageTestContent from "./OpenWebPageTestContent";
import RasaRulesContent from "./RasaRulesContent";
import { StepType } from "../../types";
import useServiceStore from "store/new-services.store";
import FileSignContent from "./FileSignContent";
import "./styles.scss";
import ConditionContent from "./ConditionContent";
import AssignContent from "./AssignContent";
import { isTemplate, removeTrailingUnderscores, stringToTemplate, templateToString } from "utils/string-util";
import { getValueByPath } from "utils/object-util";
import ApiContent from "./ApiContent";
import { saveEndpoints } from "services/service-builder";
import useToastStore from "store/toasts.store";
import i18next from "i18next";
import MultiChoiceQuestionContent from "./MultiChoiceQuestionContent";
import { EDGE_LENGTH, NodeDataProps } from "types/service-flow";
import { Edge, getConnectedEdges, getIncomers, getOutgoers, Node } from "@xyflow/react";
import { MultiChoiceQuestionButton } from "types/multi-choice-question";
import { buildEdge, buildPlaceholder } from "services/flow-builder";
import useServiceListStore from "store/services.store";
import api from "../../services/api-dev";


const FlowElementsPopup: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [isJsonRequestVisible, setIsJsonRequestVisible] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(true);
  const [jsonRequestContent, setJsonRequestContent] = useState<any>(null);
  const node = useServiceStore((state) => state.selectedNode);
  const selectedService = useServiceListStore((state) => state.selectedService);

  const isUserDefinedNode = node?.data?.stepType === "user-defined";

  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const endpoints = useServiceStore((state) => state.endpoints);
  const rules = useServiceStore((state) => state.rules);
  const assignElements = useServiceStore((state) => state.assignElements);
  const endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);

  const defaultMultiChoiceQuestionButtons = [
    {
      title: "Yes",
      payload: `#service, /${selectedService?.type ?? 'POST'}/services/active/${serviceName}_mcq_${node?.data.label[node?.data.label.length - 1]}_0`,
    },
    {
      title: "No",
      payload: `#service, /${selectedService?.type ?? 'POST'}/services/active/${serviceName}_mcq_${node?.data.label[node?.data.label.length - 1]}_1`,
    },
  ];

  useEffect(() => {
    if (node) node.data.rules = rules;
  }, [rules]);

  useEffect(() => {
    if (node) node.data.assignElements = assignElements;
  }, [assignElements]);

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
    node?.data.multiChoiceQuestion?.question ?? ""
  );
  const [multiChoiceQuestionButtons, setMultiChoiceQuestionButtons] = useState<MultiChoiceQuestionButton[]>(
    node?.data.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons
  );

  const stepType = node?.data.stepType;

  useEffect(() => {
    if (stepType !== StepType.Input && stepType !== StepType.Condition) return;
    if (!node?.data?.rules) return;

    useServiceStore.getState().changeRulesNode(node.data.rules);
  }, [stepType === StepType.Input, stepType === StepType.Condition]);

  useEffect(() => {
    if (stepType !== StepType.Assign) return;
    if (!node?.data?.assignElements) return;

    useServiceStore.getState().changeAssignNode(node.data.assignElements);
  }, [stepType === StepType.Assign]);

  useEffect(() => {
    if (!node) return;
    setMultiChoiceQuestionQuestion(node?.data?.multiChoiceQuestion?.question ?? "");
    setMultiChoiceQuestionButtons(node?.data?.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons);
  }, [stepType === StepType.MultiChoiceQuestion]);

  if (!node) return <></>;

  const title = node.data.label;
  const isReadonly = node.data.readonly;

  const onClose = () => {
    setSelectedTab(null);
    setIsJsonRequestVisible(false);
    setJsonRequestContent(null);
    setTextfieldMessage(null);
    setWebpageName(null);
    setWebpageUrl(null);
    setFileName(null);
    setFileContent(null);
    setTextfieldMessagePlaceholders({});
    setMultiChoiceQuestionQuestion("");
    setMultiChoiceQuestionButtons(defaultMultiChoiceQuestionButtons);
    useServiceStore.getState().resetSelectedNode();
    useServiceStore.getState().resetRules();
    useServiceStore.getState().resetAssign();
  };

  const handleSaveClick = () => {
    const updatedNode: Node<NodeDataProps> = {
      ...node,
      data: {
        ...node.data,
        message: textfieldMessage ?? node.data?.message,
        link: webpageUrl ?? node.data?.link,
        linkText: webpageName ?? node.data?.linkText,
        fileName: fileName ?? node.data?.fileName,
        fileContent: fileContent ?? node.data?.fileContent,
        signOption: signOption ?? node.data?.signOption,
        multiChoiceQuestion: {
          question: multiChoiceQuestionQuestion,
          buttons: multiChoiceQuestionButtons,
        },
      },
    };

    if (stepType === StepType.Input || stepType === StepType.Condition) {
      updatedNode.data.rules = rules;
    }

    if (stepType === StepType.MultiChoiceQuestion) {
      saveMultiChoicePopup(node, updatedNode);
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
          fullPath[value.length] === "["
            ? // Uses array notation, e.g. endpointVariable[1].something; needed for backwards compatibility
              value.length
            : // Uses object notation, e.g. endpointVariable.1.something
              value.length + 1
        );
        element.data = remainingPath ? getValueByPath(endpointVariable.data, remainingPath) : endpointVariable.data;
      });
      updatedNode.data.assignElements = assignElements;
    }

    if (stepType === StepType.UserDefined) {
      saveApiEndpoints();
    }

    useServiceStore.getState().handlePopupSave(updatedNode);
    onClose();
  };

  const handleJsonRequestClick = async () => {
    if (isJsonRequestVisible) {
      setIsJsonRequestVisible(false);
      return;
    }

    try {
      const finder = (e: any) => e.name === node.data.label || node.data.label.includes(e.name);
      const endpoint = endpoints.find(finder)?.definitions[0];

      if (!endpoint) return;

      const response = await api.post(servicesRequestsExplain(), {
        url: endpoint.url,
        method: endpoint.methodType,
        headers: extractMapValues(endpoint.headers),
        body: extractMapValues(endpoint.body),
        params: extractMapValues(endpoint.params),
      });
      setJsonRequestContent(response.data);
      setIsJsonRequestVisible(true);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  function extractMapValues(element: any) {
    if (element.rawData && element.rawData.length > 0) {
      return element.rawData.value; //  element.rawData.testValue
    }

    let result: any = {};
    for (const entry of element.variables) {
      result = { ...result, [entry.name]: entry.value };
    }
    return result;
  }

  const getJsonRequestButtonTitle = () => {
    if (!isUserDefinedNode || selectedTab === t("serviceFlow.tabs.test")) return "";
    if (isJsonRequestVisible) return t("serviceFlow.popup.hideJsonRequest");
    return t("serviceFlow.popup.showJsonRequest");
  };

  const saveApiEndpoints = async () => {
    const endpoints = useServiceStore.getState().endpoints;
    const name = removeTrailingUnderscores(useServiceStore.getState().serviceNameDashed());
    const id = useServiceStore.getState().serviceId;

    await saveEndpoints(
      endpoints,
      name,
      id,
      () => {
        useToastStore.getState().success({
          title: i18next.t("newService.toast.success"),
          message: i18next.t("newService.toast.savedSuccessfully"),
        });
      },
      (e) => {
        useToastStore.getState().error({
          title: i18next.t("newService.toast.failed"),
          message: i18next.t("newService.toast.saveFailed"),
        });
      }
    );
    return true;
  };

  const saveMultiChoicePopup = (originalNode: Node<NodeDataProps>, updatedNode: Node<NodeDataProps>) => {
    const instance = useServiceStore.getState().reactFlowInstance;
    if (!instance) return;

    const currentButtons = originalNode.data.multiChoiceQuestion?.buttons ?? defaultMultiChoiceQuestionButtons;
    const newButtons = updatedNode.data.multiChoiceQuestion?.buttons ?? [];
    const newButtonTitles = newButtons.map((btn) => btn.title);

    const edges = instance.getEdges();
    const nodes = instance.getNodes();

    const connectedEdges = getConnectedEdges([originalNode], edges);

    const renamedButtons = new Map<string, string>();
    currentButtons.forEach((oldBtn, index) => {
      if (index < newButtons.length && oldBtn.title !== newButtons[index].title) {
        renamedButtons.set(oldBtn.title, newButtons[index].title);
      }
    });

    const updatedEdges = edges.map((edge) => {
      if (!edge.label || !connectedEdges.some((ce) => ce.id === edge.id)) return edge;

      const newLabel = renamedButtons.get(edge.label as string);
      if (newLabel) {
        return { ...edge, label: newLabel };
      }
      return edge;
    });

    const edgesToRemove = connectedEdges.filter((edge) => {
      if (!edge.label) return false;
      const currentLabel = renamedButtons.get(edge.label as string) ?? edge.label;
      return !newButtonTitles.includes(currentLabel as string);
    });

    const existingEdgeLabels = updatedEdges
      .filter((edge) => connectedEdges.some((ce) => ce.id === edge.id))
      .map((edge) => edge.label)
      .filter(Boolean);

    const buttonsNeedingEdges = newButtons.filter((btn) => !existingEdgeLabels.includes(btn.title));

    const filteredEdges = updatedEdges.filter((e) => !edgesToRemove.some((edgeToRemove) => edgeToRemove.id === e.id));

    const newEdges = buttonsNeedingEdges.map((button) => {
      const newEdge: Edge = {
        id: `${originalNode.id}->${crypto.randomUUID()}`,
        source: originalNode.id,
        target: crypto.randomUUID(),
        type: "step",
        animated: true,
        deletable: false,
        label: button.title,
      };
      return newEdge;
    });

    const newGhostNodes = newEdges.map((edge) => ({
      id: edge.target,
      type: "ghost",
      position: { x: originalNode.position.x, y: originalNode.position.y },
      data: { type: "ghost" },
      className: "ghost",
      selectable: false,
      draggable: false,
    }));

    let finalNodes = [...nodes.filter((n) => n.id !== updatedNode.id), updatedNode, ...newGhostNodes];
    let finalEdges = [...filteredEdges, ...newEdges];

    finalNodes = finalNodes.filter(
      (node) =>
        node.type !== "ghost" ||
        getIncomers(node, finalNodes, finalEdges).length > 0 ||
        getOutgoers(node, finalNodes, finalEdges).length > 0
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
        <Track direction="horizontal" gap={16} justify="between" style={{ width: "100%" }}>
          <Button appearance="text" onClick={handleJsonRequestClick}>
            {getJsonRequestButtonTitle()}
          </Button>
          <Track gap={16}>
            {!isReadonly && (
              <Button
                appearance="secondary"
                onClick={onClose}
              >
                {t("global.cancel")}
              </Button>
            )}
            <Button disabled={!isSaveEnabled} onClick={handleSaveClick}>
              {t(isReadonly ? "global.close" : "global.save")}
            </Button>
          </Track>
        </Track>
      }
    >
      <Track direction="vertical" align="stretch" gap={16} className="flow-body-reverse-margin">
        <Tabs.Root
          className="vertical-tabs__column"
          orientation="horizontal"
          value={selectedTab ?? t("serviceFlow.tabs.setup")!}
          onValueChange={setSelectedTab}
        >
          <Tabs.List>
            <Tabs.Trigger className="vertical-tabs__trigger" value={t("serviceFlow.tabs.setup")}>
              {t("serviceFlow.tabs.setup")}
            </Tabs.Trigger>
            {!isReadonly && (
              <Tabs.Trigger className="vertical-tabs__trigger" value={t("serviceFlow.tabs.test")}>
                {t("serviceFlow.tabs.test")}
              </Tabs.Trigger>
            )}
          </Tabs.List>
          <Tabs.Content value={t("serviceFlow.tabs.setup")} className="vertical-tabs__body">
            {stepType === StepType.Textfield && (
              <TextfieldContent
                defaultMessage={node.data.message ?? textfieldMessage ?? undefined}
                nodeId={node.id}
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
              <DefaultMessageContent message={t("serviceFlow.popup.redirectToCustomerSupport")} />
            )}
            {stepType === StepType.Auth && <DefaultMessageContent message={t("serviceFlow.popup.loginWithTARA")} />}
            {stepType === StepType.FileSign && (
              <FileSignContent onOptionChange={setSignOption} signOption={signOption} />
            )}
            {stepType === StepType.FinishingStepEnd && <EndConversationContent />}
            {stepType === StepType.RasaRules && <RasaRulesContent />}
            {stepType === StepType.Assign && <AssignContent nodeId={node.id} />}
            {stepType === StepType.Condition && <ConditionContent nodeId={node.id} />}
            {stepType === StepType.UserDefined && (
              <ApiContent
                nodeId={node.id}
                endpoint={endpoints.find((e) => e.name === node.data.label || node.data.label.includes(e.name))}
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
            <Tabs.Content value={t("serviceFlow.tabs.test")} className="vertical-tabs__body">
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
