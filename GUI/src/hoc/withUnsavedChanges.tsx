import { ComponentType, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface WithUnsavedChangesProps {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  showConfirmation: boolean;
  proceedNavigation: () => void;
  cancelNavigation: () => void;
  handleNavigationAttempt: (to: string) => boolean;
  handleProgrammaticNavigation: (to: string) => boolean;
}

function withUnsavedChanges<P extends object>(
  WrappedComponent: ComponentType<P & WithUnsavedChangesProps>
): ComponentType<P> {
  return function WithUnsavedChangesWrapper(props: P) {
    const navigate = useNavigate();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [nextLocation, setNextLocation] = useState<string | null>(null);

    const handleBeforeUnload = useCallback(
      (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
        }
      },
      [hasUnsavedChanges]
    );

    const handleNavigationAttempt = useCallback(
      (to: string) => {
        if (hasUnsavedChanges) {
          setNextLocation(to);
          return false;
        }
        return true;
      },
      [hasUnsavedChanges]
    );

    useEffect(() => {
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [handleBeforeUnload]);

    const handleProgrammaticNavigation = useCallback(
      (to: string) => {
        if (hasUnsavedChanges) {
          setNextLocation(to);
          return false;
        }
        navigate(to);
        return true;
      },
      [hasUnsavedChanges, navigate]
    );

    const proceedNavigation = useCallback(() => {
      setHasUnsavedChanges(false);
      if (nextLocation) {
        navigate(nextLocation);
      }
      setNextLocation(null);
    }, [nextLocation, navigate]);

    const cancelNavigation = useCallback(() => {
      setNextLocation(null);
    }, []);

    return (
      <WrappedComponent
        {...props}
        hasUnsavedChanges={hasUnsavedChanges}
        setHasUnsavedChanges={setHasUnsavedChanges}
        showConfirmation={!!nextLocation}
        proceedNavigation={proceedNavigation}
        cancelNavigation={cancelNavigation}
        handleNavigationAttempt={handleNavigationAttempt}
        handleProgrammaticNavigation={handleProgrammaticNavigation}
      />
    );
  };
}

export default withUnsavedChanges;
