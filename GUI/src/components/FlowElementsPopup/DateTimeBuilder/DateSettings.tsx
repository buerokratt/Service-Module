import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import Track from 'components/Track';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type BaseDate, getBaseOptions } from './date-time-utils';
import { useDateTimeBuilderContext } from './useDateTimeBuilderContext';

const DateSettings: FC = () => {
  const { t } = useTranslation();
  const {
    state: { base, days, months, years, isTimePrecisionEnabled, time },
    setBase,
    setDays,
    setMonths,
    setYears,
    setIsTimePrecisionEnabled,
    setTime,
  } = useDateTimeBuilderContext();

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
            setBase(selection.value as BaseDate);
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
          onChange={(e) => setDays(e.target.value)}
        />
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.months'))}
          name="months"
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
        <FormInput
          label={String(t('serviceFlow.previousVariables.dateAndTime.years'))}
          name="years"
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </Track>

      <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dateAndTime.time')}</label>
      <Track direction="horizontal" align="center" gap={8} style={{ width: '100%', height: '33px' }}>
        <FormCheckbox
          label=""
          name="timePrecision"
          hideLabel
          item={{
            label: String(t('serviceFlow.previousVariables.dateAndTime.setTime')),
            value: 'setTime',
          }}
          checked={isTimePrecisionEnabled}
          onChange={() => setIsTimePrecisionEnabled(!isTimePrecisionEnabled)}
        />
        {isTimePrecisionEnabled ? (
          <FormInput
            label=""
            name="timeFormat"
            hideLabel
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="HH:mm:ss.SSS"
            style={{ width: '156px', marginLeft: '6px' }}
          />
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </Track>
    </Track>
  );
};

export default DateSettings;
