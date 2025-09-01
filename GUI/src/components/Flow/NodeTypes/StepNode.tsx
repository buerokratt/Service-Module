import CheckBadge from 'components/CheckBadge';
import ExclamationBadge from 'components/ExclamationBadge';
import { Group, Rule } from 'components/FlowElementsPopup/RuleBuilder/types';
import Track from 'components/Track';
import { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import { StepType } from 'types';
import { Assign } from 'types/assign';
import { NodeDataProps } from 'types/service-flow';

type StepNodeProps = {
  data: NodeDataProps;
};

const StepNode: FC<StepNodeProps> = ({ data }) => {
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
    // todo here
    if (data.testingPassed === false) return true;

    if (data.stepType === StepType.Input || data.stepType === StepType.Condition) {
      const hasInvalidRules = (elements: any[]): boolean => {
        return elements.some((e) => {
          if ('children' in e) {
            const group = e as Group;
            if (group.children.length === 0) return true;
            return hasInvalidRules(group.children);
          } else {
            const rule = e as Rule;
            return rule.value === '' || rule.field === '' || rule.operator === '';
          }
        });
      };

      const invalidRulesExist = hasInvalidRules(data.rules?.children ?? []);
      return data.rules?.children === undefined || invalidRulesExist || data.rules?.children.length === 0;
    }
    if (data.stepType === StepType.MultiChoiceQuestion) {
      return (
        !data?.multiChoiceQuestion?.question ||
        data.multiChoiceQuestion?.buttons?.find((e) => e.title === '') != undefined
      );
    }

    if (data.stepType === StepType.DynamicChoices) {
      return !data?.dynamicChoices?.list || !data?.dynamicChoices?.serviceName || !data?.dynamicChoices?.key;
    }

    if (data.stepType === StepType.UserDefined) return;
    if (data.stepType === StepType.OpenWebpage) return !data.link || !data.linkText;
    if (data.stepType === StepType.FileGenerate) return !data.fileName || !data.fileContent;
    if (data.stepType === StepType.FileSign) return !data.signOption;
    if (data.stepType === StepType.Assign) {
      const hasInvalidElements = (elements: any[]): boolean => {
        return elements.some((e) => {
          const element = e as Assign;
          return element.key === '' || element.value === '';
        });
      };

      const invalidElementsExist = hasInvalidElements(data.assignElements ?? []);
      return data?.assignElements === undefined || invalidElementsExist || data?.assignElements.length === 0;
    }

    return !data.readonly && !data.message?.length;
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

    const endpoint = endpoints.find((x) => x.endpointId === data.originalDefinedNodeId);

    if (!endpoint) {
      setIsTestedAndPassed(false);
      return;
    }

    await useServiceStore.getState().testUrl(
      endpoint,
      () => setIsTestedAndPassed(false),
      () => setIsTestedAndPassed(true),
    );
  };

  useEffect(() => {
    updateIsTestedAndPassed();
  }, [data]);

  return (
    <Track
      style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
      direction="vertical"
      align="left"
    >
      <p>
        <TestStatue isTestedAndPassed={isTestedAndPassed} isStepInvalid={isStepInvalid} />
        {data.label}
      </p>
      {data.stepType === StepType.Textfield && (
        <div style={boldText} dangerouslySetInnerHTML={createMarkup(data.message ?? '')}></div>
      )}
      {data.stepType === StepType.MultiChoiceQuestion && (
        <div style={boldText} dangerouslySetInnerHTML={createMarkup(data.multiChoiceQuestion?.question ?? '')}></div>
      )}
      {data.stepType === StepType.Auth && <p style={boldText}>&quot;{t('serviceFlow.popup.loginWithTARA')}&quot;</p>}
      {data.stepType === StepType.Input && (
        <p>
          <span style={boldText}>{t('newService.endpoint.variable')}</span>
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
      {data.stepType === StepType.FileSign && <p style={boldText}>“{t('serviceFlow.popup.fileSign')}”</p>}
      {data.stepType === StepType.FinishingStepEnd && <p style={boldText}>“{t('serviceFlow.popup.serviceEnded')}”</p>}
      {data.stepType === StepType.FinishingStepRedirect && (
        <p style={boldText}>{t('serviceFlow.popup.redirectToCustomerSupport')}</p>
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
}: {
  isTestedAndPassed: boolean | null;
  isStepInvalid: () => boolean | undefined;
}) => {
  if (isTestedAndPassed) return <CheckBadge />;
  if (isStepInvalid()) return <ExclamationBadge />;
  return <ExclamationBadge color="purple" />;
};

export default memo(StepNode);
