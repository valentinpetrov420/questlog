import {
    doc,
    collection,

    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,

    query,
    where
}
    from "firebase/firestore";

import { db } from "../firebase";

async function createList(userId, title) {
    const docRef = await addDoc(collection(db, "lists"), {
        ownerId: userId,
        title,
        todos: [],
        pinned: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    console.log("created: ", docRef.id);

    return docRef.id;
}
async function getLists(userId) {
    try {
        const q = query(
            collection(db, "lists"),
            where("ownerId", "==", userId)
        );

        const snapshot = await getDocs(q);

        const lists = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return lists;
    } catch (error) {
        console.error("Failed to fetch lists: ", error);
        throw error;
    }
}
async function getItems(listId) {
    const snapshot = await getDocs(
        collection(db, "lists", listId, "items")
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}
async function getHydratedLists(userId) {
    const lists = await getLists(userId);

    return Promise.all(lists.map(async (list) => {
        const items = await getItems(list.id);

        return {
            ...list,
            items
        }
    }))
}
async function updateListTitle(listId, newTitle) {
    const listDocRef = doc(db, "lists", listId);

    await updateDoc(listDocRef, {
        title: newTitle,
        updatedAt: Date.now(),
    });
}
async function updateListPin(listId, newPinned) {
    const listDocRef = doc(db, "lists", listId);

    await updateDoc(listDocRef, {
        pinned: newPinned,
        updatedAt: Date.now()
    })
}
async function updateListArchived(listId, newArchived) {
    const listDocRef = doc(db, "lists", listId);

    await updateDoc(listDocRef, {
        archived: newArchived,
        updatedAt: Date.now()
    })
}
async function deleteList(listId) {
    console.log(listId);
    const itemsRef = collection(db, "lists", listId, "items");
    const snapshot = await getDocs(itemsRef);

    await Promise.all(
        snapshot.docs.map(item => deleteDoc(doc(db, "lists", listId, "items", item.id)))
    );

    await deleteDoc(doc(db, "lists", listId));
}

async function createItem(listId, { text, type }) {
    const itemsRef = collection(db, "lists", listId, "items");

    const docRef = await addDoc(itemsRef, {
        text,
        type,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    return docRef.id;
}
async function toggleItemCompleted(listId, itemId, newCompleted) {
    const itemDocRef = doc(db, "lists", listId, "items", itemId);

    await updateDoc(itemDocRef, {
        completed: newCompleted,
        updatedAt: Date.now()
    })
}
async function editItem(listId, itemId, newText) {
    const itemDocRef = doc(db, "lists", listId, "items", itemId);

    await updateDoc(itemDocRef, {
        text: newText,
        updatedAt: Date.now()
    })
}
async function deleteItem(listId, itemId) {
    await deleteDoc(doc(db, "lists", listId, "items", itemId));
}

const firestoreService = {
    lists: {
        createList,
        getHydratedLists,
        updateListTitle,
        updateListPin,
        updateListArchived,
        deleteList
    },

    items: {
        createItem,
        toggleItemCompleted,
        editItem,
        deleteItem
    }
}

export default firestoreService;