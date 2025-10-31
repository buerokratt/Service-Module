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

type BaseAnchor = 'startOfDay' | 'startOfMonth' | 'startOfYear' | 'endOfDay' | 'endOfMonth' | 'endOfYear' | 'now';

const baseOptionsConfig: Array<{ value: BaseAnchor; baseDate: string }> = [
  { value: 'now', baseDate: 'new Date()' },
  {
    value: 'startOfDay',
    baseDate: 'new Date(new Date().setHours(0, 0, 0, 0))',
  },
  {
    value: 'startOfMonth',
    baseDate: 'new Date(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0))',
  },
  {
    value: 'startOfYear',
    baseDate: 'new Date(new Date(new Date().setMonth(0, 1)).setHours(0, 0, 0, 0))',
  },
  {
    value: 'endOfDay',
    baseDate: 'new Date(new Date().setHours(23, 59, 59, 999))',
  },
  {
    value: 'endOfMonth',
    baseDate: 'new Date(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).setHours(23, 59, 59, 999))',
  },
  {
    value: 'endOfYear',
    baseDate: 'new Date(new Date(new Date().getFullYear(), 11, 31).setHours(23, 59, 59, 999))',
  },
];

const getBaseOptions = (): { label: string; value: BaseAnchor }[] =>
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
  const [base, setBase] = useState<BaseAnchor>('now');
  const [days, setDays] = useState<string>('0');
  const [months, setMonths] = useState<string>('0');
  const [years, setYears] = useState<string>('0');
  const [isTimePrecisionEnabled, setIsTimePrecisionEnabled] = useState<boolean>(false);
  const [time, setTime] = useState<string>('21:00:00.000');

  const dateCode = useMemo(() => {
    // Get base date initialization from config
    const baseDate = baseOptionsConfig.find((option) => option.value === base)?.baseDate || 'new Date()';

    // Parse offsets
    const daysNum = parseInt(days) || 0;
    const monthsNum = parseInt(months) || 0;
    const yearsNum = parseInt(years) || 0;

    // Build operations using IIFE to avoid nested new Date() calls
    const operations: string[] = [];

    if (daysNum !== 0) {
      const milliseconds = daysNum * 86400000;
      operations.push(`d = new Date(d.getTime() + ${milliseconds})`);
    }
    if (monthsNum !== 0) {
      operations.push(`d.setMonth(d.getMonth() + ${monthsNum})`);
    }
    if (yearsNum !== 0) {
      operations.push(`d.setFullYear(d.getFullYear() + ${yearsNum})`);
    }
    if (isTimePrecisionEnabled && time) {
      const timeParts = time.split(':');
      if (timeParts.length >= 2) {
        const hours = timeParts[0] || '0';
        const minutes = timeParts[1] || '0';
        const secondsPart = timeParts[2]?.split('.')[0] || '0';
        const milliseconds = timeParts[2]?.split('.')[1] || '0';
        operations.push(`d.setHours(${hours}, ${minutes}, ${secondsPart}, ${milliseconds})`);
      }
    }

    // Build IIFE expression
    if (operations.length === 0) {
      return `${baseDate}.toISOString()`;
    }

    const opsString = operations.join('; ');
    return `(function() { const d = ${baseDate}; ${opsString}; return d.toISOString(); })()`;
  }, [base, days, months, years, isTimePrecisionEnabled, time]);

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
                setBase(selection.value as BaseAnchor);
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
