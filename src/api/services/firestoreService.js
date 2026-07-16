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


async function createNode(ownerId, { type, parentId = null, text = "", isPublic = false }) {
    await __devDelay();

    const docRef = await addDoc(collection(db, "nodes"), {
        type,
        parentId,
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

        const items = childrenSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            id: snapshot.id,
            ...snapshot.data(),
            isPublic: snapshot.data().isPublic ?? false,
            items
        }
    } catch (error) {
        console.error("Failed to fetch node: ", error);
        throw error;
    }
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

        return nodes;
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

async function deleteNode(nodeId, ownerId){
    await __devDelay();
    
    const childrenSnapshot = await getDocs(
        query(collection(db, "nodes"), where("parentId", "==", nodeId), where("ownerId", "==", ownerId))
    );
    
    await Promise.all(
        childrenSnapshot.docs.map(child => deleteDoc(doc(db, "nodes", child.id)))
    );
    
    await deleteDoc(doc(db, "nodes", nodeId));
}


const firestoreService = {
    nodes: {
        createNode,

        getNode,
        getNodes,

        updateNode, updateNodeOptimistic,

        deleteNode,
    }
}

export default firestoreService;