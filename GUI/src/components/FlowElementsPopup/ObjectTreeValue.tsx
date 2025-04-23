import { FC } from "react";
import { KeyPath } from "react-json-tree";
import { useTranslation } from "react-i18next";
import { getKeyPathString } from "utils/object-util";
import "./styles.scss";

const round = (n: number) => {
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

interface ObjectTreeValueProps {
  rawValue: unknown;
  keyPath: KeyPath;
  roundedValues: Map<string, number>;
  setRoundedValues: React.Dispatch<React.SetStateAction<Map<string, number>>>;
}

export const ObjectTreeValue: FC<ObjectTreeValueProps> = ({ rawValue, keyPath, roundedValues, setRoundedValues }) => {
  const { t } = useTranslation();
  const key = getKeyPathString(keyPath);

  const toggleRounding = (keyPath: KeyPath, value: number, roundValue = true) => {
    const key = getKeyPathString(keyPath);

    setRoundedValues((prev) => {
      const newMap = new Map(prev);
      if (roundValue) {
        newMap.set(key, round(value));
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
  };

  if (typeof rawValue === "number" && !Number.isInteger(rawValue)) {
    return (
      <span className="object-tree-checkbox">
        <input
          id={key}
          type="checkbox"
          onClick={(e) => toggleRounding(keyPath, rawValue, (e.target as HTMLInputElement).checked)}
        />
        <label htmlFor={key}>{t("serviceFlow.popup.round")}</label>
        <span>{roundedValues.has(key) ? round(rawValue) : rawValue}</span>
      </span>
    );
  }

  return <span>{String(rawValue)}</span>;
};
