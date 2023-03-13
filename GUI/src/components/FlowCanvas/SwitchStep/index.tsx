import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { changeStepTitleAction, addConditionAction } from "../../../store/actions/steps"
import { StepType } from "../../../types/reducers"
import StepDev from "../StepDev"
import SwitchStepBody from "../SwitchStepBody"
import Track from "../../Track"
import './styles.scss'
import DeleteButton from "../DeleteButton"

interface SwitchStepProps {
  step: StepType,
}

const SwitchStep: React.FC<SwitchStepProps> = ({ step }) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)

  const titleElement = <input
    type='text'
    value={step.title}
    onChange={e => dispatch(changeStepTitleAction({ id: step.id, title: e.target.value }))}
    onClick={e => e.stopPropagation()}
    className={`title-input ${open ? 'opened' : 'closed'}`}
  />

  if (!open) {
    return <StepDev
      color='#015aa3'
      onClick={() => setOpen(true)}
    >
      {titleElement}
    </StepDev>
  }

  return <StepDev
    color='#cfd4da'
    onClick={() => setOpen(false)}
  >
    {titleElement}
    <Track
      direction='vertical'
      align='stretch'
      onClick={e => e.stopPropagation()}
    >
      {step.conditions?.map((x, index) => (
        <Track
          key={x.id}
          direction='vertical'
          justify='between'
          align='stretch'
        >
          <Track direction='horizontal' justify='between'>
            {
              index >= 1 &&
              <span>Condition {index + 1}</span>
            }
            <span />
            <DeleteButton id={x.id} />
          </Track>
          <SwitchStepBody
            steps={x.steps}
            conditionId={x.id}
          />
        </Track>
      ))}

      <button onClick={() => dispatch(addConditionAction(step.id))}>
        Add a condition +
      </button>
    </Track>
  </StepDev>
}

export default SwitchStep
