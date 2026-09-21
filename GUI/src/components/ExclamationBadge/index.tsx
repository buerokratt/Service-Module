import { FC } from 'react';
import { AiOutlineExclamation } from 'react-icons/ai';

import Icon from '../Icon';

import './ExclamationBadge.scss';

interface ExclamationBadgeProps {
  color?: 'red' | 'purple';
  title?: string;
}

const ExclamationBadge: FC<ExclamationBadgeProps> = ({ color = 'red', title }) => {
  return (
    <span className={`badge__rounded badge__${color}`} title={title}>
      <Icon className="icon" icon={<AiOutlineExclamation />} size="medium" />
    </span>
  );
};

export default ExclamationBadge;
