import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useCallback, useEffect } from 'react';
import useServiceStore from 'store/new-services.store';
import { MdUndo, MdRedo } from 'react-icons/md';

const UndoRedoControls: FC = () => {
  const { t } = useTranslation();
  const { undo, redo, canUndo, canRedo } = useServiceStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey && canUndo()) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'y' || (event.key === 'z' && event.shiftKey)) && canRedo()) {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  return (
    <Track style={{ gap: 8 }} align="center" justify="start">
      <Button
        onClick={handleUndo}
        size="s"
        disabled={!canUndo()}
        style={{
          backgroundColor: canUndo() ? '#308653' : '#ccc',
        }}
        title={t('global.undo').toString()}
      >
        <Icon icon={<MdUndo />} />
        {t('global.undo')}
      </Button>
      <Button
        onClick={handleRedo}
        size="s"
        disabled={!canRedo()}
        style={{
          backgroundColor: canRedo() ? '#308653' : '#ccc',
        }}
        title={t('global.redo').toString()}
      >
        <Icon icon={<MdRedo />} />
        {t('global.redo')}
      </Button>
    </Track>
  );
};

export default UndoRedoControls;
