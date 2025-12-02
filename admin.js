// =====================
// Inicializar Firebase
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBg6BMcZXfCPX6V0_WhTIbQf4m8pWbUCUU",
  authDomain: "tvdavi-fd587.firebaseapp.com",
  projectId: "tvdavi-fd587",
  storageBucket: "tvdavi-fd587.firebasestorage.app",
  messagingSenderId: "1908490170",
  appId: "1:1908490170:web:475a8fc629f79883ef6783"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =====================
// LOGIN
// =====================
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBox = document.getElementById("login-box");
const painelBox = document.getElementById("painel-box");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    console.log("Logado como:", userCredential.user.email);
    loginBox.style.display = "none";
    painelBox.style.display = "block";
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
});

// =====================
// LOGOUT
// =====================
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  loginBox.style.display = "block";
  painelBox.style.display = "none";
});

// =====================
// ADICIONAR NOTÍCIA
// =====================
const noticiaForm = document.getElementById("noticia-form");
const tituloInput = document.getElementById("titulo");
const conteudoInput = document.getElementById("conteudo");
const imagemInput = document.getElementById("imagem");
const linkInput = document.getElementById("link");

noticiaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const docRef = await addDoc(collection(db, "noticias"), {
      titulo: tituloInput.value,
      conteudo: conteudoInput.value,
      imagem: imagemInput.value,
      link: linkInput.value || ""
    });

    alert("Notícia adicionada com sucesso!");
    noticiaForm.reset();
  } catch (error) {
    alert("Erro ao adicionar notícia: " + error.message);
  }
});

