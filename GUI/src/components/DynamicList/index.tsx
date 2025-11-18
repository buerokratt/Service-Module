import {FC} from "react";
import {FormInput, Icon} from "../index";
import {LuMinus, LuPlus} from "react-icons/lu";
import "./DynamicList.scss";
import {InfoTooltip} from "../InfoTooltip";
import {useTranslation} from "react-i18next";

type DynamicListProps = {
    label: string;
    labelWidth?: number;
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
    tooltipText?: string;
};

const DynamicList: FC<DynamicListProps> = ({label, labelWidth = 120 ,value, onChange, placeholder, tooltipText}) => {
    const {t} = useTranslation();
    const items = value.length > 0 ? value : [""];

    const addItem = () => {
        onChange([...items, ""]);
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onChange(updated.length === 0 ? [""] : updated);
    };

    const updateItem = (index: number, val: string) => {
        const updated = [...items];
        updated[index] = val;

        const clean = updated.filter((x, i) => x.trim() !== "" || i === updated.length - 1);
        onChange(clean);
    };

    return (
        <div style={{width: "100%"}}>
            {items.map((value, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "8px",
                        width: "100%",
                    }}
                >
                    {index === 0 ? (
                        <label
                            style={{
                                width: labelWidth,
                            }}
                        >
                            {label} :
                        </label>
                    ) : (
                        <div style={{width: labelWidth}}/>
                    )}

                    <div className="input__wrapper">
                        <FormInput
                            name={value + index}
                            defaultValue={value}
                            onChange={(e) => {
                                updateItem(index, e.target.value)
                            }}
                            placeholder={index === 0 ? t(placeholder ?? '').toString() : ""}
                        />
                    </div>

                    {index === items.length - 1 && (
                        <button
                            type="button"
                            onClick={addItem}
                            className={"control-button"}
                        >
                            <Icon icon={<LuPlus size={16}/>}/>
                        </button>
                    )}

                    {index > 0 && (
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className={"control-button"}
                        >
                            <Icon icon={<LuMinus size={16}/>}/>
                        </button>
                    )}

                    {index === 0 && (
                        <InfoTooltip name={tooltipText ?? ''}/>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DynamicList;