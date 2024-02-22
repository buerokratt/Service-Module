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
import axios from "axios";
import { servicesRequestsExplain } from "../../resources/api-constants";
import OpenWebPageContent from "./OpenWebPageContent";
import OpenWebPageTestContent from "./OpenWebPageTestContent";
import RasaRulesContent from "./RasaRulesContent";
import { StepType } from "../../types";
import useServiceStore from "store/new-services.store";
import FileSignContent from "./FileSignContent";
import "./styles.scss";

const FlowElementsPopup: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [isJsonRequestVisible, setIsJsonRequestVisible] = useState(false);
  const [jsonRequestContent, setJsonRequestContent] = useState<any>(null);
  const node = useServiceStore(state => state.selectedNode);

  const isUserDefinedNode = node?.data?.stepType === "user-defined";

  const endpoints = useServiceStore(state => state.endpoints);
  const rules = useServiceStore(state => state.rules);

  useEffect(() => {
    if (node) node.data.rules = rules;
  }, [rules]);

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

  const stepType = node?.data.stepType;

  useEffect(() => {
    if(stepType !== StepType.Input) return;
    if(!node?.data?.rules) return;

    useServiceStore.getState().changeRulesNode(node.data.rules);
  }, [stepType === StepType.Input]);
  
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
    useServiceStore.getState().resetSelectedNode();
    useServiceStore.getState().resetRules();
  };

  const handleSaveClick = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        message: textfieldMessage ?? node.data?.message,
        link: webpageUrl ?? node.data?.link,
        linkText: webpageName ?? node.data?.linkText,
        fileName: fileName ?? node.data?.fileName,
        fileContent: fileContent ?? node.data?.fileContent,
        signOption: signOption ?? node.data?.signOption,
      },
    };
    
    if (stepType === StepType.Input) {
      updatedNode.data.rules = rules;
    }

    useServiceStore.getState().handlePopupSave(updatedNode);
  };

  const handleJsonRequestClick = async () => {
    if (isJsonRequestVisible) {
      setIsJsonRequestVisible(false);
      return;
    }

    try {
      const finder = (e: any) => e.name === node.data.label || node.data.label.includes(e.name);
      const endpoint = endpoints.find(finder)?.definedEndpoints[0];

      if (!endpoint) return;

      const response = {
        url: endpoint.url,
        method: endpoint.methodType,
        headers: extractMapValues(endpoint.headers),
        body: extractMapValues(endpoint.body),
        params: extractMapValues(endpoint.params),
      };
      setJsonRequestContent(response);
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

  return (
    <Popup
      style={{ maxWidth: 700, overflow: 'visible' }}
      title={title}
      onClose={onClose}
      footer={
        <Track direction="horizontal" gap={16} justify="between" style={{ width: "100%" }}>
          <Button appearance="text" onClick={handleJsonRequestClick}>
            {getJsonRequestButtonTitle()}
          </Button>
          <Track gap={16}>
            {!isReadonly && (
              <Button appearance="secondary" onClick={onClose}>
                {t("global.cancel")}
              </Button>
            )}
            <Button onClick={handleSaveClick}>
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
            <JsonRequestContent isVisible={isJsonRequestVisible} jsonContent={jsonRequestContent} />
          </Tabs.Content>
          {!isReadonly && (
            <Tabs.Content value={t("serviceFlow.tabs.test")} className="vertical-tabs__body">
              {stepType === StepType.Textfield && (
                <TextfieldTestContent
                  placeholders={textfieldMessagePlaceholders}
                  message={textfieldMessage || node.data.message}
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
