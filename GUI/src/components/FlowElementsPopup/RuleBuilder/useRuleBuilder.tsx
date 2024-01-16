import React, { useEffect, useState } from "react";
import { Group, GroupType, Rule, getInitialGroup, getInitialRule, RuleGroupBuilderProps } from "./types";

export const useRuleBuilder = (config: RuleGroupBuilderProps) => {
  const [groupInfo, setGroupInfo] = useState<Group>(config.onRemove ? config.group! : getInitialGroup());
  const [elements, setElements] = useState<(Group | Rule)[]>(config.onRemove ? config.group!.children : []);

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

  return { groupInfo, elements, addRule, addGroup, remove, toggleNot, changeToAnd, changeToOr };
}
