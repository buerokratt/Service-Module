import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { RootReducer, StepReducer } from '../../types/reducers'
import stepsState from './steps'

const rootReducer = combineReducers({
  stepReducer: stepsState,
})

const store = configureStore<RootReducer>({ reducer: rootReducer })

export { store }
