import CreateListForm from "../components/CreateListForm/CreateListForm.jsx"
import ListView from '../components/ListView/ListView.jsx'

import { maxLength } from "../constants/app";

import { useNodes } from '../contexts/NodesContext.jsx';

export default function Dashboard() {
    const {
        nodes, setNodes,
        nodesLoading, setNodesLoading,

        handleCreateNode, 

        handleCreateChildNode,
    } = useNodes();

    return <div id="dashboard-container">
        <CreateListForm onCreateList={handleCreateNode} maxLength={maxLength} />
        <ListView
            role="sorted"
            lists={nodes}
            maxLength={maxLength}


            onListItemAdd={handleCreateChildNode}
        />
    </div>
}