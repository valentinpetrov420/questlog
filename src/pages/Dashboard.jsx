import CreateListForm from "../components/CreateListForm/CreateListForm.jsx"

import { maxLength } from "../constants/app";

import { useNodes } from '../contexts/NodesContext.jsx';

export default function Dashboard() {
    const {
        nodes, setNodes,
        nodesLoading, setNodesLoading,

        handleCreateNode,
    } = useNodes();

    return <CreateListForm onCreateList={handleCreateNode} maxLength={maxLength} />
}