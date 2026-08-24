import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Node } from "../../types/Node.js";

import {
    doc,
    onSnapshot,
}
    from "firebase/firestore";

import { db } from "../../api/firebase.js";

import { useNodes } from "../../contexts/NodesContext.js";
import { useAuth } from "../../contexts/AuthContext.js";

import { useEffect, useState, useMemo } from "react";
import './NodePage.css';

import firestoreService from '../../api/services/firestoreService.js';
import localStorageService from "../../api/services/localStorageService.js";

import SkeletonPage from "../SkeletonPage/SkeletonPage.js";
import List from "../../components/List/List.js";

export default function NodePage() {
    const [node, setNode] = useState<Node | null>(null);
    const { nodeId } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const nodeService = user?.uid === "guest"
        ? localStorageService
        : firestoreService

    useEffect(() => {
        if (!nodeId) {
            return;
        }

        if (user?.uid === "guest") {
            return;
        }

        const nodeRef = doc(db, "nodes", nodeId);

        const unsubscribe = onSnapshot(nodeRef, snapshot => {
            if (!snapshot.exists()) {
                navigate("/");
                return;
            }

            // the Node data structure in firebase doesnt store an id explicitly in the object, but firebase stores it as snapshot.id
            // however an id is needed for the UI to reference specific component elements (i.e. autofocus+select title edit on New Page, which needs newParentId)
            // thats why the setNode below looks weird
            setNode({
                id: snapshot.id,
                ...(snapshot.data() as Omit<Node, "id">),
            });
        });

        return unsubscribe;
    }, [nodeId, navigate]);

    const {
        flatNodes,
        nodesLoading, setNodesLoading,
    } = useNodes();

    const nodeFromState = flatNodes.find(n => n.id === nodeId);

    const location = useLocation();
    const newParentId = location.state?.newParentId ?? false;

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

    const [fetchedItems, setFetchedItems] = useState<Node[] | null>(null);
    const [nodeLoading, setNodeLoading] = useState(true);

    useEffect(() => {
        if (!nodeId) {
            return;
        }

        if (nodeFromState) {
            setNode(nodeFromState);
            setFetchedItems(null);
            setNodeLoading(false);
            return;
        }

        setNodesLoading(true);
        setNodeLoading(true);


        nodeService.nodes.getNode(nodeId)
            .then((response) => {
                if (!response) {
                    setNode(null);
                    return;
                }
                setNode(response);
                setFetchedItems(response.items ?? []);
            })
            .finally(() => {
                setNodesLoading(false)
            }
            );

    }, [nodeId, flatNodes]);

    const items = useMemo(() => {
        if (nodeFromState) {
            return flatNodes
                .filter(child => child.parentId === nodeId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
        return fetchedItems ?? [];
    }, [flatNodes, nodeId, nodeFromState, fetchedItems]);

    if (nodesLoading || nodeLoading) {
        return <SkeletonPage type="nodepage" />
    };

    if (!node) {
        return <p>404</p>;
    }

    return (
        <div className="list-page-container">
            {canShowBreadcrumbs ? <div>
                <ul className="breadcrumb-tree">
                    <li>
                        <Link className="crumb" to={`/`}>Dashboard</Link>
                    </li>
                    {breadcrumbs.map(crumb => {
                        if (crumb.id === nodeId) {
                            return (
                                <li key={crumb.id}>
                                    <p className="crumb-symbol">➜</p>
                                    <p className="crumb-current">{crumb.text}</p>
                                </li>
                            )
                        } else {
                            return (
                                <li key={crumb.id}>
                                    <p className="crumb-symbol">➜</p>
                                    <Link className="crumb" to={`/${crumb.id}`}>{crumb.text}</Link>
                                </li>
                            )
                        }
                    })}
                </ul>
            </div> : ""}
            <div className="list-page-wrapper">

                <List key={node.id}

                    isNodePage={true}
                    newParentId={newParentId}

                    id={node.id}
                    text={node.text}
                    listItems={items}
                    pinned={node.pinned}
                    isArchived={node.archived}
                    isPublic={node.isPublic}
                    ownerId={node.ownerId}
                />
            </div>
        </div>
    )
}