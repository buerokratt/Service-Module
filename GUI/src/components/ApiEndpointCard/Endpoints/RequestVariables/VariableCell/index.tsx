import { Row } from "@tanstack/react-table";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormInput } from "../../../..";
import { RequestVariablesTableColumns, RequestVariablesRowData } from "../../../../../types/request-variables";

type VariableCellProps = {
  row: Row<RequestVariablesTableColumns>;
  updateRowVariable: (id: string, variable: string) => void;
  variable: string;
  rowData?: RequestVariablesRowData;
  onValueChange: (rowId: string, value: string) => void;
};

const VariableCell: React.FC<VariableCellProps> = ({ row, updateRowVariable, rowData, variable, onValueChange }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(variable);

  if (!rowData) return <></>;
  return rowData.isNameEditable ? (
    <FormInput
      style={{ borderRadius: "0 4px 4px 0" }}
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
    <p style={{ paddingLeft: 40 * rowData.nestedLevel }}>
      {rowData.variable}
      {rowData.type && `, (${rowData.type})`}
      {rowData.description && `, (${rowData.description})`}
    </p>
  );
};

export default VariableCell;
