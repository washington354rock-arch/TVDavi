// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBg6BMcZXfCPX6V0_WhTIbQf4m8pWbUCUU",
  authDomain: "tvdavi-fd587.firebaseapp.com",
  projectId: "tvdavi-fd587",
  storageBucket: "tvdavi-fd587.appspot.com",
  messagingSenderId: "1908490170",
  appId: "1:1908490170:web:475a8fc629f79883ef6783"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const loginBox = document.getElementById("login-box");
const painel = document.getElementById("painel");
const loginBtn = document.getElementById("login-btn");
const novoBtn = document.getElementById("novo-btn");
const form = document.getElementById("form");
const salvarBtn = document.getElementById("salvar-btn");
const mensagem = document.getElementById("mensagem");

// Login
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      loginBox.style.display = "none";
      painel.style.display = "block";
    })
    .catch(error => {
      alert("Erro ao entrar: " + error.message);
    });
});

// Mostrar formulário de nova notícia
novoBtn.addEventListener("click", () => {
  form.style.display = "block";
});

// Salvar notícia no Firestore
salvarBtn.addEventListener("click", async () => {
  const titulo = document.getElementById("titulo").value;
  const imagem = document.getElementById("imagem").value;
  const conteudo = document.getElementById("conteudo").value;

  if (!titulo || !conteudo || !imagem) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    await addDoc(collection(db, "noticias"), {
      titulo: titulo,
      conteudo: conteudo,
      imagem: imagem,
      link: ""
    });
    mensagem.textContent = "Notícia salva com sucesso!";
    form.style.display = "none";
    document.getElementById("titulo").value = "";
    document.getElementById("imagem").value = "";
    document.getElementById("conteudo").value = "";
  } catch (err) {
    alert("Erro ao salvar notícia: " + err.message);
  }
});
