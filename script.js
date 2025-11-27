const apiKey = "65b1c743f56b44e5b7d25190e5a2c84c";
const url = `https://newsapi.org/v2/top-headlines?country=br&apiKey=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('noticias-container');
    if (!data.articles || data.articles.length === 0) {
      container.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
      return;
    }
    data.articles.forEach(article => {
      const card = document.createElement('article');
      card.classList.add('noticia');
      card.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.description || ""}</p>
        <a href="${article.url}" target="_blank">Leia mais</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Erro ao buscar notícias:", err);
    const container = document.getElementById('noticias-container');
    container.innerHTML = "<p>Erro ao carregar notícias.</p>";
  });
