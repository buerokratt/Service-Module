import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import OutputElementBox from 'components/OutputElementBox';
import Track from 'components/Track';
import { t } from 'i18next';
import { CSSProperties, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Assign } from 'types';
import { getTypeColor } from 'utils/object-util';
import { stringToTemplate } from 'utils/string-util';
import { v4 } from 'uuid';

import { type BaseDate, baseOptionsConfig, generateDateCode } from './date-time-utils';

const getBaseOptions = (): { label: string; value: BaseDate }[] =>
  baseOptionsConfig.map((option) => ({
    label: String(t(`serviceFlow.previousVariables.dates.${option.value}`)),
    value: option.value,
  }));

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
    () => generateDateCode(base, days, months, years, isTimePrecisionEnabled, time),
    [base, days, months, years, isTimePrecisionEnabled, time],
  );

  const dragData: Assign = useMemo(
    () => ({
      id: v4(),
      key: 'dateTime',
      value: stringToTemplate(dateCode),
      data: dateCode,
    }),
    [dateCode],
  );

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

      <Track direction="vertical" align="stretch" gap={16}>
        <Track direction="vertical" align="stretch" gap={8}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dates.base')}</label>
          <FormSelect
            label=""
            name="base"
            hideLabel
            options={getBaseOptions()}
            defaultValue={base}
            style={{ fontSize: '14px' }}
            onSelectionChange={(selection) => {
              if (selection) {
                setBase(selection.value as BaseDate);
              }
            }}
          />
        </Track>

        <Track direction="vertical" align="stretch" gap={8}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dates.offset')}</label>
          <Track direction="vertical" align="stretch" gap={8}>
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.days'))}
              name="days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.months'))}
              name="months"
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.years'))}
              name="years"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </Track>
        </Track>

        <Track direction="vertical" align="stretch" gap={8}>
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
            />
          )}
        </Track>

        <Track direction="vertical" align="stretch" gap={8}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Output</label>
          <OutputElementBox dragData={dragData} borderColor={getTypeColor(dateCode).color} style={{ cursor: 'grab' }}>
            {t('serviceFlow.previousVariables.dates.title')}
          </OutputElementBox>
        </Track>
      </Track>
    </Track>
  );
};

export default DateTimeBuilder;
