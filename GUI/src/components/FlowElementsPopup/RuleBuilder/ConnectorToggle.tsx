import { Track } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GroupType } from './types';

interface ConnectorToggleProps {
  connector: GroupType;
  connectorNot: boolean;
  onChangeConnector: (connector: GroupType) => void;
  onToggleNot: () => void;
}

const ConnectorToggle: React.FC<ConnectorToggleProps> = ({
  connector,
  connectorNot,
  onChangeConnector,
  onToggleNot,
}) => {
  const { t } = useTranslation();

  const notButtonClassName = connectorNot ? 'rule-red' : 'rule-gray';
  const andButtonClassName = connector === 'and' ? 'rule-green' : 'rule-gray';
  const orButtonClassName = connector === 'or' ? 'rule-green' : 'rule-gray';

  return (
    <Track>
      <button className={`small-rule-group-button ${notButtonClassName}`} onClick={onToggleNot}>
        {t('serviceFlow.popup.not')}
      </button>
      <button className={`small-rule-group-button ${andButtonClassName}`} onClick={() => onChangeConnector('and')}>
        {t('serviceFlow.popup.and')}
      </button>
      <button className={`small-rule-group-button ${orButtonClassName}`} onClick={() => onChangeConnector('or')}>
        {t('serviceFlow.popup.or')}
      </button>
    </Track>
  );
};

export default ConnectorToggle;
