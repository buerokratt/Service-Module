import { Row } from "@tanstack/react-table";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormInput } from "../../../..";
import { RequestVariablesTableColumns } from "../../../../../types/request-variables";

type VariableCellProps = {
  row: Row<RequestVariablesTableColumns>;
  updateRowVariable: (id: string, variable: string) => void;
  variable: string;
  onValueChange: (rowId: string, value: string) => void;
};

const VariableCell: React.FC<VariableCellProps> = ({ row, updateRowVariable, variable, onValueChange }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(variable);

  if (!row.original) return <></>;
  return row.original.isNameEditable ? (
    <FormInput
      style={{ borderRadius: "4px" }}
      name={`endpoint-variable-${row.id}`}
      label=""
      onChange={(e) => {
        onValueChange(row.id, e.target.value);
        setInputValue(e.target.value);
        updateRowVariable(row.id, e.target.value);
      }}
      value={inputValue}
      placeholder={t("newService.endpoint.variable") + ".."}
    />
  ) : (
    <p style={{ paddingLeft: 40 * row.original.nestedLevel }}>
      {row.original.variable}
      {row.original.type && `, (${row.original.type})`}
      {row.original.description && `, (${row.original.description})`}
    </p>
  );
};

export default VariableCell;
