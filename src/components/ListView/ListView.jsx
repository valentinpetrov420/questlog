import List from "../List/List";
import './ListView.css';

export default function ListView(props) {
    if (props.role === "pinned") {
        const pinnedLists = props.lists.filter(list => list.pinned && !list.archived);

        const allPinnedTodos = pinnedLists.flatMap(list => list.todos)
        const firstUncompleted = allPinnedTodos.find(todo => !todo.completed)

        let highlightedTodoId = null;
        if (firstUncompleted) {
            highlightedTodoId = firstUncompleted.id;
        }

        return <div className="list-view">
            {pinnedLists.map(list => {
                return (
                    <List key={list.id}
                        id={list.id}
                        title={list.title}
                        listItems={list.todos}
                        isArchived={list.archived}
                        highlightedTodoId={highlightedTodoId}
                        onListItemChange={props.onListItemChange}
                        onListItemAdd={props.onListItemAdd}
                        onListItemEdit={props.onListItemEdit}
                        onListItemDelete={props.onListItemDelete}
                        onListItemToggle={(todoId) => props.onListItemToggle(list.id, todoId)}
                        onListTitleChange={props.onListTitleChange}
                        onListPin={(event) => props.onListPin(list.id)}
                        onListArchive={() => props.onListArchive(list.id)}
                        onListRestore={() => props.onListRestore(list.id)}
                        onListDelete={(event) => props.onListDelete(list.id, list.title)}
                        maxLength={props.maxLength}
                    />)

            })}
        </div>
    } else {
        let sortedLists = props.lists.filter(list => !list.pinned && !list.archived);

        switch (props.sortMode) {
            case "createdAt":
                sortedLists = [...sortedLists].sort((a, b) => b.createdAt - a.createdAt);
                break;
            case "updatedAt":
                sortedLists = [...sortedLists].sort((a, b) => b.updatedAt - a.updatedAt);
                break;
            case "alphabetical":
                sortedLists = [...sortedLists].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "archived":
                sortedLists = props.lists.filter(list => list.archived);
                break;
        }

        return <div className="list-view">
            {sortedLists.map(list => {
                return (
                    <List key={list.id}
                        id={list.id}
                        title={list.title}
                        listItems={list.todos}
                        isArchived={list.archived}
                        onListItemChange={props.onListItemChange}
                        onListItemAdd={props.onListItemAdd}
                        onListItemEdit={props.onListItemEdit}
                        onListItemDelete={props.onListItemDelete}
                        onListItemToggle={(todoId) => props.onListItemToggle(list.id, todoId)}
                        onListTitleChange={props.onListTitleChange}
                        onListPin={(event) => props.onListPin(list.id)}
                        onListArchive={() => props.onListArchive(list.id)}
                        onListRestore={() => props.onListRestore(list.id)}
                        onListDelete={(event) => props.onListDelete(list.id, list.title)}
                        maxLength={props.maxLength}
                    />)
            })}
        </div>
    }
}