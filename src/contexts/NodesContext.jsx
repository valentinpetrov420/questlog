import { useContext, createContext, useEffect, useState } from "react";

import { siteName, maxLength } from "../constants/app.js";
import { formatError } from '../util/errorResponse.js';
import { validateText } from '../util/validation.js';

import { useAuth } from './AuthContext.jsx';
import firestoreService from "../api/services/firestoreService.js";

export const NodesContext = createContext();

export function NodesProvider({ children }) {
    const [nodesLoading, setNodesLoading] = useState(true);
    const [nodes, setNodes] = useState([]);

    const { user, authReady } = useAuth();

    const [sortMode, setSortMode] = useState(() => {
        return localStorage.getItem("sortmode") || "createdAt";
    });

    useEffect(() => {
        localStorage.setItem("sortmode", sortMode);
    }, [sortMode]);

    useEffect(() => {
        if (!authReady) {
            return;
        }
        if (!user) {
            setNodes([]);
            setNodesLoading(false);
            return;
        }

        //todo: page mount is instant but loading lists is not
        // communicate loading state to the user =>
        // possibly [loadingState, setLoadingState] architecture with try {} finally {}
        // also loading is indistinguishable from no lists when the user is new as they both render as []

        // i think it is better to separate authReady gate from lists loading 
        // authReady (its in context now, dw about it) = nothing to valid to render yet, blank (dark mode themed) page
        // lists loading = skeleton shell
        // goal is user perceived progress, not actual speed

        // i saw that tiktok does this too, blank unstyled white Please wait page (= pre-theme) =>
        // skeleton boxes with a pulsing animation (= pre-content)

        firestoreService.nodes.getNodes(user.uid).then((nodes) => {
            setNodes(nodes);
        })
            .finally(() => {
                setNodesLoading(false);
            });
    }, [user, authReady]);


    return (
        <NodesContext.Provider
            value={{
                nodes, setNodes,
                nodesLoading, setNodesLoading,
            }}
        >
            {children}
        </NodesContext.Provider>
    )


}


export function useNodes() {
    return useContext(NodesContext);
}