import Track from 'components/Track';
import { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';

import DateSettings from './DateSettings';
import { DateTimeBuilderProvider } from './DateTimeBuilderProvider';
import DateTimePreview from './DateTimePreview';
import FormatSettings from './FormatSettings';

interface DateTimeBuilderProps {
  border: string;
  popupBodyCss: CSSProperties;
}

const DateTimeBuilderContent: FC<{ border: string; popupBodyCss: CSSProperties }> = ({ border, popupBodyCss }) => {
  const { t } = useTranslation();
  const paddingValue = typeof popupBodyCss.padding === 'number' ? popupBodyCss.padding : 16;

  return (
    <Track
      direction="vertical"
      align="left"
      gap={16}
      style={{
        ...popupBodyCss,
        borderBottom: border,
        paddingRight: popupBodyCss.paddingRight ?? paddingValue,
      }}
    >
      <DateTimePreview />
      <Track direction="horizontal" align="stretch" gap={16} style={{ width: '100%' }}>
        <DateSettings />
        <FormatSettings />
      </Track>
    </Track>
  );
};

const DateTimeBuilder: FC<DateTimeBuilderProps> = ({ border, popupBodyCss }) => {
  return (
    <DateTimeBuilderProvider>
      <DateTimeBuilderContent border={border} popupBodyCss={popupBodyCss} />
    </DateTimeBuilderProvider>
  );
};

export default DateTimeBuilder;
