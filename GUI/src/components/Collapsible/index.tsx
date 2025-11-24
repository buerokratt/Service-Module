import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { CSSProperties, FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdOutlineAddBox, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { CgChevronDown, CgChevronUp } from 'react-icons/cg';

import { Icon, Track } from '../';

import './Collapsible.scss';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  onAddClick?: () => void;
  onStateChange?: (open: boolean) => void;
  headerDivider?: boolean;
  headerColor?: string;
  headerBackgroundColor?: string;
  appearance?: 'normal' | 'button';
};

const Collapsible: FC<PropsWithChildren<CollapsibleProps>> = ({
  defaultOpen = false,
  title,
  contentStyle,
  onAddClick,
  onStateChange,
  headerDivider,
  appearance = 'button',
  headerColor,
  style,
  headerBackgroundColor,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { t } = useTranslation();

  return (
    <RadixCollapsible.Root
      className="collapsible"
      open={open}
      style={style}
      onOpenChange={(open) => {
        setOpen(open);
        if (onStateChange) {
          onStateChange(open);
        }
      }}
    >
      <RadixCollapsible.Trigger
        asChild
        className="collapsible__trigger"
        style={{
          borderBottom: headerDivider === false ? 'none' : undefined,
          height: appearance === 'button' ? undefined : '50px',
          backgroundColor: headerBackgroundColor,
        }}
      >
        {appearance === 'normal' ? (
          <div className="collapsible__header">
            <Track justify="between" align="center" gap={8} style={{ width: '100%' }}>
              <h5 style={{ color: headerColor }}>{title}</h5>
              <Icon
                icon={open ? <CgChevronUp color={headerColor} /> : <CgChevronDown color={headerColor} />}
                size="medium"
              />
            </Track>
          </div>
        ) : (
          <Track justify="between">
            <button className="collapsible__button">
              <Icon icon={open ? <MdOutlineIndeterminateCheckBox /> : <MdOutlineAddBox />} size="medium" />
              <h3 className="h6" style={{ color: headerColor }}>
                {title}
              </h3>
            </button>
            {onAddClick && (
              <button
                onClick={(e) => {
                  onAddClick();
                  e.stopPropagation();
                }}
              >
                <Icon icon={<MdAdd color="#757575" />} size="medium" />
              </button>
            )}
          </Track>
        )}
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="collapsible__content" style={contentStyle}>
        {children || (
          <Track align="center" justify="center">
            <span style={{ fontWeight: '500' }}>{t('newService.noElementsAvailable')}</span>
          </Track>
        )}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
};

export default Collapsible;
