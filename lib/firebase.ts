// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCEotbifu2yOSUeXnNtgVdeOcwJ6-pfP5g",
    authDomain: "rolamax-15697.firebaseapp.com",
    projectId: "rolamax-15697",
    storageBucket: "rolamax-15697.firebasestorage.app",
    messagingSenderId: "659300386809",
    appId: "1:659300386809:web:f1f99e295427c7d6b01f28",
    measurementId: "G-C9NHK6BV87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage };