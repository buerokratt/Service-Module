import { FC } from 'react';

import { AiFillCheckCircle } from 'react-icons/ai';

import '../../styles/settings/variables/_colors.scss';
import { useTheme } from '../../utils/useTheme';
import Icon from '../Icon';
import './CheckBadge.scss';

const CheckBadge: FC = () => {
  const theme = useTheme();

  return (
    <span className="badge__rounded">
      <Icon
        className="icon"
        icon={<AiFillCheckCircle color={theme === 'dark' ? 'var(--veera-color-sea-green-6)' : 'green'} />}
        size="medium"
      />
    </span>
  );
};

export default CheckBadge;
