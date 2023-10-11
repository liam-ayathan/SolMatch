import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB41iK_y3xy_3wnS11eVkZmazTA9RKp4-k",
    authDomain: "giving-eth.firebaseapp.com",
    projectId: "giving-eth",
    storageBucket: "giving-eth.appspot.com",
    messagingSenderId: "721510575119",
    appId: "1:721510575119:web:1e31213dc210d11392477a",
    measurementId: "G-CN5596ZF53",
  };
  
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);

  export default firebaseApp;