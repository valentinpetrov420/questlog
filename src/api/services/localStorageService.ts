import { Node } from "../../types/Node";

type CreateNodeData = {
    type?: string;
    parentId?: string | null;
    text?: string;
    isPublic?: boolean;
    order?: number;
};

function createNode(ownerId: string, { type = "page", parentId = null, text = "", isPublic = false, order = 0 }: CreateNodeData) {
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

function getNodes(){
    return localStorage.getItem("guestNodes") ?? "[]";
}

function clearLocalNodes(){
    localStorage.removeItem("guestNodes")
}

const localStorageService = {
    nodes: {
        createNode,

        getNodes,

        clearLocalNodes
    }
}

export default localStorageService;