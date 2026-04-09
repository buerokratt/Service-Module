import CheckBadge from 'components/CheckBadge';
import ExclamationBadge from 'components/ExclamationBadge';
import Track from 'components/Track';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import useServiceStore from 'store/new-services.store';
import { StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';
import { validateStep } from 'utils/flow-utils';
import { decodeHtmlEntities, ensureAbsoluteUrl } from 'utils/string-util';

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
    const decodedText = decodeHtmlEntities(text);
    const sanitizedText = sanitizeHtml(decodedText, {
      allowedTags: ['a', 'b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li', 'code'],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
      },
      disallowedTagsMode: 'discard',
      transformTags: {
        a: (_tagName, attribs) => ({
          tagName: 'a',
          attribs: {
            ...attribs,
            href: ensureAbsoluteUrl(attribs.href ?? ''),
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
      },
    });

    return {
      __html: sanitizedText,
    };
  };

  const updateIsTestedAndPassed = useCallback(async () => {
    if (!validateStep(data).isValid) {
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
  }, [data, endpoints]);

  useEffect(() => {
    updateIsTestedAndPassed().catch(() => {
      setIsTestedAndPassed(false);
    });
  }, [updateIsTestedAndPassed]);

  return (
    <Track
      style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
      direction="vertical"
      align="left"
    >
      <p>
        <TestStatue isTestedAndPassed={isTestedAndPassed} data={data} />
        {data.label}
      </p>
      {data.stepType === StepType.Textfield && (
        <div
          className="step-node-content"
          style={{ ...boldText }}
          dangerouslySetInnerHTML={createMarkup(data.message ?? '')}
        />
      )}
      {data.stepType === StepType.MultiChoiceQuestion && (
        <div
          className="step-node-content"
          style={{ ...boldText }}
          dangerouslySetInnerHTML={createMarkup(data.multiChoiceQuestion?.question ?? '')}
        />
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

const TestStatue = ({ isTestedAndPassed, data }: { isTestedAndPassed: boolean | null; data: NodeDataProps }) => {
  if (isTestedAndPassed) return <CheckBadge />;
  if (!validateStep(data).isValid) return <ExclamationBadge />;
  return <ExclamationBadge color="purple" />;
};

export default memo(StepNode);
