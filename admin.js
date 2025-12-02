import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail, signOut, isSignInWithEmailLink } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
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

// Login
const loginBox = document.getElementById("login-box");
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const loginMsg = document.getElementById("login-msg");

const adminPanel = document.getElementById("admin-panel");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  if(!email) return loginMsg.textContent = "Digite o e-mail";
  
  try {
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    loginMsg.textContent = "Link enviado! Verifique seu e-mail.";
  } catch(e) {
    loginMsg.textContent = e.message;
  }
});

onAuthStateChanged(auth, user => {
  if(user){
    loginBox.style.display="none";
    adminPanel.style.display="flex";
    carregarNoticias();
  } else if(isSignInWithEmailLink(auth, window.location.href)){
    let email = window.localStorage.getItem('emailForSignIn');
    if(!email) email = window.prompt('Digite seu e-mail para confirmar login');
    signInWithEmailLink(auth, email, window.location.href)
      .then(result => {
        window.localStorage.removeItem('emailForSignIn');
      });
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

// Menu navegação
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    document.querySelectorAll(".section").forEach(sec => sec.style.display="none");
    const sec = document.getElementById(btn.dataset.section+"-section");
    sec.style.display="block";
  });
});

// Nova notícia
const novaBtn = document.getElementById("nova-noticia-btn");
const formNova = document.getElementById("form-nova-noticia");
novaBtn.addEventListener("click", ()=> formNova.style.display="block");

// Salvar notícia
document.getElementById("salvar-noticia-btn").addEventListener("click", async () => {
  const titulo = document.getElementById("noticia-titulo").value;
  const conteudo = document.getElementById("noticia-conteudo").value;
  const imagem = document.getElementById("noticia-imagem").value;
  const link = document.getElementById("noticia-link").value;

  if(!titulo || !conteudo || !imagem) return alert("Preencha todos os campos obrigatórios");

  try{
    await addDoc(collection(db, "noticias"), { titulo, conteudo, imagem, link });
    alert("Notícia salva!");
    formNova.style.display="none";
    document.getElementById("noticia-titulo").value="";
    document.getElementById("noticia-conteudo").value="";
    document.getElementById("noticia-imagem").value="";
    document.getElementById("noticia-link").value="";
    carregarNoticias();
  } catch(e){
    alert("Erro ao salvar notícia: "+e.message);
  }
});

// Carregar notícias existentes
async function carregarNoticias(){
  const lista = document.getElementById("noticias-lista");
  lista.innerHTML="";
  const querySnapshot = await getDocs(collection(db, "noticias"));
  querySnapshot.forEach(doc=>{
    const data = doc.data();
    const div = document.createElement("div");
    div.className="noticia-item";
    div.innerHTML=`<h4>${data.titulo}</h4><p>${data.conteudo}</p>`;
    lista.appendChild(div);
  });
}
