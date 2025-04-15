import { useEffect, useState } from "react";
import { Assign } from "./assign-types";
import { v4 as uuidv4 } from "uuid";

interface UseAssignBuilderProps {
  assignElements?: Assign[];
  root?: boolean;
  onChange: (group: Assign[]) => void;
  seedGroup?: any;
}

export const createNewElement = () => {
  return {
    id: uuidv4(),
    key: "",
    value: "",
  };
};

export const useAssignBuilder = (config: UseAssignBuilderProps) => {
  const elementsInitialValue = config.root ? config.seedGroup ?? [] : config.assignElements!;
  const [elements, setElements] = useState<Assign[]>(elementsInitialValue ?? []);

  useEffect(() => {
    console.log("useAssignBuilder useeffect", elements);
    config.onChange(elements);
  }, [elements]);

  const addElement = () => {
    setElements([...elements, createNewElement()]);
  };

  const remove = (id: string) => {
    setElements(elements.filter((x) => x.id !== id));
  };

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
};
