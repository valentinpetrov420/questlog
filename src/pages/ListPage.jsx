import { useParams } from "react-router-dom";

import { useLists } from "../contexts/ListsContext";
import { maxLength } from "../constants/app";
import List from "../components/List/List";
import { useEffect, useState } from "react";

import firestoreService from '../api/services/firestoreService.js';

export default function ListPage() {
    const [list, setList] = useState();
    const { listId } = useParams();

    const { lists,
        listsLoading, setListsLoading,

        handleVisibility,
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

    useEffect(() => {
        const listFromState = lists.find(l => l.id === listId);

        if (listFromState) {
            setList(listFromState);
        } else {
            setListsLoading(true);
            firestoreService.lists.getList(listId)
                .then((response) => {
                    console.log(response);
                    setList(response);
                })
                .finally(() => {
                    setListsLoading(false)
                }
            );
        }

    }, [listId])

    if (listsLoading) {
        return <p>Loading...</p>
    };

    if (!list) {
        return <p>404</p>;
    }

    return (
        <List

            isListPage={true}

            key={list.id}
            id={list.id}
            title={list.title}
            listItems={list.items}
            isArchived={list.archived}
            ownerId={list.ownerId}
            isPublic={list.isPublic}
            onListVisibilityChange={handleVisibility}
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