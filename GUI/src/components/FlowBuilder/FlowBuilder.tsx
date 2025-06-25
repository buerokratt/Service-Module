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
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  nodes,
  edges,
}) => {
  useLayout();
  const { getNode, setEdges } = useReactFlow();
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onNodesDelete = useCallback(
    (deleted: any) => {
      setEdges(
        deleted.reduce((acc: any, node: any) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge: any) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
              type: "step",
              animated: getNode(target)?.type === "ghost",
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
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
