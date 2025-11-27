fetch('noticias.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('noticias-container');
    data.forEach(noticia => {
      const artigo = document.createElement('article');
      artigo.classList.add('noticia');
      artigo.innerHTML = `
        <h3>${noticia.titulo}</h3>
        <p>${noticia.conteudo}</p>
      `;
      container.appendChild(artigo);
    });
  })
  .catch(err => console.error('Erro ao carregar notícias:', err));
