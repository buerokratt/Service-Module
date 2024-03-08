import { FC } from "react";
import { AiOutlineExclamation } from "react-icons/ai";
import Icon from "../Icon";

import './ExclamationBadge.scss';

interface ExclamationBadgeProps { 
  color?: 'red' | 'purple';
}

const ExclamationBadge: FC<ExclamationBadgeProps> = ({ color = 'red' }) => {
  return (
    <span className={`badge__rounded badge__${color}`}>
      <Icon className="icon" icon={<AiOutlineExclamation />} size="medium" />
    </span>
  );
};

export default ExclamationBadge;
