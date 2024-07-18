// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDyPi2wMSMU0kTi3PSQDsZ5vsEb0XyVLek",
    authDomain: "test-app-dfca3.firebaseapp.com",
    projectId: "test-app-dfca3",
    storageBucket: "test-app-dfca3.appspot.com",
    messagingSenderId: "2565067895",
    appId: "1:2565067895:web:9b75350302486ff1886272",
    measurementId: "G-09H440BS52"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
