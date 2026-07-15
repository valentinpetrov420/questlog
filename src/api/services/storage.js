export default function nestNodes(flatNodes) {
    const roots = flatNodes.filter(node => node.parentId === null);
    const children = flatNodes.filter(node => node.parentId !== null);

    const nested = roots.map(root => {
        return {
            ...root,
            items: children.filter(child => child.parentId === root.id)
        }
    });

    return nested;
}
