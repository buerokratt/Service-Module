import React, { BaseSyntheticEvent, FC } from "react";
import { Track } from "../..";
import "./HeaderStep.scss";

type HeaderStepProps = {
  step: number;
  name: string;
  activeStep: number;
  onClick?: (e: BaseSyntheticEvent) => void;
};

const Pointer = ({ color = "#c4c5cb" }) => (
  <svg width="19" height="38" viewBox="0 0 19 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.2735 18.7735L0 0.5V37.5L18.2542 20.2066C18.6628 19.8195 18.6715 19.1715 18.2735 18.7735Z"
      fill={color}
    />
  </svg>
);

const HeaderStep: FC<HeaderStepProps> = ({ step, name, activeStep, onClick }) => {
  return (
    <Track style={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <Track
        gap={8}
        className={activeStep === step ? "active-step" : "in-active-step"}
        style={{ padding: 8, height: 38 }}
      >
        <p className={"step-name"} style={{ whiteSpace: "nowrap" }}>
          {name}
        </p>
      </Track>
      <Pointer color={activeStep === step ? "#005aa3" : undefined} />
    </Track>
  );
};

export default HeaderStep;
