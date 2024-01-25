import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { MdDeleteOutline, MdOutlineEdit } from 'react-icons/md';

import { Button, DataTable, Dialog, FormInput, FormSelect, Icon, Track } from '../../../components';
import { addRegex, deleteRegex } from '../../../services/regex';
import { Entity } from '../../../types/entity';
import { getEntities } from '../../../services/entities';
import { getRegexes } from '../../../services/regex';
import { RegexTeaser } from '../../../types/regexTeaser';
import useToastStore from 'store/toasts.store';

const Regex: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [deletableRow, setDeletableRow] = useState<string | number | null>(null);
  const { data: regexList } = useQuery<RegexTeaser[]>({
    queryKey: ['regex'],
    queryFn: getRegexes
  });
  const { data: entities } = useQuery<Entity[]>({
    queryKey: ['entities'],
    queryFn: getEntities
  });
  const { control, handleSubmit } = useForm<{ name: string }>();

  const newRegexMutation = useMutation({
    mutationFn: (data: { name: string }) => addRegex(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['regex']);
      setAddFormVisible(false);
      useToastStore.getState().success({
        title: t('intents.notification'),
        message: 'New regex added',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t("newService.toast.failed"),
        message: t("global.errorMessage"),
      });
    },
    onSettled: () => setAddFormVisible(false),
  });

  const availableEntities = useMemo(() => entities?.filter((e) => {
    return regexList?.some((r) => r.name !== e.name);
  }).map((e) => ({ label: e.name, value: String(e.id) })), [entities, regexList]);

  const regexDeleteMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) => deleteRegex(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['regex']);
      useToastStore.getState().success({
        title: t('intents.notification'),
        message: 'REGEX deleted',
      });
    },
    onError: (error: AxiosError) => {
      useToastStore.getState().error({
        title: t("newService.toast.failed"),
        message: t("global.errorMessage"),
      });
    },
    onSettled: () => setDeletableRow(null),
  });

  const columnHelper = createColumnHelper<RegexTeaser>();

  const regexColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: t('intents.regex') || '',
    }),
    columnHelper.display({
      header: '',
      cell: (props) => (
        <Button appearance='text'
          onClick={() => window.location.href = `http://localhost:3001/treening/treening/teemade-jareltreenimine/regex/${props.row.original.id}`}>
          <Icon
            label={t('intents.edit')}
            icon={<MdOutlineEdit color={'rgba(0,0,0,0.54)'} />}
          />
          {t('intents.edit')}
        </Button>
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
  ], [columnHelper, t]);

  const handleNewRegexSubmit = handleSubmit((data) => {
    newRegexMutation.mutate(data);
  });

  return (
    <>
      <div className='vertical-tabs__content-header'>
        <Track gap={8} direction='vertical' align='stretch'>
          <Track gap={16}>
            <FormInput
              label={t('intents.search')}
              name='searchRegex'
              placeholder={t('intents.search') + '...'}
              hideLabel
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={() => setAddFormVisible(true)}>{t('intents.add')}</Button>
          </Track>
          {addFormVisible && (
            <Track gap={16}>
              <div style={{ flex: 1 }}>
                <Controller name='name' control={control} render={({ field }) => (
                  <FormSelect
                    {...field}
                    label={t('intents.entity')}
                    hideLabel
                    options={availableEntities || []}
                  />
                )} />
              </div>
              <Track gap={16}>
                <Button appearance='secondary' onClick={() => setAddFormVisible(false)}>{t('intents.cancel')}</Button>
                <Button onClick={handleNewRegexSubmit}>{t('intents.save')}</Button>
              </Track>
            </Track>
          )}
        </Track>
      </div>
      <div className='vertical-tabs__content'>
        {regexList && (
          <DataTable
            data={regexList}
            columns={regexColumns}
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
                onClick={() => regexDeleteMutation.mutate({ id: deletableRow })}
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

export default Regex;
