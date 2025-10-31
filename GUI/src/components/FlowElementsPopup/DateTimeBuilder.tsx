import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import OutputElementBox from 'components/OutputElementBox';
import Track from 'components/Track';
import { CSSProperties, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Assign } from 'types';
import { getTypeColor } from 'utils/object-util';
import { stringToTemplate } from 'utils/string-util';
import { v4 } from 'uuid';

interface DateTimeBuilderProps {
  border: string;
  popupBodyCss: CSSProperties;
}

type Base = 'startOfDay' | 'startOfMonth' | 'startOfYear' | 'endOfDay' | 'endOfMonth' | 'endOfYear' | 'now';

const DateTimeBuilder: FC<DateTimeBuilderProps> = ({ border, popupBodyCss }) => {
  const { t } = useTranslation();
  const [base, setBase] = useState<Base>('now');
  const [addDays, setAddDays] = useState<string>('0');
  const [addMonths, setAddMonths] = useState<string>('0');
  const [addYears, setAddYears] = useState<string>('0');
  const [isTimePrecisionEnabled, setIsTimePrecisionEnabled] = useState<boolean>(false);
  const [timeFormat, setTimeFormat] = useState<string>('21:00:00.000');

  const baseOptions = [
    { label: String(t('serviceFlow.previousVariables.dates.now')), value: 'now' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfDay')), value: 'startOfDay' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfMonth')), value: 'startOfMonth' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfYear')), value: 'startOfYear' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfDay')), value: 'endOfDay' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfMonth')), value: 'endOfMonth' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfYear')), value: 'endOfYear' },
  ];

  const dateCode = useMemo(() => {
    // Build base date initialization
    let dateInit = 'new Date()';
    if (base === 'startOfDay') {
      dateInit = 'new Date(new Date().setHours(0, 0, 0, 0))';
    } else if (base === 'startOfMonth') {
      dateInit = 'new Date(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0))';
    } else if (base === 'startOfYear') {
      dateInit = 'new Date(new Date(new Date().setMonth(0, 1)).setHours(0, 0, 0, 0))';
    } else if (base === 'endOfDay') {
      dateInit = 'new Date(new Date().setHours(23, 59, 59, 999))';
    } else if (base === 'endOfMonth') {
      dateInit = 'new Date(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).setHours(23, 59, 59, 999))';
    } else if (base === 'endOfYear') {
      dateInit = 'new Date(new Date(new Date().getFullYear(), 11, 31).setHours(23, 59, 59, 999))';
    }

    // Parse offsets
    const daysNum = parseInt(addDays) || 0;
    const monthsNum = parseInt(addMonths) || 0;
    const yearsNum = parseInt(addYears) || 0;

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
    if (isTimePrecisionEnabled && timeFormat) {
      const timeParts = timeFormat.split(':');
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
      return `${dateInit}.toISOString()`;
    }

    const opsString = operations.join('; ');
    return `(function() { const d = ${dateInit}; ${opsString}; return d.toISOString(); })()`;
  }, [base, addDays, addMonths, addYears, isTimePrecisionEnabled, timeFormat]);

  const dragData: Assign = useMemo(
    () => ({
      id: v4(),
      key: 'dateTime',
      value: stringToTemplate(dateCode),
      data: dateCode,
    }),
    [dateCode],
  );

  const typeColor = getTypeColor(dateCode);

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
            options={baseOptions}
            defaultValue={base}
            style={{ fontSize: '14px' }}
            onSelectionChange={(selection) => {
              if (selection) {
                setBase(selection.value as Base);
              }
            }}
          />
        </Track>

        <Track direction="vertical" align="stretch" gap={8}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('serviceFlow.previousVariables.dates.offset')}</label>
          <Track direction="vertical" align="stretch" gap={8}>
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.days'))}
              name="addDays"
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.months'))}
              name="addMonths"
              type="number"
              value={addMonths}
              onChange={(e) => setAddMonths(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.years'))}
              name="addYears"
              type="number"
              value={addYears}
              onChange={(e) => setAddYears(e.target.value)}
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
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              placeholder="HH:mm:ss.SSS"
            />
          )}
        </Track>

        <Track direction="vertical" align="stretch" gap={8}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Output</label>
          <OutputElementBox dragData={dragData} borderColor={typeColor.color} style={{ cursor: 'grab' }}>
            {t('serviceFlow.previousVariables.dates.title')}
          </OutputElementBox>
        </Track>
      </Track>
    </Track>
  );
};

export default DateTimeBuilder;
