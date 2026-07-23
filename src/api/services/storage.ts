import { Node } from "../../types/Node";

export default function nestNodes(flatNodes: Node[]) {
    const roots = flatNodes
        .filter(node => node.parentId === null)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const children = flatNodes.filter(node => node.parentId !== null);

    const nested = roots.map(root => {
        return {
            ...root,
            items: children
                .filter(child => child.parentId === root.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        }
    });
    return nested;
}