import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export async function createList(user, title) {
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

export async function getLists(userId) {
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