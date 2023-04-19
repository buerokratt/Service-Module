import React from "react"
import { useDrag } from "react-dnd"
import './styles.scss'

interface VariableAsTagProps {
  value: any
}

const VariableAsTag: React.FC<VariableAsTagProps> = ({ value }) => {
  const [, drag] = useDrag(() => ({
    type: 'tags',
    item: { value },
  }))

  return <span ref={drag} className='yellow-tag'>
    {value}
  </span>
}

export default VariableAsTag
