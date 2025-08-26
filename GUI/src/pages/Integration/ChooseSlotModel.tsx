import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import { Dialog, FormSelect, Track } from 'components';
import { useQuery } from '@tanstack/react-query';
import { getSlots } from 'resources/api-constants';
import api from 'services/api';

type ChooseSlotModelProps = {
  onModalClose: (selection?: string) => void;
};

const ChooseSlotModel: FC<ChooseSlotModelProps> = ({ onModalClose }) => {
  const { t } = useTranslation();
  const { data: slots } = useQuery<string[]>({
    queryKey: ['slots'],
    queryFn: async () => {
      try {
        const res = await api.get(getSlots());
        return res.data.response ?? [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });
  const slot = useServiceStore((state) => state.slot);

  return (
    <Dialog title={'slots'} onClose={onModalClose} size="large">
      {!slots && (
        <Track justify="center" gap={16} direction="vertical">
          <div className="loader" style={{ marginTop: 10 }} />
        </Track>
      )}
      {slots && slots.length === 0 && (
        <Track justify="center" gap={16} direction="vertical">
          <label style={{ margin: 30 }}>{t('overview.popup.noSlotsAvailable')}</label>
        </Track>
      )}
      {slots && slots.length > 0 && (
        <div>
          <FormSelect
            name="slot"
            label=""
            isOpen={true}
            menuPosition="relative"
            options={[{ label: t('global.none'), value: '' }].concat(
              slots?.map((slot) => ({ label: slot, value: slot })) ?? [],
            )}
            onSelectionChange={(selection) => {
              useServiceStore.getState().setSlot(selection?.value ?? '');
              onModalClose(selection?.value);
            }}
            defaultValue={slot}
          />
        </div>
      )}
    </Dialog>
  );
};

export default ChooseSlotModel;
