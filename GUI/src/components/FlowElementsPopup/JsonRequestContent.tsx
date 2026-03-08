import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FormTextarea } from '../FormElements';
import Track from '../Track';

type JsonRequestContentProps = {
  readonly isVisible: boolean;
  readonly padding?: number;
  readonly jsonContent?: string | null;
};

const JsonRequestContent: FC<JsonRequestContentProps> = ({ isVisible, jsonContent, padding = 16 }) => {
  const { t } = useTranslation();
  if (!isVisible) return <></>;

  return (
    <Track direction="vertical" align="left" style={{ width: '100%', padding: padding }}>
      <label htmlFor="json">JSON</label>
      <FormTextarea
        label="JSON"
        placeholder={t('serviceFlow.popup.jsonRequestPlaceholder')!}
        hideLabel={true}
        maxRows={7}
        style={{
          backgroundColor: '#F0F0F2',
          resize: 'vertical',
        }}
        defaultValue={JSON.stringify(jsonContent, undefined, 4)}
        readOnly
      ></FormTextarea>
    </Track>
  );
};

export default JsonRequestContent;
