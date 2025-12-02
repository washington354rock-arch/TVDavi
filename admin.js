// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.2.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBg6BMcZXfCPX6V0_WhTIbQf4m8pWbUCUU",
  authDomain: "tvdavi-fd587.firebaseapp.com",
  projectId: "tvdavi-fd587",
  storageBucket: "tvdavi-fd587.firebasestorage.app",
  messagingSenderId: "1908490170",
  appId: "1:1908490170:web:475a8fc629f79883ef6783"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Evento de login
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert("Login realizado com sucesso!");
      // Redireciona para a página do painel
      window.location.href = "painel.html";
    })
    .catch((error) => {
      console.error(error);
      alert("Erro ao entrar: " + error.message);
    });
});
