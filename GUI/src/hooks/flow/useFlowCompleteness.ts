import { useMemo } from 'react';
import useServiceStore from 'store/new-services.store';
import { validateFlowCompleteness } from 'utils/flow-completeness';

export const useFlowCompleteness = () => {
  const nodes = useServiceStore((state) => state.nodes);
  const edges = useServiceStore((state) => state.edges);
  const navigableServices = useServiceStore((state) => state.navigableServices);

  return useMemo(() => validateFlowCompleteness(nodes, edges, navigableServices), [nodes, edges, navigableServices]);
};
