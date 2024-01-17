import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { MdDeleteOutline, MdOutlineModeEditOutline, MdOutlineSave } from 'react-icons/md';

import { Button, DataTable, Dialog, FormInput, Icon, Tooltip, Track } from '../../../components';
import { Entity } from '../../../types/entity';
import useDocumentEscapeListener from '../../../hooks/useDocumentEscapeListener';
import { useToast } from '../../../hooks/useToast';
import { getEntities, addEntity, deleteEntity, editEntity } from '../../../services/entities';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Entities: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [editableRow, setEditableRow] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(null);
  const [newEntityFormOpen, setNewEntityFormOpen] = useState(false);
  const { data: entities } = useQuery<Entity[]>({
    queryKey: ['entities'],
    queryFn: getEntities
  });
  const { register, handleSubmit } = useForm<{ name: string }>();

  useDocumentEscapeListener(() => setEditableRow(null));

  const handleEditableRow = (example: { id: number; name: string }) => {
    setEditableRow(example);
  };

  const entityAddMutation = useMutation({
    mutationFn: (data: { name: string }) => addEntity(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['entities']);
      toast.open({
        type: 'success',
        title: t('intents.notification'),
        message: 'New Entity Added',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('intents.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setNewEntityFormOpen(false),
  });

  const entityEditMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: { name: string } }) => editEntity(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['entities']);
      toast.open({
        type: 'success',
        title: t('intents.notification'),
        message: 'Entity changes saved',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('intents.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setEditableRow(null),
  });

  const entityDeleteMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteEntity(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['entities']);
      toast.open({
        type: 'success',
        title: t('intents.notification'),
        message: 'Entity deleted',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('intents.notificationError'),
        message: error.message,
      });
    },
    onSettled: () => setDeletableRow(null),
  });

  const columnHelper = createColumnHelper<Entity>();

  const entitiesColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: t('intents.entities') || '',
      cell: (props) => editableRow && editableRow.id === props.row.original.id ? (
        <FormInput
          name={`entity-${props.row.original.id}`}
          label={t('intents.entity')}
          defaultValue={editableRow.name}
          hideLabel
        />
      ) : props.row.original.relatedIntents ? (
        <Tooltip content={
          <Track direction='vertical' align='left'>
            <strong>{t('intents.title')}</strong>
            {props.row.original.relatedIntents.map((intent) => (
              <Link
                key={intent}
                style={{ color: '#005AA3' }}
                to={intent.startsWith('common')
                  ? `/treening/treening/avalikud-teemad?intent=${intent}#tabs`
                  : `/treening/treening/teemad?intent=${intent}#tabs`
                }
              >
                {intent}
              </Link>
            ))}
          </Track>
        }>
          <span style={{ color: '#005AA3' }}>{props.getValue()}</span>
        </Tooltip>
      ) : props.getValue(),
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <>
          {editableRow && editableRow.id === props.row.original.id ? (
            <Button appearance='text' onClick={() => entityEditMutation.mutate({
              id: props.row.original.id,
              data: { name: props.row.original.name },
            })}>
              <Icon
                label={t('intents.save')}
                icon={<MdOutlineSave color={'rgba(0,0,0,0.54)'} />}
              />
              {t('intents.save')}
            </Button>
          ) : (
            <Button
              appearance='text'
              onClick={() => handleEditableRow(props.row.original)}
            >
              <Icon
                label={t('intents.edit')}
                icon={<MdOutlineModeEditOutline color={'rgba(0,0,0,0.54)'} />}
              />
              {t('intents.edit')}
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
            label={t('intents.delete')}
            icon={<MdDeleteOutline color={'rgba(0,0,0,0.54)'} />}
          />
          {t('intents.delete')}
        </Button>
      ),
      id: 'delete',
      meta: {
        size: '1%',
      },
    }),
  ], [columnHelper, editableRow, entityEditMutation, t]);

  const handleNewEntitySubmit = handleSubmit((data) => {
    entityAddMutation.mutate(data);
  });

  return (
    <>
      <div className='vertical-tabs__content-header'>
        <Track gap={8} direction='vertical' align='stretch'>
          <Track gap={16}>
            <FormInput
              label={t('intents.search')}
              name='searchEntities'
              placeholder={t('intents.search') + '...'}
              hideLabel
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={() => setNewEntityFormOpen(true)}>{t('intents.add')}</Button>
          </Track>
          {newEntityFormOpen && (
            <Track gap={16}>
              <FormInput
                {...register('name')}
                label={t('intents.entityName')}
                placeholder={t('intents.entityName') || ''}
                hideLabel
              />
              <Track gap={16}>
                <Button appearance='secondary' onClick={() => setNewEntityFormOpen(false)}>{t('intents.cancel')}</Button>
                <Button onClick={handleNewEntitySubmit}>{t('intents.save')}</Button>
              </Track>
            </Track>
          )}
        </Track>
      </div>
      <div className='vertical-tabs__content'>
        {entities && (
          <DataTable
            data={entities}
            columns={entitiesColumns}
            globalFilter={filter}
            setGlobalFilter={setFilter}
          />
        )}
      </div>

      {deletableRow !== null && (
        <Dialog
          title={t('intents.delete')}
          onClose={() => setDeletableRow(null)}
          footer={
            <>
              <Button appearance='secondary' onClick={() => setDeletableRow(null)}>{t('intents.no')}</Button>
              <Button
                appearance='error'
                onClick={() => entityDeleteMutation.mutate({ id: deletableRow })}
              >
                {t('intents.yes')}
              </Button>
            </>
          }
        >
          <p>{t('intents.removeValidation')}</p>
        </Dialog>
      )}
    </>
  );
};

export default Entities;
