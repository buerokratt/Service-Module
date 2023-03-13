import React from 'react'
import StepDev from '../FlowCanvas/StepDev'

const StepTypes: React.FC = () => {
  return (
    <>
      <StepDev draggable dropType='text-space'>Text Space</StepDev>
      <StepDev draggable dropType='auth'>Auth</StepDev>
      <StepDev draggable dropType='switch'>Switch</StepDev>
      <StepDev draggable dropType='rule'>Switch rule</StepDev>
    </>
  )
}

export default StepTypes
