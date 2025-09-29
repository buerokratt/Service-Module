import { Button, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';

interface LassoSelectionControlsProps {
  isLassoActive: boolean;
  onToggleLasso: () => void;
}

const LassoSelectionControls: FC<LassoSelectionControlsProps> = ({ isLassoActive, onToggleLasso }) => {
  const { t } = useTranslation();

  return (
    <Track style={{ gap: 8 }} align="center" justify="start">
      <Button onClick={onToggleLasso} size="s" appearance={isLassoActive ? 'primary' : 'secondary'}>
        {isLassoActive ? t('flow.disableLasso') : t('flow.enableLasso')}
      </Button>
    </Track>
  );
};

export default LassoSelectionControls;
