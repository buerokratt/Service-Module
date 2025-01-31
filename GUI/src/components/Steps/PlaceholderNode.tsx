import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position } from 'reactflow';

const PlaceholderNode: FC = (props: any) => {
  const { t } = useTranslation();

  const label = props?.data.label;

  const { data, isConnectable, id } = props;
  const shouldOffsetHandles = data.childrenCount > 1;
  const handleOffset = 25;
  let offsetLeft = handleOffset * Math.floor(data.childrenCount / 2);
  if (data.childrenCount % 2 === 0) offsetLeft -= handleOffset / 2;


  const bottomHandles = (): JSX.Element => {
    return (
      <>
        {new Array(data.childrenCount).fill(0).map((_, i) => (
          <Handle
            key={`handle-${id}-${i}`}
            id={`handle-${id}-${i}`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={shouldOffsetHandles ? { marginLeft: -offsetLeft + i * handleOffset } : {}}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <p style={{ textAlign: "center" }}>{label ? t(label) : t("serviceFlow.placeholderNode")}</p>
      {bottomHandles()}
    </>
  );
};

export default PlaceholderNode;
