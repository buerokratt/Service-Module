import { Row } from "@tanstack/react-table";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormAutocomplete } from "../../../..";
import { RequestVariablesRowData, RequestVariablesTableColumns } from "../../../../../types/request-variables";

type ValueCellProps = {
  row: Row<RequestVariablesTableColumns>;
  value: string;
  rowData?: RequestVariablesRowData;
  updateRowValue: (id: string, value: string) => void;
  onValueChange: (rowId: string, value: string) => void;
};

const ValueCell: React.FC<ValueCellProps> = ({ row, updateRowValue, rowData, value, onValueChange }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value);

  if (!rowData) return <></>;
  if (rowData.type === "schema" || (rowData.type === "array" && rowData.arrayType === "schema")) return <></>;
  return (
    <div>
      <FormAutocomplete
        placeholder={t("global.choose")}
        data={[]}
        value={inputValue}
        onChange={(v: string) => {
          onValueChange(row.id, v);
          setInputValue(v);
        }}
        onSelected={(v) => {
          setInputValue(v);
          updateRowValue(row.id, v);
        }}
        excludeCharacters={new RegExp(/[{}]/)}
      />
    </div>
  );
};

export default ValueCell;
