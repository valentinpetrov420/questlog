import {
    doc,
    collection,

    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,

    query,
    where
}
    from "firebase/firestore";

import { db } from "../firebase";

import { __devDelay } from "../../dev/networkStress";

async function createList(userId, title, isPublic) {
    await __devDelay();

    const docRef = await addDoc(collection(db, "lists"), {
        ownerId: userId,
        title,
        isPublic: isPublic,
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
            isPublic: list.isPublic ?? false,
            items
        }
    }))
}

async function getList(listId) {
    try {
        const docRef = doc(db, "lists", listId);
        const snapshot = await getDoc(docRef);
        const items = await getItems(listId);

        return {
            id: snapshot.id,
            ...snapshot.data(),
            isPublic: snapshot.data().isPublic ?? false,
            items
        }
    } catch (error) {
        console.error("Failed to fetch list: ", error);
        throw error;
    }
}

async function updateListVisibility(listId, newVisibility) {
    await __devDelay();

    const listDocRef = doc(db, "lists", listId);

    await updateDoc(listDocRef, {
        isPublic: newVisibility,
        updatedAt: Date.now(),
    });
}
async function updateListTitle(listId, newTitle) {
    await __devDelay();

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
    await __devDelay();

    const itemsRef = collection(db, "lists", listId, "items");
    const snapshot = await getDocs(itemsRef);

    await Promise.all(
        snapshot.docs.map(item => deleteDoc(doc(db, "lists", listId, "items", item.id)))
    );

    await deleteDoc(doc(db, "lists", listId));

    console.log(listId);
}

async function createItem(listId, { text, type }) {
    await __devDelay();

    const itemsRef = collection(db, "lists", listId, "items");
    const listRef = doc(db, "lists", listId);

    const now = Date.now();

    const docRef = await addDoc(itemsRef, {
        text,
        type,
        completed: false,
        createdAt: now,
        updatedAt: now
    });

    await updateDoc(listRef, {
        updatedAt: now
    });

    return docRef.id;
}
async function toggleItemCompleted(listId, itemId, newCompleted) {
    const itemDocRef = doc(db, "lists", listId, "items", itemId);
    const listDocRef = doc(db, "lists", listId);

    const now = Date.now();

    await Promise.all([
        updateDoc(itemDocRef, {
            completed: newCompleted,
            updatedAt: now
        }),
        updateDoc(listDocRef, {
            updatedAt: now
        })
    ]);
}
async function editItem(listId, itemId, newText) {
    await __devDelay();

    const itemDocRef = doc(db, "lists", listId, "items", itemId);
    const listDocRef = doc(db, "lists", listId);

    const now = Date.now();

    await Promise.all([
        updateDoc(itemDocRef, {
            text: newText,
            updatedAt: now
        }),
        updateDoc(listDocRef, {
            updatedAt: now
        })
    ]);
}
async function deleteItem(listId, itemId) {
    await __devDelay();

    await deleteDoc(doc(db, "lists", listId, "items", itemId));
}

async function createNode(ownerId, { type, parentId = null, title = "", text = "", isPublic = false }) {
    await __devDelay();

    const docRef = await addDoc(collection(db, "nodes"), {
        type,
        parentId,
        title,
        text,
        completed: false,
        ownerId,
        isPublic,
        pinned: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    return docRef.id;
}
async function getNode(nodeId) {
    try {
        const docRef = doc(db, "nodes", nodeId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return null;
        }

        const childrenSnapshot = await getDocs(
            query(collection(db, "nodes"), where("parentId", "==", nodeId))
        );

        const children = childrenSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            id: snapshot.id,
            ...snapshot.data(),
            isPublic: snapshot.data().isPublic ?? false,
            children
        }
    } catch (error) {
        console.error("Failed to fetch node: ", error);
        throw error;
    }
}
function nestNodes(flatNodes) {
    const roots = flatNodes.filter(node => node.parentId === null);
    const children = flatNodes.filter(node => node.parentId !== null);

    const nested = roots.map(root => {
        return {
            ...root,
            items: children.filter(child => child.parentId === root.id)
        }
    });

    return nested;
}
async function getNodes(userId) {
    try {
        const q = query(
            collection(db, "nodes"),
            where("ownerId", "==", userId)
        );

        const snapshot = await getDocs(q);

        const nodes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return nestNodes(nodes);
    } catch (error) {
        console.error("Failed to fetch nodes: ", error);
        throw error;
    }
}
async function updateNode(nodeId, data) {
    await __devDelay();

    const docRef = doc(db, "nodes", nodeId);

    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
    });
}
async function updateNodeOptimistic(nodeId, data) {
    const docRef = doc(db, "nodes", nodeId);

    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
    });
}

async function deleteNode(nodeId){
    await __devDelay();

    await deleteDoc(doc(db, "nodes", nodeId));
}


const firestoreService = {
    lists: {
        getList,
        createList,
        getHydratedLists,
        updateListVisibility,
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
    },

    nodes: {
        createNode,

        getNode,
        getNodes,

        updateNode, updateNodeOptimistic,

        deleteNode,
    }
}

export default firestoreService;