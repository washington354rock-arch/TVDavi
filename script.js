import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBg6BMcZXfCPX6V0_WhTIbQf4m8pWbUCUU",
  authDomain: "tvdavi-fd587.firebaseapp.com",
  projectId: "tvdavi-fd587",
  storageBucket: "tvdavi-fd587.firebasestorage.app",
  messagingSenderId: "1908490170",
  appId: "1:1908490170:web:475a8fc629f79883ef6783"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("noticias-container");

async function carregarNoticias() {
  container.innerHTML = "";

  const q = query(collection(db, "noticias"), orderBy("data", "desc"));
  const snap = await getDocs(q);

  snap.forEach(doc => {
    const n = doc.data();

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${n.imagem}">
      <div class="card-content">
        <h3>${n.titulo}</h3>
        <p>${n.conteudo}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

carregarNoticias();

