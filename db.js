const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} = require('firebase/firestore');
const dotenv = require('dotenv');
dotenv.config();
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

module.exports = {
  addHistory: async function (wallet, token, amount) {
    try {
      const historyRef = doc(db, 'main', wallet);
      const result = await getDoc(historyRef);

      if (!result.exists()) {
        await setDoc(historyRef, {
          history: [{
            token,
            amount,
          }],
        });

        return true;
      }

      const { history } = result.data();

      await updateDoc(historyRef, {
        history: [
          ...history,
          {
            token,
            amount,
          }
        ],
      });
    } catch (e) {
      console.log(e);
    }
  },
  getHistory: async function (wallet) {
    try {
      const historyRef = doc(db, 'main', wallet);
      const result = await getDoc(historyRef);

      if (!result.exists()) {
        return [];
      }

      const { history } = result.data();

      return history;
    } catch (e) {
      console.log(e);
    }
  },
};
