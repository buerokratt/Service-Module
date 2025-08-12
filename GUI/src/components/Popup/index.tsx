import React, { FC, HTMLAttributes, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { MdOutlineClose, MdOutlineEdit, MdCheck, MdClose } from "react-icons/md";

import { Button, FormInput, Icon, Track } from "..";
import "./Popup.scss";

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  footer?: ReactNode;
  hasDefaultBody?: boolean;
  onClose: () => void;
  onTitleChange?: (newTitle: string) => void;
  onTitleSave?: (newTitle: string) => void;
  onTitleEditCancel?: () => void;
  titleEditable?: boolean;
  titleError?: string;
};

const Popup: FC<PropsWithChildren<DialogProps>> = ({
  title: initialTitle,
  description,
  footer,
  onClose,
  hasDefaultBody = true,
  titleEditable = false,
  onTitleChange,
  onTitleSave,
  onTitleEditCancel,
  titleError,
  children,
  ...rest
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
    setTempTitle(initialTitle);
  }, [initialTitle]);

  const handleTitleEditStart = () => {
    setTempTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTitle(e.target.value);
    onTitleChange?.(e.target.value);
  };

  const handleTitleSave = () => {
    if (!titleError) {
      setIsEditingTitle(false);
      setTitle(tempTitle);
      if (onTitleSave && tempTitle !== title) {
        onTitleSave?.(tempTitle);
      }
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setTempTitle(title);
    onTitleEditCancel?.();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
  };

  const titleRef = useRef<HTMLInputElement>(null);

  return (
    <RadixDialog.Root defaultOpen={true} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="popup__overlay" />
        <RadixDialog.Content
          className="popup"
          aria-describedby={description ? "dialog-description" : undefined}
          {...rest}
        >
          <div className="popup__header">
            <Track style={{ width: "100%" }} justify="between" align="center">
              <Track gap={8} style={{ alignItems: "center" }}>
                {isEditingTitle ? (
                  <Track style={{ alignItems: "center", gap: 8, width: "100%" }}>
                    <div>
                      <FormInput
                        className="h3 popup__title"
                        ref={titleRef}
                        name={""}
                        placeholder={""}
                        value={tempTitle}
                        onKeyDown={handleTitleKeyDown}
                        onChange={handleTitleChange}
                        style={{
                          minWidth: "200px",
                          maxWidth: "200px",
                          backgroundColor: "transparent",
                          border: "none",
                          textOverflow: "ellipsis",
                        }}
                      />
                    </div>
                    <Button appearance="text" onClick={handleTitleSave} style={{ boxShadow: "none" }}>
                      <Icon icon={<MdCheck size={20} color="#308653" />} size="medium" />
                    </Button>
                    <Button appearance="text" onClick={handleTitleCancel} style={{ boxShadow: "none" }}>
                      <Icon icon={<MdClose size={20} color="#D73E3E" />} size="medium" />
                    </Button>
                    {titleEditable && !isEditingTitle && (
                      <Button
                        appearance="text"
                        onClick={() => {
                          titleRef?.current?.focus();
                        }}
                        style={{ boxShadow: "none" }}
                      >
                        <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
                      </Button>
                    )}
                    {titleError && <label style={{ color: "#D73E3E" }}>{titleError}</label>}
                  </Track>
                ) : (
                  <RadixDialog.Title className="h3 popup__title">{title}</RadixDialog.Title>
                )}
                {titleEditable && !isEditingTitle && (
                  <Button
                    className="popup__edit-title"
                    appearance="text"
                    onClick={handleTitleEditStart}
                    style={{ boxShadow: "none" }}
                    aria-label="Edit title"
                  >
                    <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
                  </Button>
                )}
              </Track>
              <RadixDialog.Close asChild>
                <button className="popup__close">
                  <Icon icon={<MdOutlineClose size={23} />} size="medium" />
                </button>
              </RadixDialog.Close>
            </Track>
          </div>
          <div className={hasDefaultBody ? "popup__body" : ""}>{children}</div>
          {footer && (
            <Track className="popup__footer" gap={16} justify="end">
              {footer}
            </Track>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Popup;
