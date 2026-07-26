import { useParams, Link } from "react-router-dom";
import { Node } from "../../types/Node.js";

import { useNodes } from "../../contexts/NodesContext.js";
import List from "../../components/List/List.js";
import { useEffect, useState, useMemo } from "react";
import './NodePage.css';

import firestoreService from '../../api/services/firestoreService.js';
import SkeletonPage from "../SkeletonPage/SkeletonPage.js";

export default function NodePage() {
    const [node, setNode] = useState<Node | null>(null);
    const { nodeId } = useParams();

    const {
        nodes, flatNodes,
        nodesLoading, setNodesLoading,
    } = useNodes();

    const nodeFromState = flatNodes.find(n => n.id === nodeId);

    const canShowBreadcrumbs = !!nodeFromState;

    const breadcrumbs = useMemo(() => {
        if (!nodeFromState) { return [] };

        const crumbs: Node[] = [];
        let current: Node | undefined = nodeFromState;

        while (current) {
            const newCurrent = current as Node;

            crumbs.unshift(current);
            current = flatNodes.find(n => n.id === newCurrent.parentId);
        }

        return crumbs;
    }, [nodeFromState, flatNodes]);

    useEffect(() => {
        if (!nodeId) {
            return;
        }

        if (nodeFromState) {
            setNode({
                ...nodeFromState,
                items: flatNodes
                    .filter(child => child.parentId === nodeId)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            });
            return;

        } else {

            setNodesLoading(true);

            firestoreService.nodes.getNode(nodeId)
                .then((response) => {
                    if (!response) {
                        setNode(null);
                        return;
                    }
                    setNode(response);
                })
                .finally(() => {
                    setNodesLoading(false)
                }
                );
        }

    }, [nodeId, flatNodes]);

    useEffect(() => {
        if (nodeId) {
            return;
        }
        const updated = nodes.find(n => n.id === nodeId);
        if (updated) {
            setNode(updated);
        }
    }, [nodes, nodeId]);

    if (nodesLoading) {
        return <SkeletonPage type="nodepage" />
    };

    if (!node) {
        return <p>404</p>;
    }

    return (
        <div className="list-page-container">
            {canShowBreadcrumbs ? <div>
                <ul className="breadcrumb-tree">
                    {breadcrumbs.map(crumb => {
                        return (
                            <li>
                                <p className="crumb-symbol">➜</p>
                                <Link className="crumb" to={`/${crumb.id}`}>{crumb.text}</Link>
                            </li>
                        )
                    })}
                </ul>
            </div> : ""}
            <div className="list-page-wrapper">

                <List key={node.id}

                    isNodePage={true}

                    id={node.id}
                    text={node.text}
                    listItems={node.items}
                    pinned={node.pinned}
                    isArchived={node.archived}
                    isPublic={node.isPublic}
                    ownerId={node.ownerId}
                />
            </div>
        </div>
    )
}