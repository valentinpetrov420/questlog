type NodeType = "page" | "todo" | "separator" | "heading" | "link";

export type Node = {
    id: string;
    type: NodeType;
    text: string;
    parentId: string | null;
    ownerId: string;
    isPublic: boolean;
    pinned: boolean;
    archived: boolean;
    completed: boolean;
    url?: string;
    order: number;
    createdAt: number;
    updatedAt: number;
    items?: Node[];
}