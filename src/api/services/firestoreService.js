import { collection, addDoc } from "firebase/firestore";
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