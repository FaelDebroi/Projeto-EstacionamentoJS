import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBRKEC5zRICQvcmlnTcC06qSbiiyDexOOE",
    authDomain: "estacionamento-2143e.firebaseapp.com",
    projectId: "estacionamento-2143e",
    storageBucket: "estacionamento-2143e.firebasestorage.app",
    messagingSenderId: "777375505733",
    appId: "1:777375505733:web:c9d779d398275d70eeb22c",
    measurementId: "G-B24HKZRHWF"
  };
  

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

   
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.email === "admin@example.com") {
                //admin
                window.location.href = "./html/tarifa.html"; 
            } else {
                // cliente
                window.location.href = "./html/estacionamento.html"; 
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('error-message').innerText = "Erro ao fazer login: " + errorMessage;
        });
});
