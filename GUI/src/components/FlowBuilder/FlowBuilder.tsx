import React, { FC, useCallback } from "react";
import { ReactFlow, Background, Controls, Edge, MiniMap, Node, useReactFlow, addEdge, getConnectedEdges, getIncomers, getOutgoers } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useServiceStore from "store/new-services.store";
import edgeTypes from "components/Flow/EdgeTypes";
import nodeTypes from "components/Flow/NodeTypes";
import useLayout from "hooks/flow/useLayout";

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  nodes,
  edges,
}) => {
  useLayout();
  const { getNode, setEdges } = useReactFlow();
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const getRemainingEdges = (acc: any, connectedEdges: any[]) => {
    return acc.filter((edge: any) => !connectedEdges.includes(edge));
  };

  const createNewEdges = (incomers: any[], outgoers: any[], getNode: Function) => {
    return incomers.flatMap(({ id: source }) =>
      outgoers.map(({ id: target }) => ({
        id: `${source}->${target}`,
        source,
        target,
        type: "step",
        animated: getNode(target)?.type === "ghost",
      }))
    );
  };

  const processDeletedNode = (acc: any, node: any, nodes: any[], edges: any[], getNode: Function) => {
    const incomers = getIncomers(node, nodes, edges);
    const outgoers = getOutgoers(node, nodes, edges);
    const connectedEdges = getConnectedEdges([node], edges);

    const remainingEdges = getRemainingEdges(acc, connectedEdges);
    const createdEdges = createNewEdges(incomers, outgoers, getNode);

    return [...remainingEdges, ...createdEdges];
  };

  const onNodesDelete = useCallback(
    (deleted: any) => {
      setEdges(deleted.reduce((acc: any, node: any) => processDeletedNode(acc, node, nodes, edges, getNode), edges));
    },
    [nodes, edges]
  );
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={useServiceStore.getState().onNodesChange}
      onEdgesChange={useServiceStore.getState().onEdgesChange}
      snapToGrid
      proOptions={{ hideAttribution: true }}
      panOnScroll
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setReactFlowInstance}
      nodesDraggable={false}
      onConnect={onConnect}
      onNodesDelete={onNodesDelete}
      fitView
      fitViewOptions={{ padding: 2 }}
    >
      <MiniMap />
      <Background color="#D2D3D8" gap={16} lineWidth={9} />
      <Controls orientation="horizontal" showInteractive={false} />
    </ReactFlow>
  );
};

export default FlowBuilder;
