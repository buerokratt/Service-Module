import Track from 'components/Track';
import { FC } from 'react';

interface DateTimeBuilderProps {
  border: string;
}

const DateTimeBuilder: FC<DateTimeBuilderProps> = ({ border: _border }) => {
  return (
    <Track direction="vertical" align="stretch">
      TEST
    </Track>
  );
};

export default DateTimeBuilder;
