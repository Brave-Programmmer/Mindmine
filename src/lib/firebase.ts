import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyA_QZZUiGxomkVIFiPtwsMcg0ERBgNXSLM",
  authDomain: "scriptora-e17fd.firebaseapp.com",
  projectId: "scriptora-e17fd",
  storageBucket: "scriptora-e17fd.firebasestorage.app",
  messagingSenderId: "477285884404",
  appId: "1:477285884404:web:2f88ad7334a6f10d4699a1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
