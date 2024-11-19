// src/Firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importa getStorage

const firebaseConfig = {
  apiKey: "AIzaSyBAY67HZfFtW_lhFF0tttLd70LEp4JtArM",
  authDomain: "proyectoweb2024-d8813.firebaseapp.com",
  projectId: "proyectoweb2024-d8813",
  storageBucket: "proyectoweb2024-d8813.appspot.com",
  messagingSenderId: "253166705359",
  appId: "1:253166705359:web:b0006fca14b2461560f5ba",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Configuración de Firestore
const storage = getStorage(app); // Configuración de Firebase Storage

export { auth, db, storage }; // Exporta también storage
