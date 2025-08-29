import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Icon from 'components/Icon';
import Track from 'components/Track';
import { FC, PropsWithChildren } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import './Dropdown.scss';

type DropdownProps = PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  title?: string;
  onClose?: () => void;
}>;

const Dropdown: FC<DropdownProps> = ({ open, onOpenChange, trigger, title, children, onClose }) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown" sideOffset={5}>
          <Track className="dropdown__header" gap={8} justify="between" align="center">
            <DropdownMenu.Label className="dropdown__title">{title}</DropdownMenu.Label>
            <button onClick={onClose}>
              <Icon icon={<MdOutlineClose size={20} />} size="medium" />
            </button>
          </Track>
          <div className="dropdown__content">{children}</div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Dropdown;
