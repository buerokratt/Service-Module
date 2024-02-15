import React, { FC, PropsWithChildren, ReactNode, useState } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

import "./Tooltip.scss";

type TooltipProps = {
  content: ReactNode;
};

const Tooltip: FC<PropsWithChildren<TooltipProps>> = ({ content, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <RadixTooltip.Provider delayDuration={100}>
      <RadixTooltip.Root open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger asChild>
          <div style={{ display: "inline-flex" }} onClick={() => setOpen(true)}>
            {children}
          </div>
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
