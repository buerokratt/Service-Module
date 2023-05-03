
export type DropType = 'switch' | 'text-space' | 'auth' | 'rule';

export interface ConditionType {
    id: string,
    steps: FlowStepType[],
}

export interface FlowStepType {
    id: string,
    type: DropType,
    text?: string,
    title?: string,
    conditions?: ConditionType[],
}

export interface StepReducer {
    steps: FlowStepType[]
}

export interface RootReducer {
    stepReducer: StepReducer,
}

export type ReduxActionStep<T> = {
    type: any
    payload?: T
}

export type ReduxAction<T> = (data: T) => ReduxActionStep<T>
