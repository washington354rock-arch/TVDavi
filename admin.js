// =============================
// INICIALIZAÇÃO DO FIREBASE
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.24.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.24.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.24.0/firebase-firestore.js";

// Config do Firebase
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

// =============================
// LOGIN
// =============================
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("senha").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`Bem-vindo, ${userCredential.user.email}!`);
      window.location.href = "dashboard.html"; // Redireciona para dashboard do painel
    } catch (error) {
      console.error(error);
      alert("Erro ao entrar: " + error.message);
    }
  });
}

// =============================
// ADICIONAR NOTÍCIAS
// =============================
const noticiaForm = document.getElementById("noticia-form");
if (noticiaForm) {
  noticiaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const conteudo = document.getElementById("conteudo").value;
    const imagem = document.getElementById("imagem").value; // URL da imagem

    try {
      await addDoc(collection(db, "noticias"), {
        titulo: titulo,
        conteudo: conteudo,
        imagem: imagem,
        criadoEm: new Date()
      });
      alert("Notícia adicionada com sucesso!");
      noticiaForm.reset();
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar notícia: " + error.message);
    }
  });
}
