import React, { FC, HTMLAttributes, PropsWithChildren } from 'react';

type TrackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right' | 'stretch';
  justify?: 'start' | 'between' | 'center' | 'around' | 'end';
  direction?: 'horizontal' | 'vertical';
  isMultiline?: boolean;
  isFlex?: boolean;
  isAlignItems?: boolean;
};

const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  stretch: 'stretch',
};

const justifyMap = {
  start: 'flex-start',
  between: 'space-between',
  center: 'center',
  around: 'space-around',
  end: 'flex-end',
};

const Track: FC<PropsWithChildren<TrackProps>> = ({
  gap = 0,
  align = 'center',
  justify = 'start',
  direction = 'horizontal',
  isMultiline = false,
  isFlex = false,
  isAlignItems = true,
  flex = 1,
  children,
  style,
  ...rest
}) => {
  return (
    <div
      className="track"
      style={{
        display: 'flex',
        gap,
        alignItems: isAlignItems === true ? alignMap[align] : undefined,
        justifyContent: justifyMap[justify],
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flex: isFlex === true ? flex : undefined,
        flexWrap: isMultiline ? 'wrap' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Track;
