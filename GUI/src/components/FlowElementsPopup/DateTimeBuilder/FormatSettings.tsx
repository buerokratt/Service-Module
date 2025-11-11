import FormSelect from 'components/FormElements/FormSelect';
import Track from 'components/Track';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type DatePart, type FormatType, type Separator, updateDateOrder } from './date-time-utils';
import { useDateTimeBuilderContext } from './useDateTimeBuilderContext';

const FormatSettings: FC = () => {
  const { t } = useTranslation();
  const {
    state: { formatType, dateOrder, separator },
    setFormatType,
    setDateOrder,
    setSeparator,
  } = useDateTimeBuilderContext();

  return (
    <Track direction="vertical" align="stretch" gap={16} style={{ flex: '0 0 50%', maxWidth: '50%' }}>
      <label style={{ fontSize: '14px', fontWeight: 500 }}>
        {t('serviceFlow.previousVariables.dateAndTime.format')}
      </label>

      <FormSelect
        label=""
        name="formatType"
        hideLabel
        options={[
          { label: String(t('serviceFlow.previousVariables.dateAndTime.dateOnly')), value: 'dateOnly' },
          { label: String(t('serviceFlow.previousVariables.dateAndTime.timestamp')), value: 'timestamp' },
          { label: String(t('serviceFlow.previousVariables.dateAndTime.timestampMs')), value: 'timestampMs' },
          { label: String(t('serviceFlow.previousVariables.dateAndTime.yearOnly')), value: 'yearOnly' },
        ]}
        defaultValue={formatType}
        style={{ fontSize: '14px', width: '100%', maxWidth: '100%' }}
        onSelectionChange={(selection) => {
          if (selection) {
            setFormatType(selection.value as FormatType);
          }
        }}
      />

      {formatType !== 'yearOnly' && (
        <>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('serviceFlow.previousVariables.dateAndTime.dateOrder')}
          </label>
          <Track direction="horizontal" align="stretch" gap={8}>
            {[0, 1, 2].map((index) => (
              <FormSelect
                key={index}
                label=""
                name={`dateOrder${index + 1}`}
                hideLabel
                options={['YYYY', 'MM', 'DD'].map((part) => ({ label: part, value: part }))}
                defaultValue={dateOrder[index]}
                style={{ fontSize: '14px', width: '100%', maxWidth: '100%' }}
                onSelectionChange={(selection) => {
                  if (selection) {
                    const newOrder = updateDateOrder(dateOrder, index, selection.value as DatePart);
                    setDateOrder(newOrder);
                  }
                }}
              />
            ))}
          </Track>

          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('serviceFlow.previousVariables.dateAndTime.separator')}
          </label>
          <FormSelect
            label=""
            name="separator"
            hideLabel
            options={[
              { label: '.', value: '.' },
              { label: '/', value: '/' },
              { label: '-', value: '-' },
            ]}
            defaultValue={separator}
            style={{ fontSize: '14px', width: '100%', maxWidth: '100%' }}
            onSelectionChange={(selection) => {
              if (selection) {
                setSeparator(selection.value as Separator);
              }
            }}
          />
        </>
      )}
    </Track>
  );
};

export default FormatSettings;
