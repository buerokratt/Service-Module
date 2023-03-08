import React, { useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { addStepAction, deleteItemAction, changeStepTitleAction, changeTextStepContentAction, addConditionAction } from '../../store/actions/steps'
import { RootReducer, StepType } from '../../types/reducers'

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
        <div
            ref={drop}
            style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#00000005',
                minHeight: '80vh',
                minWidth: '30vw'
            }}
        >
            {steps?.map((x, index) =>
                <div
                    key={x.id}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {index}.

                        <button
                            style={{ color: 'red' }}
                            onClick={() => dispatch(deleteItemAction(x.id))}
                        >
                            delete
                        </button>
                    </div>
                    <div style={{ minWidth: '30vw' }}>
                        {x.type === 'text-space' && <TextSpace step={x} />}
                        {x.type === 'switch' && <SwitchStep step={x} />}
                        {x.type === 'auth' && <StepDev>TARA authorization</StepDev>}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FlowCanvas

const TextSpace: React.FC<any> = ({ step: { id, text } }) => {
    const dispatch = useDispatch()
    return <>
        <StepDev>Text space</StepDev>
        <input
            type='text'
            value={text}
            onChange={e => dispatch(changeTextStepContentAction({ id, text: e.target.value }))}
            style={{
                minHeight: '40px',
                width: '29vw',
                backgroundColor: '#fff',
                margin: '.5rem',
                marginTop: '0',
                borderRadius: '.5rem',
                border: '1px solid black',
                padding: '.75rem'
            }}
        />
    </>
}

const StepDev: React.FC<any> = ({ children, color = '#0005', onClick = null, draggable = false, dropType = 'other' }) => {
    const [, drag] = useDrag(() => ({
        type: 'card',
        item: { dropType },
    }))

    return <div
        ref={draggable ? drag : null}
        style={{
            minHeight: '40px',
            margin: '.5rem',
            borderRadius: '.5rem',
            userSelect: 'none',
            padding: '.75rem',
            backgroundColor: color,
        }}
        onClick={onClick}
    >
        {children}
    </div>
}


const SwitchStep = ({ step }: { step: StepType }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false)

    const titleElement = <input
        onClick={e => e.stopPropagation()}
        style={{ background: 'unset', color: open ? '#000' : '#fff' }}
        type='text'
        value={step.title}
        onChange={e => dispatch(changeStepTitleAction({ id: step.id, title: e.target.value }))}
    />

    if (!open) {
        return <StepDev
            color='#015aa3'
            onClick={() => setOpen(true)}
        >
            {titleElement}
        </StepDev>
    }

    return <StepDev
        color='#cfd4da'
        onClick={() => setOpen(false)}
    >
        {titleElement}
        <div onClick={e => e.stopPropagation()}>
            {step.conditions?.map((x, index) => (
                <div key={x.id}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        {
                            index >= 1 &&
                            <span>Condition {index + 1}</span>
                        }
                        <button
                            style={{ color: 'red' }}
                            onClick={() => dispatch(deleteItemAction(x.id))}
                        >
                            delete
                        </button>
                    </div>
                    <SwitchStepBody steps={x.steps} conditionId={x.id} />
                </div>
            ))}

            <button onClick={() => dispatch(addConditionAction(step.id))}>
                Add a condition +
            </button>
        </div>
    </StepDev>
}


const SwitchStepBody: React.FC<any> = ({ steps, conditionId, }) => {
    const dispatch = useDispatch()
    const [_, drop] = useDrop(
        () => ({
            accept: 'card',
            drop(_item: any, monitor) {
                const didDrop = monitor.didDrop()
                if (didDrop)
                    return;
                dispatch(addStepAction({ stepType: _item.dropType, conditionId }))
            },
        }),
        [steps],
    )

    return (
        <div
            ref={drop}
            style={{
                minHeight: '40px',
                margin: '.5rem',
                borderRadius: '.5rem',
                userSelect: 'none',
                padding: '.75rem',
                backgroundColor: '#fff',
                border: '1px solid black'
            }}>
            {steps.map((x: any, index: number) =>
                <div
                    key={x.id}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {index}.

                        <button
                            style={{ color: 'red' }}
                            onClick={() => dispatch(deleteItemAction(x.id))}
                        >
                            delete
                        </button>
                    </div>
                    <div style={{ minWidth: '30vw' }}>
                        {x.type === 'text-space' && <TextSpace step={x} />}
                        {x.type === 'rule' && <RuleStep step={x} />}
                    </div>
                </div>
            )}
        </div>
    )
}

const RuleStep: React.FC<any> = ({ step }) => {
    const dispatch = useDispatch()
    return (
        <div style={{ display: 'flex', alignItems: 'center', }}>
            <StepDev>Rule Definition</StepDev>
            <input
                type='text'
                value={step.text}
                onChange={e => dispatch(changeTextStepContentAction({ text: e.target.value, id: step.id }))}
                style={{
                    width: '70%',
                    height: '3rem',
                    backgroundColor: '#fff',
                    marginTop: '0',
                    borderRadius: '.5rem',
                    border: '1px solid black',
                    padding: '.75rem',
                }}
            />
        </div>
    )
}

export const StepTypes = () => {
    return (
        <>
            <StepDev draggable dropType='text-space'>Text Space</StepDev>
            <StepDev draggable dropType='auth'>Auth</StepDev>
            <StepDev draggable dropType='switch'>Switch</StepDev>
            <StepDev draggable dropType='rule'>Switch rule</StepDev>
        </>
    )
}
