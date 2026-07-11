import { useParams } from "react-router-dom";

import { useNodes } from "../contexts/NodesContext.jsx";
import { maxLength } from "../constants/app";
import List from "../components/List/List";
import { use, useEffect, useState } from "react";
import './ListPage.css';

import firestoreService from '../api/services/firestoreService.js';

export default function ListPage() {
    const [node, setNode] = useState();
    const { nodeId } = useParams();

    const {
        nodes, setNodes,
        nodesLoading, setNodesLoading,
    } = useNodes();

    useEffect(() => {
        const nodeFromState = nodes.find(n => n.id === nodeId);

        if (nodeFromState) {
            setNodes(nodeFromState);
        } else {
            setNodesLoading(true);
            firestoreService.nodes.getNode(nodeId)
                .then((response) => {
                    console.log(response);
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
        return <p>Loading...</p>
    };

    if (!node) {
        return <p>404</p>;
    }

    return (
        <div id="list-page-wrapper">
            <List

                isNodePage={true}

                key={node.id}
                id={node.id}
                title={node.title}
                listItems={node.children}
                isArchived={node.archived}
                ownerId={node.ownerId}
                isPublic={node.isPublic}
                maxLength={maxLength}
            />
        </div>
    )
}