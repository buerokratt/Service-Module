import { FC } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import Icon from "../Icon";

import './CheckBadge.scss';

const CheckBadge: FC = () => {
  return (
    <span className="badge__rounded">
      <Icon className="icon" icon={<AiFillCheckCircle color="green" />} size="medium" />
    </span>
  );
};

export default CheckBadge;
