import { FC } from "react";
import { AiOutlineExclamation } from "react-icons/ai";
import Icon from "../Icon";

import './ExclamationBadge.scss';

const ExclamationBadge: FC = () => {
  return (
    <span className="badge__rounded">
      <Icon className="icon" icon={<AiOutlineExclamation />} size="medium" />
    </span>
  );
};

export default ExclamationBadge;
