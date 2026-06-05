import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export async function test(user) {
    const docRef = await addDoc(collection(db, "test"), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        createdAt: Date.now(),
    });

    console.log("created: ", docRef.id);
}

export async function getTestDocs() {
    const snapshot = await getDocs(collection(db, "test"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function testCreateList(user, title) {
    const docRef = await addDoc(collection(db, "lists"), {
        ownerId: user.uid,
        title,
        todos: [],
        pinned: false,
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    console.log("created: ", docRef.id);
}

export async function getTestLists(userId) {
    try {
        const q = query(
            collection(db, "lists"),
            where("ownerId", "==", userId)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Failed to fetch lists: ", error);
        throw error;
    }
}