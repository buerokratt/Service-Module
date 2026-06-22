import { Connection, useReactFlow } from '@xyflow/react';
import { useCallback, useState } from 'react';
import useServiceStore from 'store/new-services.store';
import { StepType } from 'types';
import {
  applyConditionBranchConnection,
  conditionHasEmptyBranches,
  getConditionNodeIdFromConnection,
  getEmptyConditionBranches,
} from 'utils/conditional-flow-utils';
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
  readonly nodeType: StepType.MultiChoiceQuestion | StepType.Condition;
};

function useMcqConnect() {
  const { getNodes, getEdges, getNode } = useReactFlow();
  const saveToHistory = useServiceStore((state) => state.saveToHistory);
  const setHasUnsavedChanges = useServiceStore((state) => state.setHasUnsavedChanges);
  const [pendingConnection, setPendingConnection] = useState<PendingMcqConnection | null>(null);

  const commitConnection = useCallback(
    (nodes: ReturnType<typeof getNodes>, edges: ReturnType<typeof getEdges>) => {
      useServiceStore.getState().setNodes(nodes);
      useServiceStore.getState().setEdges(edges);
      setHasUnsavedChanges(true);
      saveToHistory({ nodes, edges });
    },
    [saveToHistory, setHasUnsavedChanges],
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

  const applyConditionOutgoingConnection = useCallback(
    (connection: Connection, branch: McqEmptyBranch) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const nodes = getNodes();
      const edges = getEdges();
      const result = applyConditionBranchConnection({
        nodes,
        edges,
        conditionId: source,
        targetId: target,
        branch,
      });
      commitConnection(result.nodes, result.edges);
    },
    [commitConnection, getEdges, getNodes],
  );

  const applyIncomingConnection = useCallback(
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
      if (mcqId) {
        if (connection.target === mcqId) {
          applyIncomingConnection(connection);
          return true;
        }

        const nodes = getNodes();
        const edges = getEdges();
        const emptyBranches = getEmptyMcqBranches(mcqId, nodes, edges);
        if (emptyBranches.length === 0) return true;

        if (emptyBranches.length === 1) {
          applyMcqOutgoingConnection(connection, emptyBranches[0]);
          return true;
        }
        setPendingConnection({ connection, emptyBranches, nodeType: StepType.MultiChoiceQuestion });
        return true;
      }

      const conditionId = getConditionNodeIdFromConnection(connection, getNode);
      if (conditionId) {
        if (connection.target === conditionId) {
          applyIncomingConnection(connection);
          return true;
        }

        const nodes = getNodes();
        const edges = getEdges();
        const emptyBranches = getEmptyConditionBranches(conditionId, nodes, edges);
        if (emptyBranches.length === 0) return true;

        if (emptyBranches.length === 1) {
          applyConditionOutgoingConnection(connection, emptyBranches[0]);
          return true;
        }
        setPendingConnection({ connection, emptyBranches, nodeType: StepType.Condition });
        return true;
      }

      return false;
    },
    [
      applyIncomingConnection,
      applyMcqOutgoingConnection,
      applyConditionOutgoingConnection,
      getEdges,
      getNode,
      getNodes,
    ],
  );

  const confirmBranch = useCallback(
    (branch: McqEmptyBranch) => {
      if (!pendingConnection) return;
      if (pendingConnection.nodeType === StepType.MultiChoiceQuestion) {
        applyMcqOutgoingConnection(pendingConnection.connection, branch);
      } else {
        applyConditionOutgoingConnection(pendingConnection.connection, branch);
      }
      setPendingConnection(null);
    },
    [applyMcqOutgoingConnection, applyConditionOutgoingConnection, pendingConnection],
  );

  const cancelBranchSelection = useCallback(() => {
    setPendingConnection(null);
  }, []);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return false;

      const mcqId = getMcqNodeIdFromConnection(connection, getNode);
      if (mcqId) {
        if (connection.source === mcqId) {
          return getEmptyMcqBranches(mcqId, getNodes(), getEdges()).length > 0;
        }
        return true;
      }

      const conditionId = getConditionNodeIdFromConnection(connection, getNode);
      if (conditionId) {
        if (connection.source === conditionId) {
          return conditionHasEmptyBranches(conditionId, getNodes(), getEdges());
        }
        return true;
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
