import React, { FC } from "react";
import { Track } from "../..";
import pointer from "../../../assets/images/pointer.svg";
import './Step.scss';

type StepProps = {
  step: number;
  name: string;
  isActive?: boolean;
};

const Step: FC<StepProps> = ({ step, name, isActive }) => {
  return (
    <Track>
      <Track gap={8} className={isActive ? "active-step" : ""} style={{ padding: 8, height: 38 }}>
        <p className="step" >{step}</p>
        <p className={isActive ? "active-step__name" : ""} style={{ whiteSpace: "nowrap" }}>{name}</p>
      </Track>
      {isActive && <img src={pointer} style={{ height: 38 }} />}
    </Track>
  );
};

export default Step;
