import React, { BaseSyntheticEvent, FC } from "react";
import { Track } from "../..";
import pointer from "../../../assets/images/pointer.svg";
import "./HeaderStep.scss";

type HeaderStepProps = {
  step: number;
  name: string;
  activeStep: number;
  onClick?: (e: BaseSyntheticEvent) => void;
};

const HeaderStep: FC<HeaderStepProps> = ({ step, name, activeStep, onClick }) => {
  return (
    <Track style={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <Track gap={8} className={activeStep === step ? "active-step" : ""} style={{ padding: 8, height: 38 }}>
        <p className="header-step">{step}</p>
        <p className={activeStep === step ? "active-step__name" : ""} style={{ whiteSpace: "nowrap" }}>
          {name}
        </p>
      </Track>
      {activeStep === step && <img alt="" src={pointer} style={{ height: 38 }} />}
    </Track>
  );
};

export default HeaderStep;
