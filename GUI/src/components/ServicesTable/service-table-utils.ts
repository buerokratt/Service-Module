export type StateModalAction = 'activate' | 'draft' | 'ready' | 'deactivate';

const activateConfig = (t: (key: string) => string) => ({
  title: t('overview.popup.setActive'),
  action: 'activate' as const,
  confirmLabel: t('overview.popup.activateService'),
});

export const getStateModalConfig = (
  state: string,
  t: (key: string) => string,
): { title: string; action: StateModalAction; confirmLabel: string } | null => {
  switch (state) {
    case 'ready':
    case 'inactive':
      return activateConfig(t);
    case 'draft':
      return {
        title: t('overview.popup.setToReady'),
        action: 'ready',
        confirmLabel: t('overview.popup.setToReady'),
      };
    case 'active':
      return {
        title: t('overview.popup.setDraft'),
        action: 'draft',
        confirmLabel: t('overview.popup.setToDraft'),
      };
    default:
      return null;
  }
};
