import React from 'react'
import { useDrag } from 'react-dnd'
import { DropType } from '../../../types/reducers'
import './styles.scss'

interface StepDevProps {
  color?: string,
  onClick?: any,
  draggable?: boolean,
  dropType?: DropType,
  children?: any,
}

const StepDev: React.FC<StepDevProps> = ({
  children,
  color = '#0005',
  onClick = null,
  draggable = false,
  dropType = 'other',
}) => {

  const [, drag] = useDrag(() => ({
    type: 'card',
    item: { dropType },
  }))

  return <div
    ref={draggable ? drag : null}
    onClick={onClick}
    className='draggable-item'
    style={{ backgroundColor: color }}
  >
    {children}
  </div>
}

export default StepDev
