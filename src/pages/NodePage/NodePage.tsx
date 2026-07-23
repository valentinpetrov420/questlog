import { useParams } from "react-router-dom";
import { Node } from "../../types/Node.js";

import { useNodes } from "../../contexts/NodesContext.js";
import List from "../../components/List/List.js";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        const nodeFromState = flatNodes.find(n => n.id === nodeId);
        if (!nodeId) {
            return;
        }

        if (nodeFromState) {
            setNode(nodeFromState);
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

    }, [nodeId]);

    useEffect(() => {
        const updated = nodes.find(n => n.id === nodeId);
        if (updated) {
            setNode(updated);
        }
    }, [nodes]);

    if (nodesLoading) {
        return <SkeletonPage type="nodepage" />
    };

    if (!node) {
        return <p>404</p>;
    }

    return (
        <div id="list-page-wrapper">
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
    )
}