import { useEffect, useRef, useState } from 'react';

import { getInitialGroup, getInitialRule, Group, GroupOrRule, GroupType, Rule } from './types';

interface UseRuleBuilderProps {
  group?: Group;
  root?: boolean;
  onChange: (group: Group) => void;
  seedGroup?: Group | GroupOrRule[];
}

export const useRuleBuilder = (config: UseRuleBuilderProps) => {
  const getSeedGroupChildren = (seedGroup: Group | GroupOrRule[] | undefined): GroupOrRule[] => {
    if (!seedGroup) return [];
    if (Array.isArray(seedGroup)) return seedGroup;
    return seedGroup.children;
  };

  const elementsInitialValue = config.root ? getSeedGroupChildren(config.seedGroup) : config.group!.children;

  const isSeedGroupValid = (seedGroup: Group | GroupOrRule[] | undefined): boolean => {
    if (!seedGroup) return false;
    if (Array.isArray(seedGroup)) return seedGroup.length > 0;
    return seedGroup.children?.length > 0;
  };

  const seedGroup = isSeedGroupValid(config.seedGroup) ? config.seedGroup : getInitialGroup();

  const getGroupInfoInitialValue = (): Group => {
    if (config.root) {
      return Array.isArray(seedGroup) ? getInitialGroup() : seedGroup || getInitialGroup();
    }
    return config.group!;
  };

  const [elements, setElements] = useState<GroupOrRule[]>(elementsInitialValue);
  const [groupInfo, setGroupInfo] = useState<Group>(getGroupInfoInitialValue());

  // Use ref to store the latest onChange function to avoid dependency issues
  // Without this, component crashes completely OR we violate the rules of hooks below
  const onChangeRef = useRef(config.onChange);
  onChangeRef.current = config.onChange;

  useEffect(() => {
    onChangeRef.current({
      ...groupInfo,
      children: elements,
    });
  }, [elements, groupInfo]);

  const addRule = () => {
    setElements([...elements, getInitialRule()]);
  };

  const addGroup = () => {
    setElements([...elements, getInitialGroup()]);
  };

  const remove = (id: string) => {
    setElements(elements.filter((x) => x.id !== id));
  };

  const toggleNot = () => {
    setGroupInfo({
      ...groupInfo,
      not: !groupInfo.not,
    });
  };

  const changeType = (type: GroupType) => () => {
    setGroupInfo({ ...groupInfo, type });
  };

  const changeToAnd = changeType('and');
  const changeToOr = changeType('or');

  const changeRule = (rule: Rule) => setElementById(rule.id, rule);

  const onSubGroupChange = (parentId: string) => (rule: GroupOrRule) => setElementById(parentId, rule);

  const setElementById = (id: string, element: GroupOrRule) => {
    const newElements = elements.map((x) => (x.id === id ? { ...element } : x));
    setElements(newElements);
  };

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
};
