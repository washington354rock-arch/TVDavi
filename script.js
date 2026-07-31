// =============================
// MODO ESCURO
// =============================
const botaoModo = document.getElementById("modo-btn");

if (botaoModo) {
  botaoModo.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    botaoModo.textContent = document.body.classList.contains("dark")
      ? "☀️ Modo claro"
      : "🌙 Modo escuro";
  });
}

// =============================
// DATAS
// =============================
function calcularTempo(dataPublicacao) {
  if (!dataPublicacao) return "";

  const partes = dataPublicacao.split("-");
  const data = new Date(partes[0], partes[1] - 1, partes[2]);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);
  data.setHours(0, 0, 0, 0);

  const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff > 1) return `Há ${diff} dias`;

  return "";
}

function formatarData(dataPublicacao) {
  if (!dataPublicacao) return "";

  const partes = dataPublicacao.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarDatasRelativas() {
  document.querySelectorAll(".data-noticia").forEach((elemento) => {
    const data = elemento.getAttribute("data-data");

    if (data) {
      elemento.textContent = `${calcularTempo(data)} - em Feira de Santana e Região`;
    }
  });
}

function atualizarTitulo() {
  if (!document.getElementById("noticias-container")) return;

  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();

  document.title = `TVDavi - Notícias ${dia}/${mes}/${ano}`;
}

// =============================
// NOTICIAS DINAMICAS
// =============================
async function buscarNoticias() {
  const resposta = await fetch("noticias.json", { cache: "no-store" });

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar noticias.json");
  }

  return resposta.json();
}

function criarCardNoticia(noticia) {
  const link = noticia.link || `noticia.html?id=${encodeURIComponent(noticia.id)}`;
  const tempo = calcularTempo(noticia.data);
  const categoria = noticia.categoria ? `<span class="categoria-noticia">${noticia.categoria}</span>` : "";

  return `
    <article class="card noticia">
      <img src="${noticia.imagem}" alt="${noticia.titulo}">
      <div class="texto">
        <div class="meta-card">${categoria}</div>
        <a href="${link}">
          <h3>${noticia.titulo}</h3>
        </a>
        <p>${noticia.resumo}</p>
        <p class="data-noticia" data-data="${noticia.data}">${tempo} - em Feira de Santana e Região</p>
      </div>
    </article>
  `;
}

async function carregarNoticiasIndex() {
  const container = document.getElementById("noticias-container");
  if (!container) return;

  try {
    const noticias = await buscarNoticias();
    const ordenadas = noticias.sort((a, b) => new Date(b.data) - new Date(a.data));
    container.innerHTML = ordenadas.map(criarCardNoticia).join("");
  } catch (erro) {
    container.innerHTML = "<p class='erro-carregamento'>Não foi possível carregar as notícias.</p>";
    console.error(erro);
  }
}

function normalizarYoutube(url) {
  if (!url) return "";

  try {
    const endereco = new URL(url);

    if (endereco.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${endereco.pathname.replace("/", "")}`;
    }

    if (endereco.hostname.includes("youtube.com")) {
      const videoId = endereco.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (endereco.pathname.includes("/embed/")) return url;
    }
  } catch (erro) {
    return "";
  }

  return "";
}

function normalizarVideoG1(url) {
  if (!url) return "";

  try {
    const endereco = new URL(url);
    const host = endereco.hostname.replace(/^www\./, "");
    const caminho = endereco.pathname;
    const ehG1 = host === "g1.globo.com" || host.endsWith(".g1.globo.com");
    const ehVideoG1 = caminho.includes("/video/") && caminho.endsWith(".ghtml");

    if (["http:", "https:"].includes(endereco.protocol) && ehG1 && ehVideoG1) {
      return endereco.toString();
    }
  } catch (erro) {
    return "";
  }

  return "";
}

function renderizarIframeVideo(src, titulo) {
  return `
    <div class="video-container">
      <iframe
        src="${src}"
        title="${titulo}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function ehVideoYouTubeOuG1(url) {
  return Boolean(normalizarYoutube(url) || normalizarVideoG1(url));
}

function renderizarVideoNoticia(url) {
  if (!url) return "";

  const videoYoutube = normalizarYoutube(url);
  if (videoYoutube) {
    return renderizarIframeVideo(videoYoutube, "Vídeo da notícia");
  }

  const videoG1 = normalizarVideoG1(url);
  if (videoG1) {
    return renderizarIframeVideo(videoG1, "Reportagem TVDavi");
  }

  try {
    const endereco = new URL(url);
    if (!["http:", "https:"].includes(endereco.protocol)) return "";

    return `
      <div class="video-link-noticia">
        <strong>Vídeo da notícia</strong>
        <a href="${endereco.toString()}" target="_blank" rel="noopener noreferrer">Assistir vídeo no site original</a>
      </div>
    `;
  } catch (erro) {
    return "";
  }
}
function limparHtmlBasico(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const permitidas = ["STRONG", "B", "EM", "I", "S", "MARK", "SPAN", "A", "BR", "UL", "OL", "LI", "H2", "H3"];
  const classesPermitidas = ["texto-vermelho", "texto-azul", "texto-cinza", "destaque"];

  template.content.querySelectorAll("*").forEach((elemento) => {
    if (!permitidas.includes(elemento.tagName)) {
      elemento.replaceWith(document.createTextNode(elemento.textContent));
      return;
    }

    [...elemento.attributes].forEach((atributo) => {
      const nome = atributo.name.toLowerCase();

      if (elemento.tagName === "A" && ["href", "target", "rel"].includes(nome)) return;
      if (nome === "class") {
        const classes = atributo.value.split(" ").filter((classe) => classesPermitidas.includes(classe));
        if (classes.length) elemento.setAttribute("class", classes.join(" "));
        else elemento.removeAttribute("class");
        return;
      }

      elemento.removeAttribute(atributo.name);
    });

    if (elemento.tagName === "A") {
      const href = elemento.getAttribute("href") || "";
      const linkPermitido = href.startsWith("https://") || href.startsWith("http://") || href.startsWith("mailto:");

      if (!linkPermitido) {
        elemento.removeAttribute("href");
      }

      elemento.setAttribute("target", "_blank");
      elemento.setAttribute("rel", "noopener noreferrer");
    }
  });

  return template.innerHTML;
}

function renderizarVideoNoConteudo(texto) {
  const marcador = texto.match(/^\[video:(.+?)\]$/i);
  if (!marcador) return "";

  return renderizarVideoNoticia(marcador[1].trim());
}

function renderizarImagemNoConteudo(texto) {
  const marcador = texto.match(/^\[imagem:(.+?)(?:\|(.*))?\]$/);
  if (!marcador) return "";

  const src = marcador[1].trim();
  const legenda = marcador[2] ? limparHtmlBasico(marcador[2].trim()) : "";

  if (!src || src.includes("javascript:")) return "";

  return `
    <figure class="imagem-conteudo">
      <img src="${src}" alt="${legenda || "Imagem da notícia"}">
      ${legenda ? `<figcaption>${legenda}</figcaption>` : ""}
    </figure>
  `;
}

function ehBlocoHtmlConteudo(texto) {
  return /^<(ul|ol|h2|h3)(\s|>)/i.test(texto);
}

function renderizarConteudo(conteudo) {
  if (!Array.isArray(conteudo) || conteudo.length === 0) {
    return "<p>Conteúdo completo em preparação.</p>";
  }

  return conteudo
    .map((paragrafo) => {
      const texto = String(paragrafo || "").trim();
      const video = renderizarVideoNoConteudo(texto);
      if (video) return video;

      const imagem = renderizarImagemNoConteudo(texto);
      if (imagem) return imagem;

      const htmlLimpo = limparHtmlBasico(texto);
      if (ehBlocoHtmlConteudo(htmlLimpo)) return htmlLimpo;
      return `<p>${htmlLimpo}</p>`;
    })
    .join("");
}

async function carregarNoticiaDetalhe() {
  const container = document.getElementById("noticia-detalhe");
  if (!container) return;

  const parametros = new URLSearchParams(window.location.search);
  const id = Number(parametros.get("id"));

  if (!id) {
    container.innerHTML = "<p>Notícia não encontrada.</p><p><a href='index.html'>⬅ Voltar para a página inicial</a></p>";
    return;
  }

  try {
    const noticias = await buscarNoticias();
    const noticia = noticias.find((item) => Number(item.id) === id);

    if (!noticia) {
      container.innerHTML = "<p>Notícia não encontrada.</p><p><a href='index.html'>⬅ Voltar para a página inicial</a></p>";
      return;
    }

    document.title = `${noticia.titulo} - TV Davi`;

    const blocoVideo = renderizarVideoNoticia(noticia.videoYoutube);
    const blocoImagemPrincipal = noticia.imagemSomenteCard
      ? ""
      : `
      <figure class="imagem-principal-bloco">
        <img src="${noticia.imagem}" alt="${noticia.titulo}" class="imagem-primaria">
        ${noticia.legendaImagem ? `<figcaption>${limparHtmlBasico(noticia.legendaImagem)}</figcaption>` : ""}
      </figure>`;
    const blocoFonte = noticia.linkFonte
      ? `<p class="fonte-noticia">Fonte: <a href="${noticia.linkFonte}" target="_blank" rel="noopener noreferrer">${noticia.fonte || "Ler notícia original"}</a></p>`
      : "";

    container.innerHTML = `
      <h1>${noticia.titulo}</h1>
      <p>${noticia.resumo}</p>
      <p class="data">Publicado em ${formatarData(noticia.data)}</p>
      ${blocoImagemPrincipal}
      ${blocoVideo}
      ${renderizarConteudo(noticia.conteudo)}
      ${blocoFonte}
      <p><a href="index.html">⬅ Voltar para a página inicial</a></p>
    `;
  } catch (erro) {
    container.innerHTML = "<p>Não foi possível carregar a notícia.</p>";
    console.error(erro);
  }
}


// =============================
// EMPREGOS DINAMICOS
// =============================
async function buscarEmpregos() {
  const resposta = await fetch("empregos.json", { cache: "no-store" });

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar empregos.json");
  }

  return resposta.json();
}

function criarCardEmprego(emprego) {
  const link = emprego.link || `emprego.html?id=${encodeURIComponent(emprego.id)}`;
  const tempo = calcularTempo(emprego.data);

  return `
    <article class="card noticia">
      <img src="${emprego.imagem}" alt="${emprego.titulo}">
      <div class="texto">
        <div class="meta-card"><span class="categoria-noticia">Empregos</span></div>
        <a href="${link}">
          <h3>${emprego.titulo}</h3>
        </a>
        <p>${emprego.resumo}</p>
        <p class="data-noticia" data-data="${emprego.data}">${tempo} - em Feira de Santana e Região</p>
      </div>
    </article>
  `;
}

async function carregarEmpregosLista() {
  const container = document.getElementById("empregos-container");
  if (!container) return;

  try {
    const empregos = await buscarEmpregos();
    const ordenados = empregos.sort((a, b) => new Date(b.data) - new Date(a.data));
    container.innerHTML = ordenados.length
      ? ordenados.map(criarCardEmprego).join("")
      : "<p class='carregando'>Nenhuma vaga publicada no momento.</p>";
  } catch (erro) {
    container.innerHTML = "<p class='erro-carregamento'>Não foi possível carregar as vagas.</p>";
    console.error(erro);
  }
}

async function carregarEmpregoDetalhe() {
  const container = document.getElementById("emprego-detalhe");
  if (!container) return;

  const parametros = new URLSearchParams(window.location.search);
  const id = Number(parametros.get("id"));

  if (!id) {
    container.innerHTML = "<p>Vaga não encontrada.</p><p><a href='empregos.html'>⬅ Voltar para empregos</a></p>";
    return;
  }

  try {
    const empregos = await buscarEmpregos();
    const emprego = empregos.find((item) => Number(item.id) === id);

    if (!emprego) {
      container.innerHTML = "<p>Vaga não encontrada.</p><p><a href='empregos.html'>⬅ Voltar para empregos</a></p>";
      return;
    }

    document.title = `${emprego.titulo} - TV Davi Empregos`;
    const blocoVideo = renderizarVideoNoticia(emprego.videoYoutube);
    const blocoImagemPrincipal = emprego.imagemSomenteCard
      ? ""
      : `
      <figure class="imagem-principal-bloco">
        <img src="${emprego.imagem}" alt="${emprego.titulo}" class="imagem-primaria">
        ${emprego.legendaImagem ? `<figcaption>${limparHtmlBasico(emprego.legendaImagem)}</figcaption>` : ""}
      </figure>`;
    const blocoFonte = emprego.linkFonte
      ? `<p class="fonte-noticia">Fonte/inscrição: <a href="${emprego.linkFonte}" target="_blank" rel="noopener noreferrer">${emprego.fonte || "Abrir link"}</a></p>`
      : "";

    container.innerHTML = `
      <h1>${emprego.titulo}</h1>
      <p>${emprego.resumo}</p>
      <p class="data">Publicado em ${formatarData(emprego.data)}</p>
      ${blocoImagemPrincipal}
      ${blocoVideo}
      ${renderizarConteudo(emprego.conteudo)}
      ${blocoFonte}
      <p><a href="empregos.html">⬅ Voltar para empregos</a></p>
    `;
  } catch (erro) {
    container.innerHTML = "<p>Não foi possível carregar a vaga.</p>";
    console.error(erro);
  }
}
// =============================
// PAINEL ADMIN COM VERCEL API
// =============================
function textoSelecionado(textarea) {
  return {
    inicio: textarea.selectionStart,
    fim: textarea.selectionEnd,
    valor: textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
  };
}

function envolverSelecao(textarea, abertura, fechamento) {
  const selecao = textoSelecionado(textarea);
  if (!selecao.valor) return;

  textarea.value =
    textarea.value.slice(0, selecao.inicio) +
    abertura +
    selecao.valor +
    fechamento +
    textarea.value.slice(selecao.fim);

  textarea.focus();
  textarea.selectionStart = selecao.inicio + abertura.length;
  textarea.selectionEnd = selecao.fim + abertura.length;
}

function inserirListaEditor(textarea, tipo) {
  const selecao = textoSelecionado(textarea);
  const tag = tipo === "ol" ? "ol" : "ul";
  const textoBase = selecao.valor || "Item da lista";
  const itens = textoBase
    .split(/\r?\n/)
    .map((linha) => linha.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  if (itens.length === 0) return;

  const lista = `<${tag}>\n${itens.map((item) => `  <li>${item}</li>`).join("\n")}\n</${tag}>`;
  const inicio = selecao.valor ? selecao.inicio : textarea.selectionStart;
  const fim = selecao.valor ? selecao.fim : textarea.selectionEnd;

  textarea.value = textarea.value.slice(0, inicio) + lista + textarea.value.slice(fim);
  textarea.focus();
  textarea.selectionStart = inicio;
  textarea.selectionEnd = inicio + lista.length;
}


function normalizarUrlEditor(urlDigitada) {
  const valor = String(urlDigitada || "").trim();
  if (!valor) return "";

  const comProtocolo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
  const url = new URL(comProtocolo);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Protocolo inválido.");
  }

  return url.toString();
}

function inserirLinkEditor(textarea) {
  const selecao = textoSelecionado(textarea);
  const texto = selecao.valor || "texto do link";
  const urlDigitada = prompt("Cole o link. Exemplo: https://site.com ou www.site.com");

  if (!urlDigitada) return;

  let url;
  try {
    url = normalizarUrlEditor(urlDigitada);
  } catch (erro) {
    alert("Link inválido. Use um endereço como https://site.com ou www.site.com");
    return;
  }

  const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${texto}</a>`;

  textarea.value =
    textarea.value.slice(0, selecao.inicio) +
    link +
    textarea.value.slice(selecao.fim);

  textarea.focus();
  textarea.selectionStart = selecao.inicio;
  textarea.selectionEnd = selecao.inicio + link.length;
}
function inserirTextoNoCursor(textarea, texto) {
  const inicio = textarea.selectionStart || textarea.value.length;
  const fim = textarea.selectionEnd || textarea.value.length;
  const antes = textarea.value.slice(0, inicio);
  const depois = textarea.value.slice(fim);
  const prefixo = antes.endsWith("\n\n") || antes.length === 0 ? "" : "\n\n";
  const sufixo = depois.startsWith("\n\n") || depois.length === 0 ? "" : "\n\n";

  textarea.value = `${antes}${prefixo}${texto}${sufixo}${depois}`;
  textarea.focus();
}

function normalizarCaminhoImagem(caminho) {
  const valor = String(caminho || "").trim();
  if (!valor) return "";
  if (/^(https?:|data:|img\/)/i.test(valor)) return valor;
  return `img/${valor.replace(/^\/+/, "")}`;
}

const LIMITE_UPLOAD_IMAGEM = 3 * 1024 * 1024;

function arquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = String(leitor.result || "");
      resolve(resultado.split(",")[1] || "");
    };
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

async function uploadImagemAdmin(arquivo) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    throw new Error("Digite a senha do painel antes de enviar imagem.");
  }

  if (!arquivo) {
    throw new Error("Escolha uma imagem primeiro.");
  }

  if (!arquivo.type || !arquivo.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem válido.");
  }

  if (arquivo.size > LIMITE_UPLOAD_IMAGEM) {
    throw new Error("Imagem muito grande. Use uma imagem com até 3 MB para o upload funcionar na Vercel.");
  }

  const conteudoBase64 = await arquivoParaBase64(arquivo);
  const resposta = await fetch("/api/upload-imagem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senha,
      nome: arquivo.name,
      tipo: arquivo.type,
      conteudoBase64
    })
  });

  const textoResposta = await resposta.text();
  let dados = {};

  try {
    dados = textoResposta ? JSON.parse(textoResposta) : {};
  } catch (erro) {
    dados = { erro: textoResposta };
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.detalhe || `Não foi possível enviar a imagem. Código ${resposta.status}.`);
  }

  if (!dados.caminho) {
    throw new Error("A imagem foi enviada, mas o caminho não voltou da API.");
  }

  return dados.caminho;
}
function obterSenhaAdmin() {
  return sessionStorage.getItem("tvdavi_admin_senha") || "";
}

function salvarSenhaAdmin(senha) {
  sessionStorage.setItem("tvdavi_admin_senha", senha);
}

function limparSenhaAdmin() {
  sessionStorage.removeItem("tvdavi_admin_senha");
}

function mostrarStatusAdmin(mensagem, tipo = "") {
  const loginAberto = !document.getElementById("admin-login")?.classList.contains("admin-escondido");
  const status = loginAberto
    ? document.getElementById("admin-login-status")
    : document.getElementById("admin-publicar-status");

  if (!status) return;

  status.textContent = mensagem;
  status.className = `admin-status ${tipo}`.trim();
}

function liberarPainelAdmin() {
  document.getElementById("admin-login")?.classList.add("admin-escondido");
  document.getElementById("admin-painel")?.classList.remove("admin-escondido");
}

function bloquearPainelAdmin() {
  document.getElementById("admin-login")?.classList.remove("admin-escondido");
  document.getElementById("admin-painel")?.classList.add("admin-escondido");
}

function montarNoticiaAdmin() {
  const titulo = document.getElementById("admin-titulo")?.value.trim();
  const resumo = document.getElementById("admin-resumo")?.value.trim();
  const imagem = normalizarCaminhoImagem(document.getElementById("admin-imagem")?.value.trim());
  const legendaImagem = document.getElementById("admin-legenda-imagem")?.value.trim();
  const imagemSomenteCard = document.getElementById("admin-imagem-somente-card")?.checked || false;
  const data = document.getElementById("admin-data")?.value;
  const categoria = document.getElementById("admin-categoria")?.value.trim();
  const videoYoutube = document.getElementById("admin-video")?.value.trim();
  const fonte = document.getElementById("admin-fonte")?.value.trim();
  const linkFonte = document.getElementById("admin-link-fonte")?.value.trim();
  const conteudoTexto = document.getElementById("admin-conteudo")?.value.trim();
  const id = Number(document.getElementById("form-admin")?.dataset.editandoId) || Date.now();

  return {
    id,
    titulo,
    resumo,
    imagem,
    legendaImagem,
    imagemSomenteCard,
    data,
    categoria,
    link: `noticia.html?id=${id}`,
    videoYoutube,
    fonte,
    linkFonte,
    conteudo: conteudoTexto
      ? conteudoTexto.split(/\n\s*\n/).map((paragrafo) => paragrafo.trim()).filter(Boolean)
      : []
  };
}

function mostrarResultadoAdmin(noticia) {
  const resultado = document.getElementById("admin-resultado");
  if (resultado) resultado.value = JSON.stringify(noticia, null, 2);
}

function mostrarPreviewAdmin(noticia) {
  const preview = document.getElementById("admin-preview");
  if (!preview) return;

  const imagemPreview = noticia.imagemSomenteCard
    ? ""
    : `
      <figure class="imagem-principal-bloco">
        <img src="${noticia.imagem}" alt="${noticia.titulo}">
        ${noticia.legendaImagem ? `<figcaption>${limparHtmlBasico(noticia.legendaImagem)}</figcaption>` : ""}
      </figure>`;

  preview.innerHTML = `
    <article class="noticia-preview-card">
      ${imagemPreview}
      <h3>${noticia.titulo}</h3>
      <p>${noticia.resumo}</p>
      <p class="data">Publicado em ${formatarData(noticia.data)}</p>
      ${renderizarVideoNoticia(noticia.videoYoutube)}
      ${renderizarConteudo(noticia.conteudo)}
    </article>
  `;
}

async function publicarNoticiasAdmin(noticias) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    mostrarStatusAdmin("Digite a senha do painel antes de publicar.", "erro");
    return;
  }

  if (!Array.isArray(noticias) || noticias.length === 0) {
    mostrarStatusAdmin("Adicione pelo menos um rascunho antes de publicar.", "erro");
    return;
  }

  mostrarStatusAdmin(`Publicando ${noticias.length} notícia(s)...`, "carregando");

  const resposta = await fetch("/api/publicar-noticia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, noticias })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível publicar as notícias.");
  }

  mostrarStatusAdmin("Rascunhos enviados para o GitHub em uma única publicação. A Vercel deve atualizar em alguns instantes.", "sucesso");
  return dados;
}

function criarItemAdminNoticia(noticia) {
  const link = noticia.link || `noticia.html?id=${encodeURIComponent(noticia.id)}`;
  const data = noticia.data ? formatarData(noticia.data) : "Sem data";

  return `
    <article class="admin-lista-item" data-id="${noticia.id}">
      <img src="${noticia.imagem}" alt="${noticia.titulo}">
      <div>
        <h3>${noticia.titulo}</h3>
        <p>${data}${noticia.categoria ? ` - ${noticia.categoria}` : ""}</p>
      </div>
      <div class="admin-lista-acoes">
        <a href="${link}" target="_blank" rel="noopener noreferrer">Abrir</a>
        <button type="button" class="btn-editar-noticia-publicada" data-id="${noticia.id}">Editar</button>
        <button type="button" class="btn-excluir-noticia" data-id="${noticia.id}" data-titulo="${noticia.titulo.replace(/"/g, "&quot;")}">Excluir</button>
      </div>
    </article>
  `;
}

async function carregarNoticiasAdmin() {
  const lista = document.getElementById("admin-lista-noticias");
  if (!lista) return;

  lista.innerHTML = "<p class='carregando'>Carregando notícias...</p>";

  try {
    const noticias = await buscarNoticias();
    const ordenadas = noticias.sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = ordenadas.length
      ? ordenadas.map(criarItemAdminNoticia).join("")
      : "<p class='carregando'>Nenhuma notícia cadastrada.</p>";
  } catch (erro) {
    lista.innerHTML = "<p class='erro-carregamento'>Não foi possível carregar as notícias.</p>";
    console.error(erro);
  }
}

async function editarNoticiaPublicadaAdmin(id) {
  try {
    const noticias = await buscarNoticias();
    const noticia = noticias.find((item) => Number(item.id) === Number(id));

    if (!noticia) {
      mostrarStatusAdmin("Notícia não encontrada para edição.", "erro");
      return;
    }

    preencherFormularioNoticiaAdmin(noticia, true);
    mostrarResultadoAdmin(noticia);
    mostrarPreviewAdmin(noticia);
    mostrarStatusAdmin("Notícia publicada carregada. Depois de ajustar, adicione aos rascunhos e publique para substituir a versão atual.", "sucesso");
    document.getElementById("form-admin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (erro) {
    console.error(erro);
    mostrarStatusAdmin("Não foi possível carregar a notícia para edição.", "erro");
  }
}
async function excluirNoticiaAdmin(id, titulo) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    mostrarStatusAdmin("Digite a senha do painel antes de excluir.", "erro");
    return;
  }

  const confirmou = confirm(`Excluir a notícia "${titulo}"? Essa ação remove do noticias.json no GitHub.`);
  if (!confirmou) return;

  mostrarStatusAdmin("Excluindo notícia...", "carregando");

  const resposta = await fetch("/api/excluir-noticia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, id })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível excluir a notícia.");
  }

  mostrarStatusAdmin("Notícia removida do GitHub. A Vercel deve atualizar o site em alguns instantes.", "sucesso");
  await carregarNoticiasAdmin();
}

function obterRascunhosAdmin() {
  try {
    return JSON.parse(localStorage.getItem("tvdavi_rascunhos") || "[]");
  } catch (erro) {
    return [];
  }
}

function salvarRascunhosAdmin(rascunhos) {
  localStorage.setItem("tvdavi_rascunhos", JSON.stringify(rascunhos));
}

function criarItemRascunhoAdmin(noticia, indice) {
  return `
    <article class="admin-lista-item">
      <img src="${noticia.imagem}" alt="${noticia.titulo}">
      <div>
        <h3>${noticia.titulo}</h3>
        <p>${formatarData(noticia.data)}${noticia.categoria ? ` - ${noticia.categoria}` : ""}</p>
      </div>
      <div class="admin-lista-acoes">
        <button type="button" class="btn-editar-rascunho" data-indice="${indice}">Editar</button>
        <button type="button" class="btn-preview-rascunho" data-indice="${indice}">Prévia</button>
        <button type="button" class="btn-remover-rascunho" data-indice="${indice}">Remover</button>
      </div>
    </article>
  `;
}

function renderizarRascunhosAdmin() {
  const lista = document.getElementById("admin-lista-rascunhos");
  if (!lista) return;

  const rascunhos = obterRascunhosAdmin();
  lista.innerHTML = rascunhos.length
    ? rascunhos.map(criarItemRascunhoAdmin).join("")
    : "<p class='carregando'>Nenhum rascunho adicionado.</p>";
}


function valorConteudoAdmin(conteudo) {
  return Array.isArray(conteudo) ? conteudo.join("\n\n") : String(conteudo || "");
}

function definirValorCampo(id, valor) {
  const campo = document.getElementById(id);
  if (campo) campo.value = valor || "";
}

function definirCheckboxCampo(id, valor) {
  const campo = document.getElementById(id);
  if (campo) campo.checked = Boolean(valor);
}

function atualizarModoEdicaoNoticiaAdmin(editandoPublicado = false) {
  const botaoSalvar = document.getElementById("btn-salvar-edicao-noticia");
  const botaoRascunho = document.getElementById("btn-adicionar-rascunho");

  if (botaoSalvar) botaoSalvar.classList.toggle("admin-escondido", !editandoPublicado);
  if (botaoRascunho) botaoRascunho.textContent = editandoPublicado ? "Salvar nos rascunhos" : "Adicionar aos rascunhos";
}

function atualizarModoEdicaoEmpregoAdmin(editandoPublicado = false) {
  const botaoSalvar = document.getElementById("btn-salvar-edicao-emprego");
  const botaoRascunho = document.getElementById("btn-adicionar-emprego-rascunho");

  if (botaoSalvar) botaoSalvar.classList.toggle("admin-escondido", !editandoPublicado);
  if (botaoRascunho) botaoRascunho.textContent = editandoPublicado ? "Salvar vaga nos rascunhos" : "Adicionar vaga aos rascunhos";
}
function preencherFormularioNoticiaAdmin(noticia, publicado = false) {
  const form = document.getElementById("form-admin");
  if (form) {
    form.dataset.editandoId = noticia.id || "";
    form.dataset.editandoPublicado = publicado ? "true" : "";
  }
  atualizarModoEdicaoNoticiaAdmin(publicado);
  definirValorCampo("admin-titulo", noticia.titulo);
  definirValorCampo("admin-resumo", noticia.resumo);
  definirValorCampo("admin-imagem", noticia.imagem);
  definirValorCampo("admin-legenda-imagem", noticia.legendaImagem);
  definirCheckboxCampo("admin-imagem-somente-card", noticia.imagemSomenteCard);
  definirValorCampo("admin-data", noticia.data);
  definirValorCampo("admin-categoria", noticia.categoria);
  definirValorCampo("admin-video", noticia.videoYoutube);
  definirValorCampo("admin-fonte", noticia.fonte);
  definirValorCampo("admin-link-fonte", noticia.linkFonte);
  definirValorCampo("admin-conteudo", valorConteudoAdmin(noticia.conteudo));
  document.getElementById("admin-titulo")?.focus();
}

function preencherFormularioEmpregoAdmin(emprego, publicado = false) {
  const form = document.getElementById("form-emprego-admin");
  if (form) {
    form.dataset.editandoId = emprego.id || "";
    form.dataset.editandoPublicado = publicado ? "true" : "";
  }
  atualizarModoEdicaoEmpregoAdmin(publicado);
  definirValorCampo("emprego-titulo", emprego.titulo);
  definirValorCampo("emprego-resumo", emprego.resumo);
  definirValorCampo("emprego-imagem", emprego.imagem);
  definirValorCampo("emprego-legenda-imagem", emprego.legendaImagem);
  definirCheckboxCampo("emprego-imagem-somente-card", emprego.imagemSomenteCard);
  definirValorCampo("emprego-data", emprego.data);
  definirValorCampo("emprego-video", emprego.videoYoutube);
  definirValorCampo("emprego-fonte", emprego.fonte);
  definirValorCampo("emprego-link-fonte", emprego.linkFonte);
  definirValorCampo("emprego-conteudo", valorConteudoAdmin(emprego.conteudo));
  document.getElementById("emprego-titulo")?.focus();
}

function editarRascunhoNoticiaAdmin(indice) {
  const rascunhos = obterRascunhosAdmin();
  const noticia = rascunhos[indice];
  if (!noticia) return;

  preencherFormularioNoticiaAdmin(noticia);
  rascunhos.splice(indice, 1);
  salvarRascunhosAdmin(rascunhos);
  renderizarRascunhosAdmin();
  mostrarResultadoAdmin(noticia);
  mostrarPreviewAdmin(noticia);
  mostrarStatusAdmin("Rascunho carregado para edição. Ajuste e adicione aos rascunhos novamente.", "sucesso");
}

function editarRascunhoEmpregoAdmin(indice) {
  const rascunhos = obterEmpregosRascunhosAdmin();
  const emprego = rascunhos[indice];
  if (!emprego) return;

  preencherFormularioEmpregoAdmin(emprego);
  rascunhos.splice(indice, 1);
  salvarEmpregosRascunhosAdmin(rascunhos);
  renderizarEmpregosRascunhosAdmin();
  mostrarResultadoAdmin(emprego);
  mostrarPreviewAdmin(emprego);
  mostrarStatusAdmin("Rascunho de emprego carregado para edição. Ajuste e adicione aos rascunhos novamente.", "sucesso");
}
function adicionarRascunhoAdmin(noticia) {
  const rascunhos = obterRascunhosAdmin();
  rascunhos.push(noticia);
  salvarRascunhosAdmin(rascunhos);
  renderizarRascunhosAdmin();
  mostrarStatusAdmin("Notícia adicionada aos rascunhos. Publique quando terminar todas.", "sucesso");
}

function removerRascunhoAdmin(indice) {
  const rascunhos = obterRascunhosAdmin();
  rascunhos.splice(indice, 1);
  salvarRascunhosAdmin(rascunhos);
  renderizarRascunhosAdmin();
}

function montarEmpregoAdmin() {
  const titulo = document.getElementById("emprego-titulo")?.value.trim();
  const resumo = document.getElementById("emprego-resumo")?.value.trim();
  const imagem = normalizarCaminhoImagem(document.getElementById("emprego-imagem")?.value.trim());
  const legendaImagem = document.getElementById("emprego-legenda-imagem")?.value.trim();
  const imagemSomenteCard = document.getElementById("emprego-imagem-somente-card")?.checked || false;
  const data = document.getElementById("emprego-data")?.value;
  const videoYoutube = document.getElementById("emprego-video")?.value.trim();
  const fonte = document.getElementById("emprego-fonte")?.value.trim();
  const linkFonte = document.getElementById("emprego-link-fonte")?.value.trim();
  const conteudoTexto = document.getElementById("emprego-conteudo")?.value.trim();
  const id = Number(document.getElementById("form-emprego-admin")?.dataset.editandoId) || Date.now();

  return {
    id,
    titulo,
    resumo,
    imagem,
    legendaImagem,
    imagemSomenteCard,
    data,
    categoria: "Empregos",
    link: `emprego.html?id=${id}`,
    videoYoutube,
    fonte,
    linkFonte,
    conteudo: conteudoTexto
      ? conteudoTexto.split(/\n\s*\n/).map((paragrafo) => paragrafo.trim()).filter(Boolean)
      : []
  };
}


function criarItemAdminEmprego(emprego) {
  const link = emprego.link || `emprego.html?id=${encodeURIComponent(emprego.id)}`;
  const data = emprego.data ? formatarData(emprego.data) : "Sem data";

  return `
    <article class="admin-lista-item" data-id="${emprego.id}">
      <img src="${emprego.imagem}" alt="${emprego.titulo}">
      <div>
        <h3>${emprego.titulo}</h3>
        <p>${data} - Empregos</p>
      </div>
      <div class="admin-lista-acoes">
        <a href="${link}" target="_blank" rel="noopener noreferrer">Abrir</a>
        <button type="button" class="btn-editar-emprego-publicado" data-id="${emprego.id}">Editar</button>
        <button type="button" class="btn-excluir-emprego" data-id="${emprego.id}" data-titulo="${emprego.titulo.replace(/"/g, "&quot;")}">Excluir</button>
      </div>
    </article>
  `;
}

async function carregarEmpregosAdmin() {
  const lista = document.getElementById("admin-lista-empregos-publicados");
  if (!lista) return;

  lista.innerHTML = "<p class='carregando'>Carregando vagas...</p>";

  try {
    const empregos = await buscarEmpregos();
    const ordenados = empregos.sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = ordenados.length
      ? ordenados.map(criarItemAdminEmprego).join("")
      : "<p class='carregando'>Nenhuma vaga cadastrada.</p>";
  } catch (erro) {
    lista.innerHTML = "<p class='erro-carregamento'>Não foi possível carregar as vagas.</p>";
    console.error(erro);
  }
}

async function editarEmpregoPublicadoAdmin(id) {
  try {
    const empregos = await buscarEmpregos();
    const emprego = empregos.find((item) => Number(item.id) === Number(id));

    if (!emprego) {
      mostrarStatusAdmin("Vaga não encontrada para edição.", "erro");
      return;
    }

    preencherFormularioEmpregoAdmin(emprego, true);
    mostrarResultadoAdmin(emprego);
    mostrarPreviewAdmin(emprego);
    mostrarStatusAdmin("Vaga publicada carregada. Depois de ajustar, adicione aos rascunhos e publique para substituir a versão atual.", "sucesso");
    document.getElementById("form-emprego-admin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (erro) {
    console.error(erro);
    mostrarStatusAdmin("Não foi possível carregar a vaga para edição.", "erro");
  }
}
async function excluirEmpregoAdmin(id, titulo) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    mostrarStatusAdmin("Digite a senha do painel antes de excluir.", "erro");
    return;
  }

  const confirmou = confirm(`Excluir a vaga "${titulo}"? Essa ação remove do empregos.json no GitHub.`);
  if (!confirmou) return;

  mostrarStatusAdmin("Excluindo vaga...", "carregando");

  const resposta = await fetch("/api/excluir-emprego", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, id })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível excluir a vaga.");
  }

  mostrarStatusAdmin("Vaga removida do GitHub. A Vercel deve atualizar o site em alguns instantes.", "sucesso");
  await carregarEmpregosAdmin();
}
function obterEmpregosRascunhosAdmin() {
  try {
    return JSON.parse(localStorage.getItem("tvdavi_empregos_rascunhos") || "[]");
  } catch (erro) {
    return [];
  }
}

function salvarEmpregosRascunhosAdmin(rascunhos) {
  localStorage.setItem("tvdavi_empregos_rascunhos", JSON.stringify(rascunhos));
}

function renderizarEmpregosRascunhosAdmin() {
  const lista = document.getElementById("admin-lista-empregos-rascunhos");
  if (!lista) return;

  const rascunhos = obterEmpregosRascunhosAdmin();
  lista.innerHTML = rascunhos.length
    ? rascunhos.map(criarItemRascunhoAdmin).join("")
    : "<p class='carregando'>Nenhuma vaga adicionada.</p>";
}

function adicionarEmpregoRascunhoAdmin(emprego) {
  const rascunhos = obterEmpregosRascunhosAdmin();
  rascunhos.push(emprego);
  salvarEmpregosRascunhosAdmin(rascunhos);
  renderizarEmpregosRascunhosAdmin();
  mostrarStatusAdmin("Vaga adicionada aos rascunhos de empregos.", "sucesso");
}

async function publicarEmpregosAdmin(empregos) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    mostrarStatusAdmin("Digite a senha do painel antes de publicar vagas.", "erro");
    return;
  }

  if (!Array.isArray(empregos) || empregos.length === 0) {
    mostrarStatusAdmin("Adicione pelo menos uma vaga antes de publicar.", "erro");
    return;
  }

  mostrarStatusAdmin(`Publicando ${empregos.length} vaga(s)...`, "carregando");

  const resposta = await fetch("/api/publicar-emprego", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, empregos })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível publicar as vagas.");
  }

  mostrarStatusAdmin("Vagas enviadas ao GitHub em uma única publicação.", "sucesso");
  return dados;
}
function iniciarAdmin() {
  const form = document.getElementById("form-admin");
  const conteudo = document.getElementById("admin-conteudo");
  const login = document.getElementById("admin-login");
  if (!login && (!form || !conteudo)) return;

  if (obterSenhaAdmin()) {
    liberarPainelAdmin();
    carregarNoticiasAdmin();
    carregarEmpregosAdmin();
    renderizarRascunhosAdmin();
    renderizarEmpregosRascunhosAdmin();
  } else {
    bloquearPainelAdmin();
  }

  document.getElementById("btn-entrar-admin")?.addEventListener("click", () => {
    const senha = document.getElementById("admin-senha")?.value.trim();

    if (!senha) {
      mostrarStatusAdmin("Informe a senha para liberar o painel.", "erro");
      return;
    }

    salvarSenhaAdmin(senha);
    liberarPainelAdmin();
    carregarNoticiasAdmin();
    carregarEmpregosAdmin();
    renderizarRascunhosAdmin();
    renderizarEmpregosRascunhosAdmin();
    mostrarStatusAdmin("Painel liberado. A senha será conferida pela Vercel na hora de publicar ou excluir.", "sucesso");
  });

  document.getElementById("admin-senha")?.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") document.getElementById("btn-entrar-admin")?.click();
  });

  document.getElementById("btn-sair-admin")?.addEventListener("click", () => {
    limparSenhaAdmin();
    bloquearPainelAdmin();
    mostrarStatusAdmin("Você saiu do painel.", "");
  });

  if (!form || !conteudo) return;

  const campoData = document.getElementById("admin-data");
  if (campoData && !campoData.value) {
    campoData.value = new Date().toISOString().slice(0, 10);
  }

  document.querySelectorAll(".toolbar-editor button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const tag = botao.dataset.tag;
      const classe = botao.dataset.class;
      const lista = botao.dataset.lista;
      const link = botao.dataset.link;
      const alvo = botao.dataset.target ? document.getElementById(botao.dataset.target) : conteudo;
      if (!alvo) return;

      if (tag) envolverSelecao(alvo, `<${tag}>`, `</${tag}>`);
      if (classe) envolverSelecao(alvo, `<span class="${classe}">`, "</span>");
      if (lista) inserirListaEditor(alvo, lista);
      if (link) inserirLinkEditor(alvo);
    });
  });

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const noticia = montarNoticiaAdmin();
    mostrarResultadoAdmin(noticia);
    mostrarPreviewAdmin(noticia);
    adicionarRascunhoAdmin(noticia);
    form.reset();
    delete form.dataset.editandoId;
    delete form.dataset.editandoPublicado;
    atualizarModoEdicaoNoticiaAdmin(false);
    if (campoData) campoData.value = new Date().toISOString().slice(0, 10);
  });


  document.getElementById("btn-salvar-edicao-noticia")?.addEventListener("click", async () => {
    if (form.dataset.editandoPublicado !== "true") return;
    if (!form.reportValidity()) return;

    try {
      const noticia = montarNoticiaAdmin();
      mostrarResultadoAdmin(noticia);
      mostrarPreviewAdmin(noticia);
      await publicarNoticiasAdmin([noticia]);
      form.reset();
      delete form.dataset.editandoId;
      delete form.dataset.editandoPublicado;
      atualizarModoEdicaoNoticiaAdmin(false);
      if (campoData) campoData.value = new Date().toISOString().slice(0, 10);
      await carregarNoticiasAdmin();
      mostrarStatusAdmin("Edição salva no GitHub. A Vercel deve atualizar o site em alguns instantes.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });
  document.getElementById("btn-upload-imagem-principal")?.addEventListener("click", async () => {
    const inputArquivo = document.getElementById("admin-imagem-arquivo");
    const campoImagem = document.getElementById("admin-imagem");
    const arquivo = inputArquivo?.files?.[0];

    try {
      mostrarStatusAdmin("Enviando imagem principal...", "carregando");
      const caminho = await uploadImagemAdmin(arquivo);
      if (campoImagem) campoImagem.value = caminho;
      mostrarStatusAdmin("Imagem principal enviada e caminho preenchido.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });

  document.getElementById("btn-inserir-imagem-extra")?.addEventListener("click", async () => {
    const inputArquivo = document.getElementById("admin-imagem-extra-arquivo");
    const campoLegenda = document.getElementById("admin-imagem-extra-legenda");
    const campoConteudo = document.getElementById("admin-conteudo");
    const arquivo = inputArquivo?.files?.[0];

    try {
      mostrarStatusAdmin("Enviando imagem extra...", "carregando");
      const caminho = await uploadImagemAdmin(arquivo);
      const legenda = campoLegenda?.value.trim() || "";
      inserirTextoNoCursor(campoConteudo, `[imagem:${caminho}${legenda ? `|${legenda}` : ""}]`);
      if (inputArquivo) inputArquivo.value = "";
      if (campoLegenda) campoLegenda.value = "";
      mostrarStatusAdmin("Imagem extra enviada e inserida no texto.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });

  document.getElementById("btn-inserir-video-extra")?.addEventListener("click", () => {
    const campoVideo = document.getElementById("admin-video-extra-url");
    const campoConteudo = document.getElementById("admin-conteudo");
    const url = campoVideo?.value.trim() || "";

    if (!url) {
      mostrarStatusAdmin("Cole o link do vídeo antes de inserir.", "erro");
      return;
    }

    if (!ehVideoYouTubeOuG1(url)) {
      mostrarStatusAdmin("Use um link válido do YouTube ou G1.", "erro");
      return;
    }

    inserirTextoNoCursor(campoConteudo, `[video:${url}]`);
    if (campoVideo) campoVideo.value = "";
    mostrarStatusAdmin("Vídeo inserido no texto.", "sucesso");
  });

  document.getElementById("btn-preview")?.addEventListener("click", () => {
    const noticia = montarNoticiaAdmin();
    mostrarResultadoAdmin(noticia);
    mostrarPreviewAdmin(noticia);
  });

  document.getElementById("btn-carregar-noticias")?.addEventListener("click", carregarNoticiasAdmin);
  document.getElementById("btn-carregar-empregos")?.addEventListener("click", carregarEmpregosAdmin);

  document.getElementById("admin-lista-noticias")?.addEventListener("click", async (evento) => {
    const botaoEditar = evento.target.closest(".btn-editar-noticia-publicada");
    const botaoExcluir = evento.target.closest(".btn-excluir-noticia");

    try {
      if (botaoEditar) {
        await editarNoticiaPublicadaAdmin(botaoEditar.dataset.id);
        return;
      }

      if (botaoExcluir) {
        await excluirNoticiaAdmin(botaoExcluir.dataset.id, botaoExcluir.dataset.titulo || "esta notícia");
      }
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });


  document.getElementById("admin-lista-empregos-publicados")?.addEventListener("click", async (evento) => {
    const botaoEditar = evento.target.closest(".btn-editar-emprego-publicado");
    const botaoExcluir = evento.target.closest(".btn-excluir-emprego");

    try {
      if (botaoEditar) {
        await editarEmpregoPublicadoAdmin(botaoEditar.dataset.id);
        return;
      }

      if (botaoExcluir) {
        await excluirEmpregoAdmin(botaoExcluir.dataset.id, botaoExcluir.dataset.titulo || "esta vaga");
      }
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });
  document.getElementById("btn-publicar-rascunhos")?.addEventListener("click", async () => {
    const rascunhos = obterRascunhosAdmin();

    try {
      await publicarNoticiasAdmin(rascunhos);
      salvarRascunhosAdmin([]);
      renderizarRascunhosAdmin();
      await carregarNoticiasAdmin();
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });

  document.getElementById("btn-limpar-rascunhos")?.addEventListener("click", () => {
    const confirmou = confirm("Limpar todos os rascunhos deste navegador?");
    if (!confirmou) return;
    salvarRascunhosAdmin([]);
    renderizarRascunhosAdmin();
    mostrarStatusAdmin("Rascunhos limpos.", "sucesso");
  });

  document.getElementById("admin-lista-rascunhos")?.addEventListener("click", (evento) => {
    const botaoEditar = evento.target.closest(".btn-editar-rascunho");
    const botaoPreview = evento.target.closest(".btn-preview-rascunho");
    const botaoRemover = evento.target.closest(".btn-remover-rascunho");
    const rascunhos = obterRascunhosAdmin();

    if (botaoEditar) {
      editarRascunhoNoticiaAdmin(Number(botaoEditar.dataset.indice));
      return;
    }

    if (botaoPreview) {
      const noticia = rascunhos[Number(botaoPreview.dataset.indice)];
      if (noticia) {
        mostrarResultadoAdmin(noticia);
        mostrarPreviewAdmin(noticia);
      }
    }

    if (botaoRemover) {
      removerRascunhoAdmin(Number(botaoRemover.dataset.indice));
    }
  });
  document.getElementById("btn-categoria-empregos")?.addEventListener("click", () => {
    const campoCategoria = document.getElementById("admin-categoria");
    if (campoCategoria) campoCategoria.value = "Empregos";
    mostrarStatusAdmin("Categoria Empregos selecionada. Essa notícia também aparecerá na aba Empregos.", "sucesso");
  });
  const formEmprego = document.getElementById("form-emprego-admin");
  const campoEmpregoData = document.getElementById("emprego-data");
  if (campoEmpregoData && !campoEmpregoData.value) {
    campoEmpregoData.value = new Date().toISOString().slice(0, 10);
  }

  formEmprego?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const emprego = montarEmpregoAdmin();
    mostrarResultadoAdmin(emprego);
    mostrarPreviewAdmin(emprego);
    adicionarEmpregoRascunhoAdmin(emprego);
    formEmprego.reset();
    delete formEmprego.dataset.editandoId;
    delete formEmprego.dataset.editandoPublicado;
    atualizarModoEdicaoEmpregoAdmin(false);
    if (campoEmpregoData) campoEmpregoData.value = new Date().toISOString().slice(0, 10);
  });


  document.getElementById("btn-salvar-edicao-emprego")?.addEventListener("click", async () => {
    if (formEmprego.dataset.editandoPublicado !== "true") return;
    if (!formEmprego.reportValidity()) return;

    try {
      const emprego = montarEmpregoAdmin();
      mostrarResultadoAdmin(emprego);
      mostrarPreviewAdmin(emprego);
      await publicarEmpregosAdmin([emprego]);
      formEmprego.reset();
      delete formEmprego.dataset.editandoId;
      delete formEmprego.dataset.editandoPublicado;
      atualizarModoEdicaoEmpregoAdmin(false);
      if (campoEmpregoData) campoEmpregoData.value = new Date().toISOString().slice(0, 10);
      await carregarEmpregosAdmin();
      mostrarStatusAdmin("Edição da vaga salva no GitHub. A Vercel deve atualizar o site em alguns instantes.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });
  document.getElementById("btn-upload-imagem-emprego")?.addEventListener("click", async () => {
    const inputArquivo = document.getElementById("emprego-imagem-arquivo");
    const campoImagem = document.getElementById("emprego-imagem");
    const arquivo = inputArquivo?.files?.[0];

    try {
      mostrarStatusAdmin("Enviando imagem da vaga...", "carregando");
      const caminho = await uploadImagemAdmin(arquivo);
      if (campoImagem) campoImagem.value = caminho;
      mostrarStatusAdmin("Imagem da vaga enviada e caminho preenchido.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });

  document.getElementById("btn-inserir-imagem-extra-emprego")?.addEventListener("click", async () => {
    const inputArquivo = document.getElementById("emprego-imagem-extra-arquivo");
    const campoLegenda = document.getElementById("emprego-imagem-extra-legenda");
    const campoConteudo = document.getElementById("emprego-conteudo");
    const arquivo = inputArquivo?.files?.[0];

    try {
      mostrarStatusAdmin("Enviando imagem extra da vaga...", "carregando");
      const caminho = await uploadImagemAdmin(arquivo);
      const legenda = campoLegenda?.value.trim() || "";
      inserirTextoNoCursor(campoConteudo, `[imagem:${caminho}${legenda ? `|${legenda}` : ""}]`);
      if (inputArquivo) inputArquivo.value = "";
      if (campoLegenda) campoLegenda.value = "";
      mostrarStatusAdmin("Imagem extra da vaga enviada e inserida no texto.", "sucesso");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });
  document.getElementById("btn-inserir-video-extra-emprego")?.addEventListener("click", () => {
    const campoVideo = document.getElementById("emprego-video-extra-url");
    const campoConteudo = document.getElementById("emprego-conteudo");
    const url = campoVideo?.value.trim() || "";

    if (!url) {
      mostrarStatusAdmin("Cole o link do vídeo antes de inserir.", "erro");
      return;
    }

    if (!ehVideoYouTubeOuG1(url)) {
      mostrarStatusAdmin("Use um link válido do YouTube ou G1.", "erro");
      return;
    }

    inserirTextoNoCursor(campoConteudo, `[video:${url}]`);
    if (campoVideo) campoVideo.value = "";
    mostrarStatusAdmin("Vídeo extra da vaga inserido no texto.", "sucesso");
  });

  document.getElementById("btn-preview-emprego")?.addEventListener("click", () => {
    const emprego = montarEmpregoAdmin();
    mostrarResultadoAdmin(emprego);
    mostrarPreviewAdmin(emprego);
  });

  document.getElementById("btn-publicar-empregos")?.addEventListener("click", async () => {
    const rascunhos = obterEmpregosRascunhosAdmin();

    try {
      await publicarEmpregosAdmin(rascunhos);
      salvarEmpregosRascunhosAdmin([]);
      renderizarEmpregosRascunhosAdmin();
      await carregarEmpregosAdmin();
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
    }
  });

  document.getElementById("btn-limpar-empregos")?.addEventListener("click", () => {
    const confirmou = confirm("Limpar todos os rascunhos de vagas deste navegador?");
    if (!confirmou) return;
    salvarEmpregosRascunhosAdmin([]);
    renderizarEmpregosRascunhosAdmin();
    mostrarStatusAdmin("Rascunhos de vagas limpos.", "sucesso");
  });

  document.getElementById("admin-lista-empregos-rascunhos")?.addEventListener("click", (evento) => {
    const botaoEditar = evento.target.closest(".btn-editar-rascunho");
    const botaoPreview = evento.target.closest(".btn-preview-rascunho");
    const botaoRemover = evento.target.closest(".btn-remover-rascunho");
    const rascunhos = obterEmpregosRascunhosAdmin();

    if (botaoEditar) {
      editarRascunhoEmpregoAdmin(Number(botaoEditar.dataset.indice));
      return;
    }

    if (botaoPreview) {
      const emprego = rascunhos[Number(botaoPreview.dataset.indice)];
      if (emprego) {
        mostrarResultadoAdmin(emprego);
        mostrarPreviewAdmin(emprego);
      }
    }

    if (botaoRemover) {
      rascunhos.splice(Number(botaoRemover.dataset.indice), 1);
      salvarEmpregosRascunhosAdmin(rascunhos);
      renderizarEmpregosRascunhosAdmin();
    }
  });
  document.getElementById("btn-copiar")?.addEventListener("click", async () => {
    const resultado = document.getElementById("admin-resultado");
    if (!resultado?.value) mostrarResultadoAdmin(montarNoticiaAdmin());

    await navigator.clipboard.writeText(document.getElementById("admin-resultado").value);
    mostrarStatusAdmin("JSON copiado.", "sucesso");
  });
}

// =============================
// ACESSIBILIDADE
// =============================
let tamanhoFonte = 100;
const btnAumentar = document.getElementById("aumentar-fonte");
const btnDiminuir = document.getElementById("diminuir-fonte");

if (btnAumentar && btnDiminuir) {
  btnAumentar.addEventListener("click", () => {
    if (tamanhoFonte < 150) {
      tamanhoFonte += 10;
      document.documentElement.style.fontSize = `${tamanhoFonte}%`;
    }
  });

  btnDiminuir.addEventListener("click", () => {
    if (tamanhoFonte > 70) {
      tamanhoFonte -= 10;
      document.documentElement.style.fontSize = `${tamanhoFonte}%`;
    }
  });
}

// =============================
// INICIALIZACAO
// =============================
document.addEventListener("DOMContentLoaded", () => {
  carregarNoticiasIndex();
  carregarNoticiaDetalhe();
  carregarEmpregosLista();
  carregarEmpregoDetalhe();
  iniciarAdmin();
  atualizarDatasRelativas();
});

atualizarTitulo();

