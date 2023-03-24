import React from 'react'
import { useDispatch } from 'react-redux'
import { changeTextStepContentAction } from '../../../store/actions/steps';
import { StepType } from '../../../types/reducers';
import Track from '../../Track';
import StepDev from '../StepDev';
import './styles.scss'

interface TextSpaceProps {
  step: StepType
}

const TextSpace: React.FC<TextSpaceProps> = ({ step: { id, text } }) => {
  const dispatch = useDispatch()

  return <Track direction='vertical' className='text-input-container'>
    <StepDev>Text space</StepDev>
    <input
      type='text'
      value={text}
      onChange={e => dispatch(changeTextStepContentAction({ id, text: e.target.value }))}
      className='text-input'
    />
  </Track>
}

export default TextSpace
