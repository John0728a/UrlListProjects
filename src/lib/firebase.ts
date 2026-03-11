import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCV4-AA2BFTdqLIpcGROeXe3D2coETA9Fw",
  authDomain: "modular-hulling-462013-m3.firebaseapp.com",
  projectId: "modular-hulling-462013-m3",
  storageBucket: "modular-hulling-462013-m3.firebasestorage.app",
  messagingSenderId: "507961827394",
  appId: "1:507961827394:web:0e7d35004fd46806868ddb",
  measurementId: "G-C4S8PQHFCK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);
