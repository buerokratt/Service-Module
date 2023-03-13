import { ReduxAction } from '../../types/reducers'
import { DropType } from '../../types/reducers'

export enum STEP_ACTIONS {
  ADD_STEP = 'steps/add',
  DELETE = 'steps/delete',
  CHANGE_TITLE = 'steps/title',
  CHANGE_TEXT_CONTENT = 'steps/change/text',
  ADD_CONDITION = 'steps/condition/add',
  DELETE_CONDITION = 'steps/condition/delete',
  // CHANGE_ORDER = 'steps/order',
}

export const addStepAction: ReduxAction<{ stepType: DropType, conditionId?: string }>
  = ({ stepType, conditionId = undefined }) => {
    return {
      type: STEP_ACTIONS.ADD_STEP,
      payload: {
        stepType,
        conditionId,
      }
    }
  }

export const deleteItemAction: ReduxAction<string> = (id: string) => {
  return {
    type: STEP_ACTIONS.DELETE,
    payload: id,
  }
}

export const changeStepTitleAction: ReduxAction<{ id: string, title: string }> = (payload) => {
  return {
    type: STEP_ACTIONS.CHANGE_TITLE,
    payload,
  }
}

export const changeTextStepContentAction: ReduxAction<{ id: string, text: string }> = (payload) => {
  return {
    type: STEP_ACTIONS.CHANGE_TEXT_CONTENT,
    payload,
  }
}

export const addConditionAction: ReduxAction<string> = (parentId) => {
  return {
    type: STEP_ACTIONS.ADD_CONDITION,
    payload: parentId,
  }
}
