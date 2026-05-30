import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmOiWj3cURWmCRzWLuUL4c28jvtruFoXo",
    authDomain: "questlog-15a14.firebaseapp.com",
    projectId: "questlog-15a14",
    storageBucket: "questlog-15a14.firebasestorage.app",
    messagingSenderId: "633717202672",
    appId: "1:633717202672:web:2f6208edddecd61f442c35",
    measurementId: "G-1K5RB99F07"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);