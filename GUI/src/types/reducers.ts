
export type DropType = 'switch' | 'text-space' | 'auth' | 'rule';

export interface ConditionType {
    id: string,
    steps: StepType[],
}

export interface StepType {
    id: string,
    type: DropType,
    text?: string,
    title?: string,
    conditions?: ConditionType[],
}

export interface StepReducer {
    steps: StepType[]
}

export interface RootReducer {
    stepReducer: StepReducer,
}

export type ReduxActionStep<T> = {
    type: any
    payload?: T
}

export type ReduxAction<T> = (data: T) => ReduxActionStep<T>
