import { useEffect, useState } from "react";
import { Assign, getInitialElement, AssignGroup } from "./assign-types";

interface UseAssignBuilderProps {
  group?: AssignGroup;
  root?: boolean;
  onChange: (group: AssignGroup) => void;
  seedGroup?: any;
}

export const useAssignBuilder = (config: UseAssignBuilderProps) => {
  const elementsInitialValue = config.root ? (config.seedGroup?.children ?? []) : config.group!.children;
  const seedGroup = config.seedGroup?.length > 0 || config.seedGroup?.children?.length ? config.seedGroup : getInitialElement();
  const groupInfoInitialValue = config.root ? seedGroup : config.group!
  const [elements, setElements] = useState<Assign[]>(elementsInitialValue);
  const [groupInfo, setGroupInfo] = useState<AssignGroup>(groupInfoInitialValue);

  useEffect(() => {
    config.onChange({
      ...groupInfo,
      children: elements
    })
  }, [elements, groupInfo]);

  const addElement = () => {
    console.log('addElement');
    setElements([...elements, getInitialElement()]);
  }

  const remove = (id: string) => {
    setElements(elements.filter(x => x.id !== id));
  }

  const changeElement = (element: Assign) => setElementById(element.id, element);
  
  const onSubGroupChange = (parentId: string) => (rule: any) => setElementById(parentId, rule);

  const setElementById = (id: string, element: Assign) => {
    const newElements = elements.map((x) => (x.id === id ? { ...element } : x));
    setElements(newElements);
  };

  return {
    // groupInfo,
    elements,
    addElement,
    remove,
    changeElement,
    onSubGroupChange,
  };
}
