import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import OutputElementBox from 'components/OutputElementBox';
import Track from 'components/Track';
import { CSSProperties, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Assign } from 'types';
import { getTypeColor } from 'utils/object-util';

import { type BaseDate, createDateTimeDragData, generateDateCode, getBaseOptions } from './date-time-utils';

interface DateTimeBuilderProps {
  border: string;
  popupBodyCss: CSSProperties;
}

const DateTimeBuilder: FC<DateTimeBuilderProps> = ({ border, popupBodyCss }) => {
  const { t } = useTranslation();
  const [base, setBase] = useState<BaseDate>('now');
  const [days, setDays] = useState<string>('0');
  const [months, setMonths] = useState<string>('0');
  const [years, setYears] = useState<string>('0');
  const [isTimePrecisionEnabled, setIsTimePrecisionEnabled] = useState<boolean>(false);
  const [time, setTime] = useState<string>('21:00:00.000');

  const dateCode = useMemo(
    () =>
      generateDateCode(base, {
        days,
        months,
        years,
        isTimePrecisionEnabled,
        time,
      }),
    [base, days, months, years, isTimePrecisionEnabled, time],
  );

  const dragData: Assign = useMemo(() => createDateTimeDragData(dateCode), [dateCode]);

  return (
    <Track
      direction="vertical"
      align="left"
      style={{
        ...popupBodyCss,
        borderBottom: border,
      }}
    >
      <label htmlFor="json" style={{ marginBottom: '10px', textTransform: 'capitalize', cursor: 'auto' }}>
        {t('serviceFlow.previousVariables.dates.title')}
      </label>

      <Track direction="horizontal" align="stretch" gap={16} style={{ width: '100%' }}>
        <Track direction="vertical" align="stretch" gap={16} style={{ flex: '0 0 50%', maxWidth: '50%' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dates.base')}</label>
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

          <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dates.offset')}</label>
          <Track direction="vertical" align="stretch" gap={8}>
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.days'))}
              name="days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              style={{ width: '100%', maxWidth: '100%' }}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.months'))}
              name="months"
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              style={{ width: '100%', maxWidth: '100%' }}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.years'))}
              name="years"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              style={{ width: '100%', maxWidth: '100%' }}
            />
          </Track>

          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('serviceFlow.previousVariables.dates.timePrecision')}
          </label>
          <FormCheckbox
            label=""
            name="timePrecision"
            hideLabel
            item={{
              label: String(t('serviceFlow.previousVariables.dates.setTime')),
              value: 'setTime',
            }}
            checked={isTimePrecisionEnabled}
            onChange={() => setIsTimePrecisionEnabled(!isTimePrecisionEnabled)}
          />
          {isTimePrecisionEnabled && (
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.time'))}
              name="timeFormat"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="HH:mm:ss.SSS"
              style={{ width: '100%', maxWidth: '100%' }}
            />
          )}

          <label style={{ fontSize: '14px', fontWeight: 500 }}>Output</label>
          <OutputElementBox
            dragData={dragData}
            borderColor={getTypeColor(dateCode).color}
            style={{ cursor: 'grab', width: 'fit-content', maxWidth: '100%' }}
          >
            {t('serviceFlow.previousVariables.dates.title')}
          </OutputElementBox>
        </Track>

        <Track direction="vertical" align="stretch" style={{ flex: '0 0 50%', maxWidth: '50%' }}>
          {/* Right side for future options */}
        </Track>
      </Track>
    </Track>
  );
};

export default DateTimeBuilder;
