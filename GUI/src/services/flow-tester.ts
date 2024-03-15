import { Node } from "reactflow";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";

export const testServiceFlow = () => {
  let currentNode = findStartNode();
  if(!currentNode) {
    useToastStore.getState().error({
      title: "Invalid flow",
      message: "No starting node found"
    });
    return;
  }

  while(currentNode) {
    if(currentNode.type === "placeholder") {
      useToastStore.getState().error({
        title: "Error",
        message: "Incomplete service flow"
      });
      return;
    }

    if(currentNode.type === "customNode") {
      performActionBasedOnNode(currentNode);
    } 

    const nextNodes = findNextNodes(currentNode);

    if(nextNodes.length === 0)
      break;
    if(nextNodes.length === 1)
      currentNode = nextNodes[0];
    else {
      // in case of node with many children
      // choose one of the nodes somehow
      // for now we will select the first one
      currentNode = nextNodes[0];
    }
  }
}

function findStartNode(): Node | undefined {
  const nodes = useServiceStore.getState().nodes;
  return nodes.find(x => x.type === "startNode");
}

function findNextNodes(node: Node): Node[] {
  const nodes = useServiceStore.getState().nodes;
  const edges = useServiceStore.getState().edges;

  const targets = edges.filter(x => x.source === node.id).map(x => x.target);
  if(!targets || targets.length === 0) 
    return [];

  return nodes.filter(x => targets.includes(x.id));
}

function performActionBasedOnNode(node: Node) {
  console.log("performActionBasedOnNode -> ", node)
  //
  // if node get "user input" -> get user info
  // if node print something -> print something
  // so on
  //
}
