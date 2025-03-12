import { FC, memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ExclamationBadge, CheckBadge, Track } from "../";
import { StepType } from "../../types";
import useServiceStore from "store/new-services.store";
import { Group, Rule } from "components/FlowElementsPopup/RuleBuilder/types";
import { Assign } from "components/FlowElementsPopup/AssignBuilder/assign-types";

type NodeDataProps = {
  data: {
    childrenCount: number;
    clientInputId: number;
    conditionId: number;
    assignId: number;
    label: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    type: string;
    stepType: StepType;
    readonly: boolean;
    name?: string;
    condition?: string;
    value?: string;
    message?: string;
    link?: string;
    linkText?: string;
    fileName?: string;
    fileContent?: string;
    signOption?: { label: string; value: string };
    originalDefinedNodeId?: string;
    rules?: Group;
    assignElements?: Assign[];
  };
};

const StepNode: FC<NodeDataProps> = ({ data }) => {
  const { t } = useTranslation();
  const endpoints = useServiceStore((state) => state.endpoints);
  const [isTestedAndPassed, setIsTestedAndPassed] = useState<boolean | null>(null);

  const boldText = {
    fontWeight: 500,
  };
  const createMarkup = (text: string) => {
    return {
      __html: text,
    };
  };

  const isStepInvalid = () => {
    if (data.stepType === StepType.Input || data.stepType === StepType.Condition) {
      const hasInvalidRules = (elements: any[]): boolean => {
        return elements.some((e) => {
          if ("children" in e) {
            const group = e as Group;
            if (group.children.length === 0) return true;
            return hasInvalidRules(group.children);
          } else {
            const rule = e as Rule;
            return rule.value === "" || rule.field === "" || rule.operator === "";
          }
        });
      };

      const invalidRulesExist = hasInvalidRules(data.rules?.children || []);
      return data.rules?.children === undefined || invalidRulesExist || data.rules?.children.length === 0;
    };
    if (data.stepType === StepType.UserDefined) return;
    if (data.stepType === StepType.OpenWebpage) return !data.link || !data.linkText;
    if (data.stepType === StepType.FileGenerate) return !data.fileName || !data.fileContent;
    if (data.stepType === StepType.FileSign) return !data.signOption;
    if (data.stepType === StepType.Assign) {
      const hasInvalidElements = (elements: any[]): boolean => {
        return elements.some((e) => {
          const element = e as Assign;
          return element.key === "" || element.value === "";
        });
      };

      const invalidElementsExist = hasInvalidElements(data.assignElements || []);
      return data?.assignElements === undefined || invalidElementsExist || data?.assignElements.length === 0;
    };

    return !(data.readonly || !!data.message?.length);
  };

  const updateIsTestedAndPassed = async () => {
    if (isStepInvalid()) {
      setIsTestedAndPassed(false);
      return;
    }

    if (data.stepType !== StepType.UserDefined) {
      setIsTestedAndPassed(true);
      return;
    }

    const endpoint = endpoints.find((x) => x.id === data.originalDefinedNodeId);

    if (!endpoint) {
      setIsTestedAndPassed(false);
      return;
    }

    await useServiceStore.getState().testUrl(
      endpoint,
      () => setIsTestedAndPassed(false),
      () => setIsTestedAndPassed(true)
    );
  };

  useEffect(() => {
    updateIsTestedAndPassed();
  }, [data]);

  return (
    <Track
      style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
      direction="vertical"
      align="left"
    >
      <p>
        <TestStatue isTestedAndPassed={isTestedAndPassed} isStepInvalid={isStepInvalid} />
        {data.label}
      </p>
      {data.stepType === StepType.Textfield && (
        <div style={boldText} dangerouslySetInnerHTML={createMarkup(data.message ?? "")}></div>
      )}
      {data.stepType === StepType.Auth && <p style={boldText}>"{t("serviceFlow.popup.loginWithTARA")}"</p>}
      {data.stepType === StepType.Input && (
        <p>
          <span style={boldText}>{t("newService.endpoint.variable")}</span>
          <span style={{ marginLeft: 8 }} className="client-input-variable-tag">
            client_input_{data.clientInputId}
          </span>
        </p>
      )}
      {data.stepType === StepType.OpenWebpage && (
        <p>
          <span className="webpage-link-text">{data.linkText}</span>
          {data.link && (
            <span className="webpage-link" style={{ marginLeft: 8 }}>
              ({data.link})
            </span>
          )}
        </p>
      )}
      {data.stepType === StepType.FileGenerate && data.fileName && (
        <p>
          <span style={boldText}>{data.fileName}</span>
          <span className="file-name-extension" style={{ marginLeft: 8 }}>
            {data.fileName}.zip
          </span>
        </p>
      )}
      {data.stepType === StepType.FileSign && <p style={boldText}>“{t("serviceFlow.popup.fileSign")}”</p>}
      {data.stepType === StepType.FinishingStepEnd && <p style={boldText}>“{t("serviceFlow.popup.serviceEnded")}”</p>}
      {data.stepType === StepType.FinishingStepRedirect && (
        <p style={boldText}>{t("serviceFlow.popup.redirectToCustomerSupport")}</p>
      )}
      {data.stepType === StepType.Rule && (
        <p>
          {data.name && (
            <span style={{ marginRight: 8 }} className="client-input-variable-tag">
              {data.name}
            </span>
          )}
          {data.condition && <span style={boldText}>{data.condition}</span>}
          {data.value && <span style={{ ...boldText, marginLeft: 8 }}>{data.value}</span>}
        </p>
      )}
    </Track>
  );
};

const TestStatue = ({
  isTestedAndPassed,
  isStepInvalid,
}:{
  isTestedAndPassed: boolean | null,
  isStepInvalid: () => boolean,
}) => {
  if(isTestedAndPassed) 
    return <CheckBadge />
  if(isStepInvalid())
    return <ExclamationBadge />
  return <ExclamationBadge color="purple" />
}

export default memo(StepNode);
