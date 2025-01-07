import { useEffect, useState } from "react";
import { Assign, getInitialElement } from "./assign-types";

interface UseAssignBuilderProps {
  assignElements?: Assign[];
  root?: boolean;
  onChange: (group: Assign[]) => void;
  seedGroup?: any;
}

export const useAssignBuilder = (config: UseAssignBuilderProps) => {
  const elementsInitialValue = config.root ? config.seedGroup ?? [] : config.assignElements!;
  const [elements, setElements] = useState<Assign[]>(elementsInitialValue ?? []);

  useEffect(() => {
    config.onChange(elements)
  }, [elements]);

  const addElement = () => {
    setElements([...elements, getInitialElement()]);
  }

  const remove = (id: string) => {
    setElements(elements.filter(x => x.id !== id));
  }

  const changeElement = (element: Assign) => setElementById(element.id, element);
  
  const setElementById = (id: string, element: Assign) => {
    const newElements = elements.map((x) => (x.id === id ? { ...element } : x));
    setElements(newElements);
  };

  return {
    elements,
    addElement,
    remove,
    changeElement,
  };
}
