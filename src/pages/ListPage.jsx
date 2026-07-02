import { useParams } from "react-router-dom";

import { useLists } from "../contexts/ListsContext";
import { maxLength } from "../constants/app";
import List from "../components/List/List";

export default function ListPage() {
    const { listId } = useParams();

    const { lists, listsLoading,

        onListItemChange,
        onListItemAdd,
        onListItemEdit,
        onListItemDelete,

        onListItemToggle,
        onListTitleChange,
        onListPin,
        onListArchive,
        onListRestore,

    } = useLists();


    const list = lists.find(l => l.id === listId);

    if (listsLoading) {
        return <p>Loading...</p>
    };

    if (!list) { 
        return <p>404</p>;
    }

    return (
        <List key={list.id}
            id={list.id}
            title={list.title}
            listItems={list.items}
            isArchived={list.archived}
            onListItemChange={onListItemChange}
            onListItemAdd={onListItemAdd}
            onListItemEdit={onListItemEdit}
            onListItemDelete={onListItemDelete}
            onListItemToggle={(itemId) => onListItemToggle(list.id, itemId)}
            onListTitleChange={onListTitleChange}
            onListPin={(event) => onListPin(list.id)}
            onListArchive={() => ponListArchive(list.id)}
            onListRestore={() => onListRestore(list.id)}
            onListDelete={(event) => onListDelete(list.id)}
            maxLength={maxLength}
        />
    )
}