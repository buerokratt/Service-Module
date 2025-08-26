import { FC, PropsWithChildren, useState, CSSProperties } from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { MdAdd, MdOutlineAddBox, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { Icon, Track } from '../';
import './Collapsible.scss';
import { useTranslation } from 'react-i18next';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  contentStyle?: CSSProperties;
  onAddClick?: () => void;
  onStateChange?: (open: boolean) => void;
};

const Collapsible: FC<PropsWithChildren<CollapsibleProps>> = ({
  defaultOpen = false,
  title,
  contentStyle,
  onAddClick,
  onStateChange,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { t } = useTranslation();

  return (
    <RadixCollapsible.Root
      className="collapsible"
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (onStateChange) {
          onStateChange(open);
        }
      }}
    >
      <RadixCollapsible.Trigger style={{ cursor: 'pointer' }} asChild className="collapsible__trigger">
        <Track justify="between">
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon icon={open ? <MdOutlineIndeterminateCheckBox /> : <MdOutlineAddBox />} size="medium" />
            <h3 className="h6">{title}</h3>
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
