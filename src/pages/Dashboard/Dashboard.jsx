import CreateListForm from "../../components/CreateListForm/CreateListForm.jsx"
import ListView from '../../components/ListView/ListView.jsx'

import { maxLength } from "../../constants/app.js";

import { useNodes } from '../../contexts/NodesContext.jsx';
import SkeletonPage from "../SkeletonPage/SkeletonPage.jsx";

export default function Dashboard() {
    const {
        nodes,
        nodesLoading,

        sortMode, setSortMode,
    } = useNodes();

    if (nodesLoading) {
        return <SkeletonPage type={"dashboard"}/>
    }

    return <div id="dashboard-container">
        <ListView
            role="pinned"
            lists={nodes}
        />
        <CreateListForm/>
        <select id="sort-dropdown"
            value={sortMode}
            onChange={(event) => {
                setSortMode(event.target.value);
            }}>
            <option value="createdAt">Newest</option>
            <option value="order">Custom Order</option>
            <option value="updatedAt">Last updated</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="archived">Archived only</option>
        </select>
        <ListView
            role="sorted" 
            sortMode={sortMode}
            lists={nodes}
        />
    </div>
}