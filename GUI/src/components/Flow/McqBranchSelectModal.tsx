import { Button, Modal, Track } from 'components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { McqEmptyBranch } from 'utils/mcq-flow-utils';

type McqBranchSelectModalProps = {
  emptyBranches: McqEmptyBranch[];
  onSelect: (branch: McqEmptyBranch) => void;
  onClose: () => void;
};

const McqBranchSelectModal: FC<McqBranchSelectModalProps> = ({ emptyBranches, onSelect, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t('serviceFlow.mcq.selectBranchTitle')} onClose={onClose}>
      <p>{t('serviceFlow.mcq.emptyBranchesMessage', { count: emptyBranches.length })}</p>
      <Track direction="vertical" gap={8} style={{ marginTop: 16 }}>
        {emptyBranches.map((branch) => (
          <Button key={branch.edgeId} onClick={() => onSelect(branch)}>
            {branch.label}
          </Button>
        ))}
      </Track>
    </Modal>
  );
};

export default McqBranchSelectModal;
