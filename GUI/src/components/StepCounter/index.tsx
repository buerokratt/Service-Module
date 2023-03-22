import React, { FC } from "react";
import { Track } from "../../components";
import "./StepCounter.scss";
import Step from "./Step";

const StepCounter: FC = () => {
  return (
    <Track className="step-counter" gap={24}>
      <Step step={1} name={"Treenningmooduli seadistamine"} />
      <Step step={2} name={"Teenuse seadistamine"} isActive />
      <Step step={3} name={"Teenusvoo loomine"} />
    </Track>
  );
};

export default StepCounter;
