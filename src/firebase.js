import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA41wmYZHtEsjRiZob9A12UboAGG_06yI0",
  authDomain: "bvb-popup-c07c1.firebaseapp.com",
  projectId: "bvb-popup-c07c1",
  storageBucket: "bvb-popup-c07c1.firebasestorage.app",
  messagingSenderId: "1097876634204",
  appId: "1:1097876634204:web:519be6d997aece0f48c499",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);