

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDgt0ZXVPK1dhMqQZgaXtjXJe9UYO7hmUs",
  authDomain: "plinxu.firebaseapp.com",
  projectId: "plinxu",
  storageBucket: "plinxu.appspot.com",
  messagingSenderId: "82367704007",
  appId: "1:82367704007:web:23f078d8fa9abc95e687e2",
  measurementId: "G-E28MBDNS3C"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };
