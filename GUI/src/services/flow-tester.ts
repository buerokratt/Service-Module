import { Node } from "reactflow";
import useServiceStore from "store/new-services.store";
import useTestServiceStore from "store/test-services.store";
import { StepType } from "types";

export const testServiceFlow = async () => {
  const store = useTestServiceStore.getState();
  let currentNode = findStartNode();
  if(!currentNode) {
    store.addError("chat.no-start-node");
    return;
  }

  while(currentNode) {
    store.changeCurrentNodeId(currentNode?.id);
    if(currentNode.type === "placeholder") {
      store.addError("chat.incomplete-service-flow");
      return;
    }

    if(currentNode.type === "customNode") {
      await performActionBasedOnNode(currentNode);
    } 

    const nextNodes = findNextNodes(currentNode);

    if(nextNodes.length === 0)
      break;
    if(nextNodes.length === 1)
      currentNode = nextNodes[0];
    else {
      // in case of node with many children choose one of the nodes somehow
      // for now we will select first one
      currentNode = nextNodes[0];
    }
  }

  store.addSuccess('chat.end-of-chat');
  store.clearCurrentNodeId();
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

async function performActionBasedOnNode(node: Node) {
  const store = useTestServiceStore.getState();
  switch(node.data.stepType) {
    case StepType.Auth: 
      store.addBotMessage("chat.loginWithTARA"); 
      break;
    case StepType.Textfield:
      const msg = node.data.message.replace("<p>", "").replace("</p>", "");
      store.addBotMessage(msg);
      break;
    case StepType.OpenWebpage:
      store.addBotMessage(node.data.linkText, node.data.link); 
      break;
    case StepType.FileSign:
      store.addBotMessage("chat.fileSignYesNo"); 
      break;
    case StepType.FileGenerate:
      store.addBotMessage(node.data.fileName, "data:" + node.data.fileContent); 
    break;
    case StepType.FinishingStepRedirect:
      store.addBotMessage("chat.redirectToCustomerSupport"); 
      break;
    case StepType.Input:
      store.addInfo("chat.waiting-for-user-input");
      store.waitForUserInput();
      do {
        await sleep(2000);
      } while(useTestServiceStore.getState().waitingForInput);
      break;
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
