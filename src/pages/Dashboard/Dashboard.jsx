import CreateListForm from "../../components/CreateListForm/CreateListForm.jsx"
import ListView from '../../components/ListView/ListView.jsx'

import { maxLength } from "../../constants/app.js";

import { useNodes } from '../../contexts/NodesContext.jsx';

export default function Dashboard() {
    const {
        nodes,
        sortMode, setSortMode,
    } = useNodes();

    return <div id="dashboard-container">
        <ListView
            role="pinned"
            lists={nodes}
        />
        <CreateListForm maxLength={maxLength} />
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
        />
    </div>
}