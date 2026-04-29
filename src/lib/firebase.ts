import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZs8URnCAKqL6F_o3cL9RwBs3fCYWByLI",
  authDomain: "dailygrow-bb443.firebaseapp.com",
  projectId: "dailygrow-bb443",
  storageBucket: "dailygrow-bb443.firebasestorage.app",
  messagingSenderId: "485168155990",
  appId: "1:485168155990:web:305042cea7a434c32f5af7"
};

// Singleton 패턴: 이미 초기화되어 있으면 재사용
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;