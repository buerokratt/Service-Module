import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Icon from 'components/Icon';
import Track from 'components/Track';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import './Dropdown.scss';

type DropdownProps = PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  title?: string;
  onClose?: () => void;
  centered?: boolean;
}>;

const Dropdown: FC<DropdownProps> = ({ open, onOpenChange, trigger, title, children, onClose, centered }) => {
  if (centered) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-backdrop" />
          <Dialog.Content className="dropdown dropdown--center">
            <Track className="dropdown__header" gap={8} justify="between" align="center">
              <Dialog.Title className="dropdown__title">{title}</Dialog.Title>
              <button onClick={onClose}>
                <Icon icon={<MdOutlineClose size={20} />} size="medium" />
              </button>
            </Track>
            <div className="dropdown__content">{children}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  } else {
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
  }
};

export default Dropdown;
