import { nanoid } from '@reduxjs/toolkit'
import { ReduxActionStep, StepReducer } from '../../types/reducers'
import { DropType } from '../../types/reducers'
import { STEP_ACTIONS } from '../actions/steps'

const initialState: StepReducer = {
  steps: [],
}

const stepState = (state = initialState, action: ReduxActionStep<any>): StepReducer => {
  switch (action.type) {
    case STEP_ACTIONS.ADD_STEP:
      return addStep(state, action.payload)
    case STEP_ACTIONS.DELETE:
      return deleteItem(state, action.payload)
    case STEP_ACTIONS.CHANGE_TITLE:
      return changeStepTitle(state, action.payload)
    case STEP_ACTIONS.CHANGE_TEXT_CONTENT:
      return changeTextStepContent(state, action.payload)
    case STEP_ACTIONS.ADD_CONDITION:
      return addCondition(state, action.payload)
    default:
      return state
  }
}

export default stepState

function addStep(state: StepReducer, payload: { stepType: DropType, conditionId?: string }): StepReducer {
  if (!payload.conditionId) {
    if (payload.stepType === 'rule')
      return { ...state }
    return {
      ...state,
      steps: [
        ...state?.steps,
        {
          id: nanoid(),
          type: payload.stepType,
          text: payload.stepType === 'text-space' ? 'Some text from redux' : undefined,
          title: payload.stepType === 'switch' ? 'Switch case' : undefined,
          conditions: payload.stepType === 'switch' ? [] : undefined,
        },
      ]
    }
  }

  const alreadyContainsRule = state.steps
    .filter(x => x.conditions?.filter(y => y.id === payload.conditionId)
      .filter(y => y.steps.findIndex((z: any) => z.type === 'rule') !== -1)
      .length ?? 0 > 0
    )
    .length > 0

  if (payload.stepType === 'rule' && alreadyContainsRule) {
    alert('can\'t have more than one rule inside condition');
    return { ...state }
  }
  if (payload.stepType !== 'rule' && payload.stepType !== 'text-space')
    return { ...state }

  return {
    ...state,
    steps: [
      ...state?.steps.map(x => ({
        ...x,
        conditions: x.conditions?.map(y => {
          if (y.id !== payload.conditionId)
            return y
          return {
            ...y,
            steps: [
              ...y.steps,
              {
                id: nanoid(),
                type: payload.stepType,
                text: payload.stepType === 'text-space' ? 'Some text from redux' : undefined,
              },
            ]
          }
        })
      })),
    ]
  }
}

function deleteItem(state: StepReducer, id: string): StepReducer {
  return {
    ...state,
    steps: state?.steps.filter(x => x.id !== id)
      .map(x => ({
        ...x,
        conditions: x.conditions?.filter(y => y.id !== id)
          .map(y => ({
            ...y,
            steps: y.steps.filter(z => z.id !== id)
          }))
      })),
  }
}

function changeStepTitle(state: StepReducer, { id, title }: { id: string, title: string }): StepReducer {
  return {
    ...state,
    steps: state?.steps.map(x => {
      if (x.id !== id)
        return x;

      return {
        ...x,
        title,
      }
    }),
  }
}

function changeTextStepContent(state: StepReducer, { id, text }: { id: string, text: string }): StepReducer {
  return {
    ...state,
    steps: state?.steps.map(x => {
      if (x.id === id)
        return { ...x, text, }
      return {
        ...x,
        conditions: x.conditions?.map(y => ({
          ...y,
          steps: y.steps.map(z => {
            if (z.id === id)
              return { ...z, text, }
            return z
          })
        }))
      }
    })
  }
}

function addCondition(state: StepReducer, parentId: string): StepReducer {
  return {
    ...state,
    steps: state?.steps.map(x => {
      if (x.id !== parentId)
        return x;

      return {
        ...x,
        conditions: [
          ...x.conditions ?? [],
          { id: nanoid(), steps: [] }
        ],
      }
    }),
  }
}

