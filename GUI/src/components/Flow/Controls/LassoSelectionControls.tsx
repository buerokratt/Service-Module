import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useEffect } from 'react';
import { MdDraw } from 'react-icons/md';

interface LassoSelectionControlsProps {
  isLassoActive: boolean;
  onToggleLasso: () => void;
}

const LassoSelectionControls: FC<LassoSelectionControlsProps> = ({ isLassoActive, onToggleLasso }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onToggleLasso();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Track style={{ gap: 8 }} align="center" justify="start">
      <Button onClick={onToggleLasso} size="s" appearance={isLassoActive ? 'primary' : 'secondary'}>
        <Icon icon={<MdDraw />} size="small" label={t('serviceFlow.lasso')} />
        {t('serviceFlow.lasso')}
      </Button>
    </Track>
  );
};

export default LassoSelectionControls;
