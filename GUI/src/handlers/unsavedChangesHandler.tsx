import { useEffect } from "react";
import useServiceStore from "store/new-services.store";

export function UnsavedChangesHandler() {
  const hasUnsavedChanges = useServiceStore((state) => state.hasUnsavedChanges);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return null;
}
