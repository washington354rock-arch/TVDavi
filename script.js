fetch('noticias.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('noticias-container');
    data.forEach(noticia => {
      const card = document.createElement('article');
      card.classList.add('noticia');
      card.innerHTML = `
        <img src="${noticia.imagem}" alt="${noticia.titulo}" class="noticia-img">
        <h3>${noticia.titulo}</h3>
        <p>${noticia.conteudo}</p>
        <a href="${noticia.link}" target="_blank">Leia mais</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar notícias:', err);
    const container = document.getElementById('noticias-container');
    container.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
  });
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
