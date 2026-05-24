import List from "../List/List";

export default function ListView(props) {

    //todo: Refactor ListView so sortMode only transforms
    //  ordering/grouping of derived list data (pinned/regular/sorted arrays)
    //  instead of controlling conditional render branches.
    if (props.sortMode === "pinned") {
        const pinnedLists = props.lists.filter(list => list.pinned);

        return <div id="pinned-lists">
            {pinnedLists.map(list => {
                return (
                    <List key={list.id}
                        id={list.id}
                        title={list.title}
                        listItems={list.todos}
                        onListItemChange={props.onListItemChange}
                        onListItemAdd={props.onListItemAdd}
                        onListItemEdit={props.onListItemEdit}                        
                        onListItemDelete={props.onListItemDelete}
                        onListItemToggle={(todoId) => props.onListItemToggle(list.id, todoId)}
                        onListTitleChange={props.onListTitleChange}
                        onListPin={props.onListPin}
                        onListDelete={(event) => props.onListDelete(list.id, list.title)}
                        maxLength={props.maxLength}
                    />)
                    
            })}
            </div>
        } else {
        return <ul>
        </ul>
    }
}