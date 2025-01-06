import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position } from 'reactflow';

const PlaceholderNode: FC = (props: any) => {
  const { t } = useTranslation();

  const label = props?.data.label;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <p style={{ textAlign: "center" }}>{label ? t(label) : t("serviceFlow.placeholderNode")}</p>
    </>
  );
};

export default PlaceholderNode;
