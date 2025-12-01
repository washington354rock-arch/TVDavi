// =============================
// CARREGAR NOTÍCIAS DO ADM
// =============================

const noticiasADM = JSON.parse(localStorage.getItem("noticias")) || [];

// =============================
// CARREGAR JSON PADRÃO
// =============================

fetch('noticias.json')
  .then(response => response.json())
  .then(data => {

    // Junta notícias do ADM + JSON
    const todasNoticias = [...noticiasADM, ...data];

    const container = document.getElementById('noticias-container');

    // Limpa container antes de renderizar
    container.innerHTML = "";

    todasNoticias.forEach(noticia => {

      const card = document.createElement('article');
      card.classList.add('card');

      card.innerHTML = `
        <img src="${noticia.imagem}" alt="${noticia.titulo}" class="noticia-img">
        <div class="card-content">
          <h3>${noticia.titulo}</h3>
          <p>${noticia.descricao || noticia.conteudo}</p>
          <a href="${noticia.link || '#'}" target="_blank">Leia mais</a>
        </div>
      `;

      container.appendChild(card);

    });

  })
  .catch(err => {
    console.error('Erro ao carregar notícias:', err);

    const container = document.getElementById('noticias-container');

    // Mesmo se der erro no JSON, mostra as do ADM
    if(noticiasADM.length){

      noticiasADM.forEach(noticia => {

        const card = document.createElement('article');
        card.classList.add('card');

        card.innerHTML = `
          <img src="${noticia.imagem}">
          <div class="card-content">
            <h3>${noticia.titulo}</h3>
            <p>${noticia.descricao}</p>
          </div>
        `;

        container.appendChild(card);

      });

    } else {

      container.innerHTML = "<p>Não foi possível carregar as notícias.</p>";

    }
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
