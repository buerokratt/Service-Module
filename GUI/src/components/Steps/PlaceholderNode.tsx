import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position } from 'reactflow';

const PlaceholderNode: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Handle
        type='target'
        position={Position.Top}
      />
      <p style={{ textAlign: 'center' }}>{t('serviceFlow.placeholderNode')}</p>
    </>
  );
};

export default PlaceholderNode;
