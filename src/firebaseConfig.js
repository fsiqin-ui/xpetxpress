import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj4OqCrl4abVWLCelZ3vgxS8fQ1kjdu30",
  authDomain: "xpet-d6b2a.firebaseapp.com",
  projectId: "xpet-d6b2a",
  storageBucket: "xpet-d6b2a.firebasestorage.app",
  messagingSenderId: "930810892405",
  appId: "1:930810892405:web:66352ff81b1201268a683c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
