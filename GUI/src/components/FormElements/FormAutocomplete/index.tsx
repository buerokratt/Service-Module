import { BaseSyntheticEvent, ChangeEvent, FC, useState } from "react";
import "./FormAutocomplete.scss";

type FormAutocompleteProps = {
  placeholder: string;
  value?: string;
  data: string[];
  onSelected?: (v: string) => void;
  onChange?: (v: string) => void;
  autoFocus?: boolean;
  excludeCharacters?: RegExp;
  shouldHideSuggestions?: boolean;
};

const FormAutocomplete: FC<FormAutocompleteProps> = ({
  placeholder,
  data,
  onSelected,
  onChange,
  autoFocus,
  value,
  excludeCharacters,
  shouldHideSuggestions,
}) => {
  const [suggestions, setSugesstions] = useState<string[]>([]);
  const [isHideSuggestions, setIsHideSuggestions] = useState(shouldHideSuggestions);
  const [selectedVal, setSelectedVal] = useState(value ?? "");

  const onKeyUpHandler = (e: BaseSyntheticEvent<KeyboardEvent>) => {
    const value: string = e.target.value;
    const newSuggestions = data.filter((item: string) =>
      item
        .toLocaleLowerCase()
        .replace(excludeCharacters ?? "", "")
        .includes(value.toLocaleLowerCase().replace(excludeCharacters ?? "", ""))
    );
    setSugesstions(newSuggestions);
    setIsHideSuggestions(newSuggestions.length > 0 && newSuggestions[0] === value);
  };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setIsHideSuggestions(false);
    setSelectedVal(input);
  };

  const hideSuggestions = (value: string) => {
    if (onSelected) onSelected(value);
    setSelectedVal(value);
    setIsHideSuggestions(true);
  };

  return (
    <div className="sugesstion-auto">
      <div className="form-control-auto">
        <input
          placeholder={placeholder}
          value={selectedVal}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
            onChangeHandler(e);
          }}
          onKeyUp={onKeyUpHandler}
          autoFocus={autoFocus}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions" style={{ display: isHideSuggestions ? "none" : "block" }}>
          {suggestions.map((item: string, idx: number) => (
            <div key={`${item}-${idx}`} onClick={() => hideSuggestions(item)}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormAutocomplete;
