import { __devDelay } from "../../dev/networkStress";
import { Node } from "../../types/Node";

type CreateNodeData = {
    type?: string;
    parentId?: string | null;
    text?: string;
    isPublic?: boolean;
    order?: number;
};

async function createNode(ownerId: string, { type = "page", parentId = null, text = "", isPublic = false, order = 0 }: CreateNodeData) {
    await __devDelay();

    const nodes: Node[] = JSON.parse(
        localStorage.getItem("guestNodes") ?? "[]"
    );

    const node = {
        id: crypto.randomUUID(),
        type,
        parentId,
        text,
        order,
        completed: false,
        ownerId,
        isPublic,
        pinned: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    } as Node;

    nodes.push(node);

    localStorage.setItem("guestNodes", JSON.stringify(nodes));

    return node.id;
}


async function getNode(nodeId: string): Promise<Node | null>{
    const flatNodes = await getNodes();

    const node = flatNodes.find(n => n.id === nodeId);

    if (!node) {
        return null;
    }

    const items = flatNodes
        .filter(n => n.parentId === nodeId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
        ...node,
        items
    };
}

async function getNodes(): Promise<Node[]>{
    return JSON.parse(localStorage.getItem("guestNodes") ?? "[]");
}

function __clearLocalNodes(){
    localStorage.removeItem("guestNodes")
}

const localStorageService = {
    nodes: {
        createNode,

        getNodes,
        getNode,

        __clearLocalNodes
    }
}

export default localStorageService;