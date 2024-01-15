import { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import {
  MdAddCircle,
  MdDeleteOutline,
  MdOutlineArrowBack,
  MdOutlineModeEditOutline,
  MdOutlineSave,
} from 'react-icons/md';

import { Button, Card, DataTable, Dialog, FormInput, FormSelect, FormTextarea, Icon, Track } from '../../../components';
import useDocumentEscapeListener from '../../../hooks/useDocumentEscapeListener';
import { addRegexExample, deleteRegex, deleteRegexExample, editRegex, editRegexExample } from '../../../services/regex';
import { Entity } from '../../../types/entity';
import useToastStore from 'store/toasts.store';

type Regex = {
  readonly id: number;
  name: string;
  examples: string[];
  modifiedAt: Date | string;
}

const RegexDetail: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const newExampleRef = useRef<HTMLTextAreaElement>(null);
  const [exampleText, setExampleText] = useState<string>('');
  const [editingRegexTitle, setEditingRegexTitle] = useState<string | null>(null);
  const [editableRow, setEditableRow] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(null);
  const [deletableRegex, setDeletableRegex] = useState<string | number | null>(null);
  const { data: regex } = useQuery<Regex>({
    queryKey: [`regex/${id}`],
    enabled: !!id,
  });
  const { data: entities } = useQuery<Entity[]>({
    queryKey: ['entities'],
  });

  useDocumentEscapeListener(() => {
    setEditableRow(null);
    setEditingRegexTitle(null);
    setEditableRow(null);
  });

  const regexData = useMemo(
    () => regex && regex.examples.map((e, index) => ({ id: index, value: e })),
    [regex],
  );

  const regexEditMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: { name: string } }) => editRegex(id, data),
    onSuccess: () => {
      useToastStore.getState().success({
        title: t('global.notification'),
        message: 'New regex example added',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setEditingRegexTitle(null),
  });

  const regexDeleteMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteRegex(id),
    onSuccess: () => {
      useToastStore.getState().success({
        title: t('global.notification'),
        message: 'Regex deleted',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setDeletableRegex(null),
  });

  const regexExampleAddMutation = useMutation({
    mutationFn: (data: { example: string }) => addRegexExample(data),
    onSuccess: () => {
      useToastStore.getState().success({
        title: t('global.notification'),
        message: 'Example added',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setDeletableRow(null),
  });

  const regexExampleDeleteMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteRegexExample(id),
    onSuccess: () => {
      useToastStore.getState().success({
        title: t('global.notification'),
        message: 'Example deleted',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setDeletableRow(null),
  });

  const regexExampleEditMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: { example: string } }) => editRegexExample(id, data),
    onSuccess: () => {
      useToastStore.getState().success({
        title: t('global.notification'),
        message: 'Example changed',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t('global.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setEditableRow(null),
  });

  const columnHelper = createColumnHelper<{ id: number; value: string }>();

  const handleEditableRow = (example: { id: number; value: string }) => {
    setEditableRow(example);
  };

  const handleNewExampleSubmit = () => {
    if (!newExampleRef.current) return;
    regexExampleAddMutation.mutate({ example: newExampleRef.current.value });
    newExampleRef.current.value = '';
    setExampleText('');
  };

  const regexColumns = useMemo(() => [
    columnHelper.accessor('value', {
      header: t('training.intents.examples') || '',
      cell: (props) => (
        editableRow && editableRow.id === props.row.original.id ? (
          <FormInput
            name={`example-${props.row.original.id}`}
            label=''
            defaultValue={editableRow.value}
            hideLabel
          />
        ) : props.getValue()
      ),
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <>
          {editableRow && editableRow.id === props.row.original.id ? (
            <Button appearance='text' onClick={() => regexExampleEditMutation.mutate({
              id: props.row.original.id,
              data: { example: props.row.original.value },
            })}>
              <Icon
                label={t('global.save')}
                icon={<MdOutlineSave color={'rgba(0,0,0,0.54)'} />}
              />
              {t('global.save')}
            </Button>
          ) : (
            <Button
              appearance='text'
              onClick={() => handleEditableRow(props.row.original)}
            >
              <Icon
                label={t('global.edit')}
                icon={<MdOutlineModeEditOutline color={'rgba(0,0,0,0.54)'} />}
              />
              {t('global.edit')}
            </Button>
          )}
        </>
      ),
      id: 'edit',
      meta: {
        size: '1%',
      },
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <Button appearance='text' onClick={() => setDeletableRow(props.row.original.id)}>
          <Icon
            label={t('global.delete')}
            icon={<MdDeleteOutline color={'rgba(0,0,0,0.54)'} />}
          />
          {t('global.delete')}
        </Button>
      ),
      id: 'delete',
      meta: {
        size: '1%',
      },
    }),
  ], [columnHelper, editableRow, t]);

  const handleRegexExamplesUpload = (regexId: string | number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.click();
  };

  const handleRegexExamplesDownload = (regexId: string | number) => {
    // TODO
  };

  return (
    <>
      <Track gap={16}>
        <Button appearance='icon' onClick={() => navigate('/treening/treening/teemade-jareltreenimine?tab=regex')}>
          <MdOutlineArrowBack />
        </Button>
        <h1>{t('training.intents.regex')}</h1>
      </Track>

      {regex && (
        <Card
          header={
            <Track direction='vertical' align='stretch' gap={8}>
              <Track justify='between'>
                <Track gap={16}>
                  {editingRegexTitle ? (
                    <FormSelect
                      name='intentTitle'
                      label={t('training.intents.regexExampleTitle')}
                      hideLabel
                      options={entities?.map((e) => ({ label: e.name, value: e.name })) || []}
                      defaultValue={regex.name}
                      style={{ minWidth: 400 }}
                    />
                  ) : (
                    <h3>{regex.name}</h3>
                  )}
                  {editingRegexTitle ? (
                    <Button
                      appearance='text'
                      onClick={() =>
                        regexEditMutation.mutate({ id: regex.id, data: { name: editingRegexTitle } })
                      }
                    >
                      <Icon icon={<MdOutlineSave />} />
                      {t('global.save')}
                    </Button>
                  ) : (
                    <Button
                      appearance='text'
                      onClick={() =>
                        setEditingRegexTitle(regex.name)
                      }
                    >
                      <Icon icon={<MdOutlineModeEditOutline />} />
                      {t('global.edit')}
                    </Button>
                  )}
                </Track>
                <p style={{ color: '#4D4F5D' }}>
                  {`${t('global.modifiedAt')} ${format(
                    new Date(regex.modifiedAt),
                    'dd.MM.yyyy',
                  )}`}
                </p>
              </Track>
              <Track justify='end' gap={8}>
                <Button
                  appearance='secondary'
                  onClick={() =>
                    handleRegexExamplesUpload(regex.id)
                  }
                >
                  {t('training.intents.upload')}
                </Button>
                <Button
                  appearance='secondary'
                  onClick={() =>
                    handleRegexExamplesDownload(regex.id)
                  }
                >
                  {t('training.intents.download')}
                </Button>
                <Button
                  appearance='error'
                  onClick={() => setDeletableRegex(regex.id)}
                >
                  {t('global.delete')}
                </Button>
              </Track>
            </Track>
          }
        >
          <DataTable
            data={regexData}
            columns={regexColumns}
            tableBodyPrefix={
              <tr>
                <td>
                  <FormTextarea
                    ref={newExampleRef}
                    label={t('global.addNew')}
                    name='newExample'
                    minRows={1}
                    placeholder={t('global.addNew') + '...' || ''}
                    hideLabel
                    onChange={(e) => setExampleText(e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    appearance='text'
                    onClick={handleNewExampleSubmit}
                    disabled={exampleText.length === 0}
                  >
                    <Icon icon={<MdAddCircle color={'rgba(0,0,0,0.54)'} />} />
                    {t('global.add')}
                  </Button>
                </td>
                <td></td>
              </tr>
            }
          />
        </Card>
      )}

      {deletableRegex !== null && (
        <Dialog
          title={t('training.intents.deleteRegex')}
          onClose={() => setDeletableRegex(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setDeletableRegex(null)}>{t('global.no')}</Button>
              <Button
                appearance='error'
                onClick={() => regexDeleteMutation.mutate({ id: deletableRegex })}
              >
                {t('global.yes')}
              </Button>
            </>
          }
        >
          <p>{t('global.removeValidation')}</p>
        </Dialog>
      )}

      {deletableRow !== null && (
        <Dialog
          title={t('training.intents.deleteRegexExample')}
          onClose={() => setDeletableRow(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setDeletableRow(null)}>{t('global.no')}</Button>
              <Button
                appearance='error'
                onClick={() => regexExampleDeleteMutation.mutate({ id: deletableRow })}
              >
                {t('global.yes')}
              </Button>
            </>
          }
        >
          <p>{t('global.removeValidation')}</p>
        </Dialog>
      )}
    </>
  );
};

export default RegexDetail;
