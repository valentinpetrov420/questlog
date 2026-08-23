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


async function getNode(nodeId: string): Promise<Node | null> {
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
async function getNodes(): Promise<Node[]> {
    return JSON.parse(localStorage.getItem("guestNodes") ?? "[]");
}

async function updateNode(id: string, data: object) {
    await __devDelay();

    const flatNodes = await getNodes();

    const updatedFlatNodes = flatNodes.map(node => node.id === id 
        ? { ...node, ...data }
        : node
    );

    localStorage.setItem("guestNodes", JSON.stringify(updatedFlatNodes));
}
async function updateNodeOptimistic(id: string, data: object) {
    const flatNodes = await getNodes();

    const updatedFlatNodes = flatNodes.map(node => node.id === id
        ? { ...node, ...data }
        : node
    );

    localStorage.setItem("guestNodes", JSON.stringify(updatedFlatNodes));
}
async function resetTasks(nodeIds: Set<string>) {
    await __devDelay();
    
    const flatNodes = await getNodes();

    const updatedFlatNodes = flatNodes.map(node =>
        nodeIds.has(node.id)
            ? {
                ...node,
                completed: false,
                updatedAt: Date.now()
            }
            : node
    );

    localStorage.setItem("guestNodes", JSON.stringify(updatedFlatNodes));
    console.log("Reset tasks: " + nodeIds.size);
}

async function deleteNode(nodeId: string, ownerId: string) {
    await __devDelay();

    const flatNodes = await getNodes();

    const idsToDelete = new Set<string>();

    // this looks more complicated than firestoreService because firestore functions like
    // where, collection, deleteDoc, updateDoc etc
    // hide complexity away and i had to be explicit about the flow
    // but it is the same functionality

    function collectDescendants(id: string) {
        idsToDelete.add(id);

        const children = flatNodes.filter(node =>
            node.parentId === id &&
            node.ownerId === ownerId
        );

        children.forEach(child => {
            collectDescendants(child.id);
        });
    }

    collectDescendants(nodeId);

    const updatedFlatNodes = flatNodes.filter(node => !idsToDelete.has(node.id));

    localStorage.setItem("guestNodes", JSON.stringify(updatedFlatNodes));
}


function __clearLocalNodes() {
    localStorage.removeItem("guestNodes")
}

const localStorageService = {
    nodes: {
        createNode,

        getNodes,
        getNode,

        updateNode, updateNodeOptimistic,
        resetTasks,

        deleteNode,

        __clearLocalNodes
    }
}

export default localStorageService;