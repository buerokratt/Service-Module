import OutputElementBox from 'components/OutputElementBox';
import Track from 'components/Track';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateTimeBuilderContext } from './useDateTimeBuilderContext';

const DateTimePreview: FC = () => {
  const { t } = useTranslation();
  const { dragData, evaluatedDate, borderColor } = useDateTimeBuilderContext();

  return (
    <Track direction="horizontal" align="center" gap={8} style={{ width: '100%', flexWrap: 'wrap' }}>
      <OutputElementBox dragData={dragData} borderColor={borderColor} style={{ cursor: 'grab', width: 'fit-content' }}>
        {t('serviceFlow.previousVariables.dateAndTime.title')}
      </OutputElementBox>
      <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>{evaluatedDate}</span>
    </Track>
  );
};

export default DateTimePreview;
