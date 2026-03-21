// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0aNpabQytxKMf7wMtByOfOrb91MheCPw",
  authDomain: "queue-34ca0.firebaseapp.com",
  databaseURL: "https://queue-34ca0-default-rtdb.firebaseio.com",
  projectId: "queue-34ca0",
  storageBucket: "queue-34ca0.firebasestorage.app",
  messagingSenderId: "857550732630",
  appId: "1:857550732630:web:f9299e3bd27c95043d6af7"
};

const app = initializeApp(firebaseConfig);

// 🔥 services export
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;