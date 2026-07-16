import { useParams } from "react-router-dom";

import { useNodes } from "../../contexts/NodesContext.jsx";
import { maxLength } from "../../constants/app.js";
import List from "../../components/List/List.jsx";
import { use, useEffect, useState } from "react";
import './NodePage.css';

import firestoreService from '../../api/services/firestoreService.js';

export default function NodePage() {
    const [node, setNode] = useState();
    const { nodeId } = useParams();

    const {
        nodes, flatNodes,
        nodesLoading, setNodesLoading,

        sortMode, setSortMode,

        handleCreateNode,

        handleCreateChildNode,

        handleArchiveNode,
        handleRestoreNode,
        handleEditNodeText,
        handlePin,

        handleDeleteNode,

        handleToggleChildNode,
    } = useNodes();

    useEffect(() => {
        const nodeFromState = flatNodes.find(n => n.id === nodeId);

        if (nodeFromState) {
            setNode(nodeFromState);
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
            <List key={node.id}

                isNodePage={true}

                id={node.id}
                text={node.text}
                listItems={node.items}
                isArchived={node.archived}
                ownerId={node.ownerId}
                onListItemAdd={handleCreateChildNode}
                onListItemEdit={handleEditNodeText}
                onListItemDelete={handleDeleteNode}
                onListItemToggle={(itemId) => handleToggleChildNode(itemId)}
                onListTitleChange={handleEditNodeText}
                onListPin={(event) => handlePin(node.id)}
                onListArchive={() => handleArchiveNode(node.id)}
                onListRestore={() => handleRestoreNode(node.id)}
                onListDelete={(event) => handleDeleteNode(node.id)}
                maxLength={maxLength}
            />
        </div>
    )
}