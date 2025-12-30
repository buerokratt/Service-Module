import { t } from "i18next";
import { useCallback, ChangeEvent } from "react";
import useToastStore from "store/toasts.store";
import { FlowData } from "types/service-flow";

export const importServices = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
}
