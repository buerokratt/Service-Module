import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Assign } from '../../../types/assign';

interface UseAssignBuilderProps {
  onChange: (group: Assign[]) => void;
  seedGroup: Assign[];
}

export const createNewElement = () => {
  return {
    id: uuidv4(),
    key: '',
    value: '',
  };
};

export const useAssignBuilder = ({ seedGroup, onChange }: UseAssignBuilderProps) => {
  const [elements, setElements] = useState<Assign[]>(seedGroup);

  useEffect(() => {
    onChange(elements);
  }, [elements, onChange]);

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
