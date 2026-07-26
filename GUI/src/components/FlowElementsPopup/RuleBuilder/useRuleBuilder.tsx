import { useEffect, useRef, useState } from 'react';

import { getInitialGroup, getInitialRule, Group, GroupOrRule, GroupType, Rule, withMigratedConnectors } from './types';

type SeedGroup = Group | GroupOrRule[] | undefined;

interface UseRuleBuilderProps {
  group?: Group;
  root?: boolean;
  onChange: (group: Group) => void;
  seedGroup?: Group | GroupOrRule[];
}

export const useRuleBuilder = (config: UseRuleBuilderProps) => {
  const getSeedGroupChildren = (seedGroup: SeedGroup): GroupOrRule[] => {
    if (!seedGroup) return [];
    if (Array.isArray(seedGroup)) return seedGroup;
    return seedGroup.children;
  };

  const getSeedGroupLegacyType = (seedGroup: SeedGroup): GroupType | undefined =>
    seedGroup && !Array.isArray(seedGroup) ? seedGroup.type : undefined;

  const elementsInitialValue = withMigratedConnectors(
    config.root ? getSeedGroupChildren(config.seedGroup) : config.group!.children,
    config.root ? getSeedGroupLegacyType(config.seedGroup) : config.group!.type,
  );

  const isSeedGroupValid = (seedGroup: SeedGroup): boolean => {
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
    if (config.root || !config.group) return;
    setGroupInfo((prev) => ({
      ...prev,
      connector: config.group!.connector,
      connectorNot: config.group!.connectorNot,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.group?.connector, config.group?.connectorNot]);

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

  const changeConnector = (id: string, connector: GroupType) => {
    setElements(elements.map((x) => (x.id === id ? { ...x, connector } : x)));
  };

  const toggleConnectorNot = (id: string) => {
    setElements(elements.map((x) => (x.id === id ? { ...x, connectorNot: !x.connectorNot } : x)));
  };

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
    changeConnector,
    toggleConnectorNot,
    changeRule,
    onSubGroupChange,
  };
};
