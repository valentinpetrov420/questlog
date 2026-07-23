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

import { __devDelay } from "../../dev/networkStress.ts";

import { Node } from "../../types/Node.ts";

type CreateNodeData = {
    type?: string;
    parentId?: string | null;
    text?: string;
    isPublic?: boolean;
    order?: number;
};

async function createNode(ownerId: string, { type = "page", parentId = null, text = "", isPublic = false, order = 0 }: CreateNodeData) {
    await __devDelay();

    const docRef = await addDoc(collection(db, "nodes"), {
        type,
        parentId,
        text,
        order,
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
async function getNode(nodeId: string): Promise<Node | null> {
    try {
        console.log("fetching node:", nodeId);
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
        } as Node
    } catch (error) {
        console.error("Failed to fetch node: ", error);
        throw error;
    }
}
async function getNodes(userId: string): Promise<Node[]> {
    try {
        const q = query(
            collection(db, "nodes"),
            where("ownerId", "==", userId)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Node[];

    } catch (error) {
        console.error("Failed to fetch nodes: ", error);
        throw error;
    }
}
async function updateNode(nodeId: string, data: object) {
    await __devDelay();

    const docRef = doc(db, "nodes", nodeId);

    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
    });
}
async function updateNodeOptimistic(nodeId: string, data: object) {
    const docRef = doc(db, "nodes", nodeId);

    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
    });
}

async function deleteNode(nodeId: string, ownerId: string){
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