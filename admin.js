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

// Elementos do login
const entrarBtn = document.getElementById("entrar");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const erroTxt = document.getElementById("erro");

entrarBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const senha = senhaInput.value;

  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      // Login bem-sucedido
      window.location.href = "dashboard.html"; // redireciona para painel
    })
    .catch((error) => {
      console.error(error);
      erroTxt.textContent = "E-mail ou senha inválidos!";
    });
});
