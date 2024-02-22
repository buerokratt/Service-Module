import { useEffect, useState } from "react";
import { Group, GroupOrRule, GroupType, Rule, getInitialGroup, getInitialRule } from "./types";

interface UseRuleBuilderProps {
  group?: Group;
  root?: boolean;
  onChange: (group: Group) => void;
  seedGroup?: any;
}

export const useRuleBuilder = (config: UseRuleBuilderProps) => {
  const elementsInitialValue = config.root ? (config.seedGroup?.children ?? []) : config.group!.children;
  const groupInfoInitialValue = config.root ? (config.seedGroup?.length > 0 ? config.seedGroup: getInitialGroup()) : config.group!
  const [elements, setElements] = useState<GroupOrRule[]>(elementsInitialValue);
  const [groupInfo, setGroupInfo] = useState<Group>(groupInfoInitialValue);

  useEffect(() => {
    config.onChange({
      ...groupInfo,
      children: elements
    })
  }, [elements, groupInfo]);

  const addRule = () => {
    setElements([...elements, getInitialRule()]);
  }

  const addGroup = () => {
    setElements([...elements, getInitialGroup()]);
  }

  const remove = (id: string) => {
    setElements(elements.filter(x => x.id !== id));
  }

  const toggleNot = () => {
    setGroupInfo({
      ...groupInfo,
      not: !groupInfo.not,
    });
  }

  const changeType = (type: GroupType) => () => {
    setGroupInfo({ ...groupInfo, type });
  }

  const changeToAnd = changeType('and');
  const changeToOr = changeType('or');

  const changeRule = (rule: Rule) => setElementById(rule.id, rule);
  
  const onSubGroupChange = (parentId: string) => (rule: any) => setElementById(parentId, rule);

  const setElementById = (id: string, element: GroupOrRule) => {
    const newElements = elements.map(x => x.id === id ? { ...element } : x);
    setElements(newElements);
  }

  return { 
    groupInfo, 
    elements, 
    addRule, 
    addGroup, 
    remove, 
    toggleNot, 
    changeToAnd, 
    changeToOr, 
    changeRule,
    onSubGroupChange,
  };
}
