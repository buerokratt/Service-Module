import React from "react"
import { useDrag } from "react-dnd"
import './styles.scss'

interface VariableAsTagProps {
  value: any
  color: 'yellow' | 'green'
}

const VariableAsTag: React.FC<VariableAsTagProps> = ({ value, color }) => {
  const [, drag] = useDrag(() => ({
    type: 'tags',
    item: { value },
  }))

  return <span ref={drag} className={`${color}-tag`}>
    {value}
  </span>
}

export default VariableAsTag
