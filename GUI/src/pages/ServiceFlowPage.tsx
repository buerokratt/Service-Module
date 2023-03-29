import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  EndpointCustom,
  EndpointOpenAPI,
  FormInput,
  FormSelect,
  FormTextarea,
  Layout,
  NewServiceHeader,
  Track,
} from "../components";
import FlowCanvas from "../components/NewFlowCanvas/FlowCanvas";
import { Option } from "../types/option";

const ServiceFlowPage: React.FC = () => {

  return (
    <>
    <NewServiceHeader activeStep={3} />
      <h1 style={{padding: 16}}>Teenusvoog "Raamatu laenutus"</h1>
      <FlowCanvas></FlowCanvas>
    </>
  );
};

export default ServiceFlowPage;
