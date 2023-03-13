import React from 'react'
import { useDrop } from 'react-dnd'
import { useDispatch } from 'react-redux'
import { addStepAction } from '../../../store/actions/steps'
import { StepType } from '../../../types/reducers'
import Track from '../../Track'
import DeleteButton from '../DeleteButton'
import RuleStep from '../RuleStep'
import TextSpace from '../TextSpace'
import './styles.scss'

interface SwitchStepBodyProps {
  steps: StepType[],
  conditionId: string,
}

const SwitchStepBody: React.FC<SwitchStepBodyProps> = ({ steps, conditionId }) => {
  const dispatch = useDispatch()
  const [_, drop] = useDrop(
    () => ({
      accept: 'card',
      drop(_item: any, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) return;
        dispatch(addStepAction({ stepType: _item.dropType, conditionId }))
      },
    }),
    [steps],
  )

  return (
    <div ref={drop} className='switch-body'>
      {steps.map((x: any, index: number) =>
        <Track key={x.id} direction='horizontal'>
          <Track direction='vertical'>
            {index}.
            <DeleteButton id={x.id} />
          </Track>
          <Track className='switch-body-content'>
            {x.type === 'text-space' && <TextSpace step={x} />}
            {x.type === 'rule' && <RuleStep step={x} />}
          </Track>
        </Track>
      )}
    </div>
  )
}

export default SwitchStepBody
