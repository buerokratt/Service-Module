import { Button, Icon, Track } from 'components';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDraw } from 'react-icons/md';

interface LassoSelectionControlsProps {
  isLassoActive: boolean;
  onToggleLasso: () => void;
}

const LassoSelectionControls: FC<LassoSelectionControlsProps> = ({ isLassoActive, onToggleLasso }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
      const isDialogOpen =
        target.closest('[role="dialog"], [role="alertdialog"]') ||
        document.querySelector('[role="dialog"]:not([aria-hidden="true"])');

      if (isEditable || isDialogOpen) return;

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onToggleLasso();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleLasso]);

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
