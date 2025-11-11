import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import Track from 'components/Track';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type BaseDate, getBaseOptions } from './date-time-utils';

interface DateSettingsProps {
  base: BaseDate;
  days: string;
  months: string;
  years: string;
  isTimePrecisionEnabled: boolean;
  time: string;
  onBaseChange: (value: BaseDate) => void;
  onDaysChange: (value: string) => void;
  onMonthsChange: (value: string) => void;
  onYearsChange: (value: string) => void;
  onTimePrecisionToggle: () => void;
  onTimeChange: (value: string) => void;
}

const DateSettings: FC<DateSettingsProps> = ({
  base,
  days,
  months,
  years,
  isTimePrecisionEnabled,
  time,
  onBaseChange,
  onDaysChange,
  onMonthsChange,
  onYearsChange,
  onTimePrecisionToggle,
  onTimeChange,
}) => {
  const { t } = useTranslation();

  return (
    <Track direction="vertical" align="stretch" gap={16} style={{ flex: '0 0 50%', maxWidth: '50%' }}>
      <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dateAndTime.base')}</label>
      <FormSelect
        label=""
        name="base"
        hideLabel
        options={getBaseOptions()}
        defaultValue={base}
        style={{ fontSize: '14px', width: '100%', maxWidth: '100%' }}
        onSelectionChange={(selection) => {
          if (selection) {
            onBaseChange(selection.value as BaseDate);
          }
        }}
      />

      <label style={{ fontSize: '14px', fontWeight: 500 }}>
        {t('serviceFlow.previousVariables.dateAndTime.offset')}
      </label>
      <Track direction="vertical" align="stretch" gap={8}>
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.days'))}
          name="days"
          type="number"
          value={days}
          onChange={(e) => onDaysChange(e.target.value)}
          style={{ width: '100%', maxWidth: '100%' }}
        />
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.months'))}
          name="months"
          type="number"
          value={months}
          onChange={(e) => onMonthsChange(e.target.value)}
          style={{ width: '100%', maxWidth: '100%' }}
        />
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.years'))}
          name="years"
          type="number"
          value={years}
          onChange={(e) => onYearsChange(e.target.value)}
          style={{ width: '100%', maxWidth: '100%' }}
        />
      </Track>

      <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dateAndTime.time')}</label>
      <FormCheckbox
        label=""
        name="timePrecision"
        hideLabel
        item={{
          label: String(t('serviceFlow.previousVariables.dateAndTime.setTime')),
          value: 'setTime',
        }}
        checked={isTimePrecisionEnabled}
        onChange={onTimePrecisionToggle}
      />
      {isTimePrecisionEnabled && (
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.time'))}
          name="timeFormat"
          type="text"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="HH:mm:ss.SSS"
          style={{ width: '100%', maxWidth: '100%' }}
        />
      )}
    </Track>
  );
};

export default DateSettings;
