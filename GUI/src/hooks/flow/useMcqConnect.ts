import { Connection, useReactFlow } from '@xyflow/react';
import { useCallback, useState } from 'react';
import useServiceStore from 'store/new-services.store';
import {
  applyMcqBranchConnection,
  applySimpleConnection,
  getEmptyMcqBranches,
  getMcqNodeIdFromConnection,
  McqEmptyBranch,
} from 'utils/mcq-flow-utils';

export type PendingMcqConnection = {
  readonly connection: Connection;
  readonly emptyBranches: McqEmptyBranch[];
};

function useMcqConnect() {
  const { getNodes, getEdges, setNodes, setEdges, getNode } = useReactFlow();
  const saveToHistory = useServiceStore((state) => state.saveToHistory);
  const setHasUnsavedChanges = useServiceStore((state) => state.setHasUnsavedChanges);
  const [pendingConnection, setPendingConnection] = useState<PendingMcqConnection | null>(null);

  const commitConnection = useCallback(
    (nodes: ReturnType<typeof getNodes>, edges: ReturnType<typeof getEdges>) => {
      setNodes(nodes);
      setEdges(edges);
      setHasUnsavedChanges(true);
      saveToHistory({ nodes, edges });
    },
    [saveToHistory, setEdges, setHasUnsavedChanges, setNodes],
  );

  const applyMcqOutgoingConnection = useCallback(
    (connection: Connection, branch: McqEmptyBranch) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const nodes = getNodes();
      const edges = getEdges();
      const result = applyMcqBranchConnection({
        nodes,
        edges,
        mcqId: source,
        targetId: target,
        branch,
      });
      commitConnection(result.nodes, result.edges);
    },
    [commitConnection, getEdges, getNodes],
  );

  const applyMcqIncomingConnection = useCallback(
    (connection: Connection) => {
      const nodes = getNodes();
      const edges = getEdges();
      const result = applySimpleConnection({ nodes, edges, connection });
      commitConnection(result.nodes, result.edges);
    },
    [commitConnection, getEdges, getNodes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const mcqId = getMcqNodeIdFromConnection(connection, getNode);
      if (!mcqId) return false;

      if (connection.target === mcqId) {
        applyMcqIncomingConnection(connection);
        return true;
      }

      const nodes = getNodes();
      const edges = getEdges();
      const emptyBranches = getEmptyMcqBranches(mcqId, nodes, edges);
      if (emptyBranches.length === 0) return true;

      if (emptyBranches.length === 1) {
        applyMcqOutgoingConnection(connection, emptyBranches[0]);
      } else {
        setPendingConnection({ connection, emptyBranches });
      }
      return true;
    },
    [applyMcqIncomingConnection, applyMcqOutgoingConnection, getEdges, getNode, getNodes],
  );

  const confirmBranch = useCallback(
    (branch: McqEmptyBranch) => {
      if (!pendingConnection) return;
      applyMcqOutgoingConnection(pendingConnection.connection, branch);
      setPendingConnection(null);
    },
    [applyMcqOutgoingConnection, pendingConnection],
  );

  const cancelBranchSelection = useCallback(() => {
    setPendingConnection(null);
  }, []);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return false;

      const mcqId = getMcqNodeIdFromConnection(connection, getNode);
      if (!mcqId) return true;

      if (connection.source === mcqId) {
        return getEmptyMcqBranches(mcqId, getNodes(), getEdges()).length > 0;
      }

      return true;
    },
    [getEdges, getNode, getNodes],
  );

  return {
    pendingConnection,
    handleConnect,
    isValidConnection,
    confirmBranch,
    cancelBranchSelection,
  };
}

export default useMcqConnect;
