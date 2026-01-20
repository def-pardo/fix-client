const firebaseConfig = {
    apiKey: "AIzaSyCrzm_NBjhkvhSXgAmbi09nvm848xn_xhM",
    authDomain: "fix-ia.firebaseapp.com",
    projectId: "fix-ia",
    storageBucket: "fix-ia.firebasestorage.app",
    messagingSenderId: "782810224158",
    appId: "1:782810224158:web:d8bed3888f80b8583b400f",
    measurementId: "G-49GKZZ4FGD"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Inicializado");
} else {
    console.error("Error Crítico: Los SDKs de Firebase no se cargaron antes de la configuración.");
}