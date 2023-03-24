import React from 'react'
import { useDrop } from 'react-dnd'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { addStepAction, deleteItemAction } from '../../../store/actions/steps'
import { RootReducer } from '../../../types/reducers'
import Track from '../../Track'
import DeleteButton from '../DeleteButton'
import StepDev from '../StepDev'
import SwitchStep from '../SwitchStep'
import TextSpace from '../TextSpace'
import './styles.scss'

const FlowCanvas: React.FC = () => {
  const steps = useSelector((state: RootReducer) => state.stepReducer.steps)
  const dispatch = useDispatch()

  const [_, drop] = useDrop(
    () => ({
      accept: 'card',
      drop(_item: any, monitor) {
        const didDrop = monitor.didDrop()
        if (didDrop) return;
        dispatch(addStepAction({ stepType: _item.dropType }))
      },
    }),
    [steps],
  )

  return (
    <div ref={drop} className='canvas-container'>
      {steps?.map((x, index) =>
        <Track key={x.id} direction='horizontal'>
          <Track direction='vertical'>
            {index}.
            <DeleteButton id={x.id} />
          </Track>
          <Track className='canvas' align='stretch' >
            {x.type === 'text-space' && <TextSpace step={x} />}
            {x.type === 'switch' && <SwitchStep step={x} />}
            {x.type === 'auth' && <StepDev>TARA authorization</StepDev>}
          </Track>
        </Track>
      )}
    </div>
  )
}

export default FlowCanvas
