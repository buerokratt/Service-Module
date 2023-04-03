import React from 'react'
import { useDispatch } from 'react-redux'
import { deleteItemAction } from '../../../store/actions/steps'
import './styles.scss'

interface DeleteButtonProps {
  id: string,
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ id }) => {
  const dispatch = useDispatch()

  return (
    <button
      className='remove-button'
      onClick={() => dispatch(deleteItemAction(id))}
    >
      delete
    </button>
  )
}

export default DeleteButton
