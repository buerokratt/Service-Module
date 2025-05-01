import { FC, PropsWithChildren, ReactNode, useState } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

import "./Tooltip.scss";

type TooltipProps = {
  content: ReactNode;
  onButtonClick?: () => void;
};

const Tooltip: FC<PropsWithChildren<TooltipProps>> = ({ content, children, onButtonClick }) => {
  const [open, setOpen] = useState(false);
  return (
    <RadixTooltip.Provider delayDuration={100}>
      <RadixTooltip.Root open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger asChild>
          <button
            style={{ display: "inline-flex" }}
            onClick={() => {
              setOpen(true);
              onButtonClick?.();
            }}
          >
            {children}
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="tooltip">
            {content}
            <RadixTooltip.Arrow className="tooltip__arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
