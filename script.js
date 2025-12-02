// =============================
// INICIALIZAÇÃO DO FIREBASE
// =============================
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.16.0/firebase-firestore.js";

// db já foi inicializado no index.html e está disponível como window.db
const db = window.db;

// =============================
// CARREGAR NOTÍCIAS DO FIRESTORE
// =============================
async function carregarNoticias() {
  try {
    const container = document.getElementById('noticias-container');
    container.innerHTML = ""; // limpa antes de carregar

    // Seleciona a coleção 'noticias'
    const querySnapshot = await getDocs(collection(db, "noticias"));

    querySnapshot.forEach((doc) => {
      const noticia = doc.data(); // pega os dados do documento

      // Cria o card da notícia
      const card = document.createElement('article');
      card.classList.add('card'); // usa seu CSS de card

      card.innerHTML = `
        <img src="${noticia.imagem}" alt="${noticia.titulo}" class="noticia-img">
        <div class="card-content">
          <h3>${noticia.titulo}</h3>
          <p>${noticia.conteudo}</p>
          ${noticia.link ? `<a href="${noticia.link}" target="_blank">Leia mais</a>` : ""}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar notícias:", err);
    const container = document.getElementById('noticias-container');
    container.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
  }
}

// Chama a função para carregar notícias ao abrir a página
carregarNoticias();

// =============================
// BOTÃO MODO ESCURO
// =============================
const botaoModo = document.getElementById("modo-btn");

botaoModo.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    botaoModo.textContent = "☀️ Modo claro";
  } else {
    botaoModo.textContent = "🌙 Modo escuro";
  }
});
