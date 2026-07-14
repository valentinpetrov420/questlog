import CreateListForm from "../components/CreateListForm/CreateListForm.jsx"
import ListView from '../components/ListView/ListView.jsx'

import { maxLength } from "../constants/app";

import { useNodes } from '../contexts/NodesContext.jsx';

export default function Dashboard() {
    const {
        nodes, setNodes,
        nodesLoading, setNodesLoading,

        sortMode, setSortMode,

        handleCreateNode,

        handleCreateChildNode,

        handleArchiveNode,
        handleRestoreNode,
        
        handleDeleteNode,
    } = useNodes();

    return <div id="dashboard-container">
        <CreateListForm onCreateList={handleCreateNode} maxLength={maxLength} />
        <select id="sort-dropdown"
            value={sortMode}
            onChange={(event) => {
                setSortMode(event.target.value);
            }}>
            <option value="createdAt">Newest</option>
            <option value="updatedAt">Last updated</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="archived">Archived only</option>
        </select>
        <ListView
            role="sorted" sortMode={sortMode}
            lists={nodes}
            maxLength={maxLength}


            onListItemAdd={handleCreateChildNode}
            onListArchive={handleArchiveNode}
            onListRestore={handleRestoreNode}
            onListDelete={handleDeleteNode}
        />
    </div>
}