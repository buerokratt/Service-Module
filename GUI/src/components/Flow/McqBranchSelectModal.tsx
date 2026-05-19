import { Button, Modal, Track } from 'components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { McqEmptyBranch } from 'utils/mcq-flow-utils';

import '../FlowElementsPopup/styles.scss';
import './McqBranchSelectModal.scss';

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
      <Track direction="vertical" gap={8} align="left" style={{ marginTop: 16, width: '100%' }}>
        {emptyBranches.map((branch) => (
          <Button key={branch.edgeId} className="mcq-branch-select-modal__button" onClick={() => onSelect(branch)}>
            <span className="multiple-choice-question-button__text">{branch.label}</span>
          </Button>
        ))}
      </Track>
    </Modal>
  );
};

export default McqBranchSelectModal;
