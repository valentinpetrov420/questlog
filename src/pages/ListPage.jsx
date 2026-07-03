import { useParams } from "react-router-dom";

import { useLists } from "../contexts/ListsContext";
import { maxLength } from "../constants/app";
import List from "../components/List/List";

export default function ListPage() {
    const { listId } = useParams();

    const { lists, listsLoading,

        handleEditListTitle,

        //listpage doesnt need this stuff
        handlePin,
        handleArchive,
        handleRestore,
        handleDeleteList,
        //maybe it needs archive

        handleCreateItem,
        handleToggle,
        handleItemEdit,
        handleItemDelete

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
            onListItemAdd={handleCreateItem}
            onListItemEdit={handleItemEdit}
            onListItemDelete={handleItemDelete}
            onListItemToggle={(itemId) => handleToggle(list.id, itemId)}
            onListTitleChange={handleEditListTitle}
            onListPin={(event) => handlePin(list.id)}
            onListArchive={() => handleArchive(list.id)}
            onListRestore={() => handleRestore(list.id)}
            onListDelete={(event) => handleDeleteList(list.id)}
            maxLength={maxLength}
        />
    )
}