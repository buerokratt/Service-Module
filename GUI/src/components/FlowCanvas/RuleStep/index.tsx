import React from 'react'
import { useDispatch } from 'react-redux'
import { changeTextStepContentAction } from '../../../store/actions/steps'
import { StepType } from '../../../types/reducers'
import Track from '../../Track'
import StepDev from '../StepDev'
import './styles.scss'

interface RuleStepProps {
  step: StepType,
}

const RuleStep: React.FC<RuleStepProps> = ({ step }) => {
  const dispatch = useDispatch()

  const handleRuleTextChange = (e: any) => {
    dispatch(changeTextStepContentAction({ text: e.target.value, id: step.id }))
  }

  return (
    <Track align='right'>
      <StepDev>Rule Definition</StepDev>
      <input
        type='text'
        value={step.text}
        onChange={handleRuleTextChange}
        className='text-input'
      />
    </Track>
  )
}

export default RuleStep
