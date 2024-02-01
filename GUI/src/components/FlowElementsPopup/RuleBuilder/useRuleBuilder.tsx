import { useEffect, useState } from "react";
import { Group, GroupType, Rule, getInitialGroup, getInitialRule } from "./types";

interface UseRuleBuilderProps {
  group?: Group;
  root?: boolean;
  onChange: (group: Group) => void;
}

export const useRuleBuilder = (config: UseRuleBuilderProps) => {
  const [groupInfo, setGroupInfo] = useState<Group>(config.root ? getInitialGroup() : config.group!);
  const [elements, setElements] = useState<(Group | Rule)[]>(config.root ? [] : config.group!.children);

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

  const changeRule = (rule: Rule) => {
    setElements(elements.map(x => {
      if (x.id === rule.id) {
        return {...rule};
      }
      return x;
    }));
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
  };
}
