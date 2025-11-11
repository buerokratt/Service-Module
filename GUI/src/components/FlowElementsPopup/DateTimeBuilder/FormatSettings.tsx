import FormSelect from 'components/FormElements/FormSelect';
import Track from 'components/Track';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type DatePart, type FormatType, type Separator } from './date-time-utils';

interface FormatSettingsProps {
  formatType: FormatType;
  dateOrder: [DatePart, DatePart, DatePart];
  separator: Separator;
  onFormatTypeChange: (value: FormatType) => void;
  onDateOrderChange: (value: [DatePart, DatePart, DatePart]) => void;
  onSeparatorChange: (value: Separator) => void;
}

const FormatSettings: FC<FormatSettingsProps> = ({
  formatType,
  dateOrder,
  separator,
  onFormatTypeChange,
  onDateOrderChange,
  onSeparatorChange,
}) => {
  const { t } = useTranslation();

  const handleDateOrderChange = (index: number, newValue: DatePart) => {
    const newOrder: [DatePart, DatePart, DatePart] = [...dateOrder];
    const currentValue = dateOrder[index];

    // If the new value is already in another position, swap them
    const existingIndex = dateOrder.findIndex((val) => val === newValue);
    if (existingIndex !== -1 && existingIndex !== index) {
      newOrder[existingIndex] = currentValue;
    }

    newOrder[index] = newValue;
    onDateOrderChange(newOrder);
  };

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
            onFormatTypeChange(selection.value as FormatType);
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
                    handleDateOrderChange(index, selection.value as DatePart);
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
                onSeparatorChange(selection.value as Separator);
              }
            }}
          />
        </>
      )}
    </Track>
  );
};

export default FormatSettings;
