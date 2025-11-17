import FormError from 'components/FormElements/FormError';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheck, MdDeleteOutline, MdEdit } from 'react-icons/md';
import useServiceStore from 'store/new-services.store';
import useServiceListStore from 'store/services.store';
import { removeTrailingUnderscores } from 'utils/string-util';
import { v4 } from 'uuid';

import Button from '../Button';
import { FormInput, FormTextarea } from '../FormElements';
import Icon from '../Icon';
import Track from '../Track';

import './styles.scss';

const maxButtons = parseInt((import.meta.env.REACT_APP_MULTI_CHOICE_QUESTION_MAX_BUTTONS as string) ?? '4');

export interface MultiChoiceQuestionContentProps {
  question: string;
  buttons: { id: string; title: string; payload: string }[];
  setQuestion: (q: string) => void;
  setButtons: (b: { id: string; title: string; payload: string }[]) => void;
  setIsSaveEnabled: (b: boolean) => void;
}

const MultiChoiceQuestionContent: FC<MultiChoiceQuestionContentProps> = ({
  question,
  buttons,
  setQuestion,
  setButtons,
  setIsSaveEnabled,
}) => {
  const { t } = useTranslation();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const node = useServiceStore((state) => state.selectedNode);
  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const selectedService = useServiceListStore((state) => state.selectedService);

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(buttons[idx].title);
  };

  const handleEditSave = (idx: number) => {
    const currentTitles = buttons.map((btn) => btn.title);
    if (currentTitles.includes(editValue) || editValue === '') {
      setEditIndex(null);
      setEditValue('');
      return;
    }
    const newButtons = [...buttons];
    newButtons[idx] = { ...newButtons[idx], title: editValue };
    setButtons(newButtons);
    setEditIndex(null);
    setEditValue('');
    setIsSaveEnabled(newButtons.length > 1 && newButtons.every((btn) => btn.title.length > 0));
  };

  const handleDelete = (idx: number) => {
    const newButtons = buttons.filter((_, i) => i !== idx);
    setButtons(newButtons);
    if (editIndex === idx) {
      setEditIndex(null);
      setEditValue('');
    }
    setIsSaveEnabled(newButtons.length > 1 && newButtons.every((btn) => btn.title.length > 0));
  };

  const handleAdd = () => {
    const newButtons = [
      ...buttons,
      {
        id: crypto.randomUUID(),
        title: '',
        payload: `#service, /${selectedService?.type ?? 'POST'}/services/active/${serviceName}_mcq_${
          node?.data.label[node?.data.label.length - 1]
        }_${buttons.length}`,
      },
    ];
    setButtons(newButtons);
    setIsSaveEnabled(false);
  };

  return (
    <Track direction="vertical" align="stretch" style={{ width: '100%', padding: 16 }}>
      <div>
        <FormTextarea
          label=""
          placeholder={t('serviceFlow.multiChoiceQuestion.questionPlaceholder')!}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setIsSaveEnabled(buttons.length > 1);
          }}
          style={{ resize: 'none', width: '100%' }}
          maxRows={5}
          minRows={2}
          hideLabel
        />
        {!question.length && (
          <FormError style={{ marginTop: 2 }}>{t('serviceFlow.multiChoiceQuestion.questionError')}</FormError>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 500 }}>{t('serviceFlow.multiChoiceQuestion.userChoices')}</div>
        <Track direction="vertical" gap={8} style={{ marginTop: 8 }}>
          {buttons.map((btn, idx) => (
            <Track key={v4()} gap={8} align="center" style={{ width: '100%' }}>
              {editIndex === idx ? (
                <>
                  <FormInput
                    name={`button-title-${idx}`}
                    label=""
                    placeholder={t('serviceFlow.multiChoiceQuestion.ellipsis')!}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(idx);
                      if (e.key === 'Escape') setEditIndex(null);
                    }}
                    style={{ minWidth: 120, flex: 1 }}
                    hideLabel
                  />
                  <Button appearance="icon" size="s" onClick={() => handleEditSave(idx)} aria-label={t('global.save')!}>
                    <Icon icon={<MdCheck />} size="medium" />
                  </Button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      minWidth: 120,
                      flex: 1,
                    }}
                  >
                    <Button disabled className="multiple-choice-question-button">
                      {btn.title.length > 0 ? btn.title : t('serviceFlow.multiChoiceQuestion.ellipsis')}
                    </Button>
                  </div>
                  <Button
                    appearance="icon"
                    size="s"
                    onClick={() => handleEdit(idx)}
                    aria-label={t('serviceFlow.multiChoiceQuestion.edit')!}
                  >
                    <Icon icon={<MdEdit />} size="medium" />
                  </Button>
                </>
              )}
              <Button
                appearance="icon"
                size="s"
                onClick={() => handleDelete(idx)}
                aria-label={t('serviceFlow.multiChoiceQuestion.delete')!}
              >
                <Icon icon={<MdDeleteOutline />} size="medium" />
              </Button>
            </Track>
          ))}
        </Track>
        <Track gap={8} style={{ marginTop: 12 }}>
          <Button
            appearance="secondary"
            onClick={handleAdd}
            disabled={buttons.length >= maxButtons}
            aria-label={t('serviceFlow.multiChoiceQuestion.addButton')!}
          >
            {t('serviceFlow.multiChoiceQuestion.addButton')}
          </Button>
        </Track>
        {buttons.length >= maxButtons && (
          <FormError style={{ marginTop: 2 }}>
            {t('serviceFlow.multiChoiceQuestion.maxButtonsStart')}
            {maxButtons}
            {t('serviceFlow.multiChoiceQuestion.maxButtonsEnd')}
          </FormError>
        )}
        {buttons.length < 2 && (
          <FormError style={{ marginTop: 2 }}>{t('serviceFlow.multiChoiceQuestion.minButtons')}</FormError>
        )}
      </div>
    </Track>
  );
};

export default MultiChoiceQuestionContent;
