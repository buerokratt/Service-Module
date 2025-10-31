import FormCheckbox from 'components/FormElements/FormCheckbox';
import FormInput from 'components/FormElements/FormInput';
import FormSelect from 'components/FormElements/FormSelect';
import Track from 'components/Track';
import { CSSProperties, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimeBuilderProps {
  border: string;
}

type Base = 'startOfDay' | 'startOfMonth' | 'startOfYear' | 'endOfDay' | 'endOfMonth' | 'endOfYear' | 'now';

const DateTimeBuilder: FC<DateTimeBuilderProps> = ({ border }) => {
  const { t } = useTranslation();
  const [base, setBase] = useState<Base>('now');
  const [addDays, setAddDays] = useState<string>('0');
  const [addMonths, setAddMonths] = useState<string>('0');
  const [addYears, setAddYears] = useState<string>('0');
  const [isTimePrecisionEnabled, setIsTimePrecisionEnabled] = useState<boolean>(false);
  const [timeFormat, setTimeFormat] = useState<string>('00:00:00.000');

  const popupBodyCss: CSSProperties = {
    padding: 16,
    backgroundColor: '#F9F9F9',
    width: '100%',
  };

  const baseOptions = [
    { label: String(t('serviceFlow.previousVariables.dates.now')), value: 'now' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfDay')), value: 'startOfDay' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfMonth')), value: 'startOfMonth' },
    { label: String(t('serviceFlow.previousVariables.dates.startOfYear')), value: 'startOfYear' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfDay')), value: 'endOfDay' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfMonth')), value: 'endOfMonth' },
    { label: String(t('serviceFlow.previousVariables.dates.endOfYear')), value: 'endOfYear' },
  ];

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
              label={String(t('serviceFlow.previousVariables.dates.addDays'))}
              name="addDays"
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.addMonths'))}
              name="addMonths"
              type="number"
              value={addMonths}
              onChange={(e) => setAddMonths(e.target.value)}
            />
            <FormInput
              label={String(t('serviceFlow.previousVariables.dates.addYears'))}
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
              label={String(t('serviceFlow.previousVariables.dates.timeFormat'))}
              name="timeFormat"
              type="text"
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              placeholder="HH:mm:ss.SSS"
            />
          )}
        </Track>
      </Track>
    </Track>
  );
};

export default DateTimeBuilder;
