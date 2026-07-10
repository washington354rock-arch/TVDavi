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

function limparHtmlBasico(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const permitidas = ["STRONG", "B", "EM", "I", "S", "MARK", "SPAN", "A", "BR"];
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

function renderizarConteudo(conteudo) {
  if (!Array.isArray(conteudo) || conteudo.length === 0) {
    return "<p>Conteúdo completo em preparação.</p>";
  }

  return conteudo
    .map((paragrafo) => {
      const texto = String(paragrafo || "").trim();
      const imagem = renderizarImagemNoConteudo(texto);
      if (imagem) return imagem;
      return `<p>${limparHtmlBasico(texto)}</p>`;
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

    const videoEmbed = normalizarYoutube(noticia.videoYoutube);
    const blocoVideo = videoEmbed
      ? `<div class="video-container"><iframe src="${videoEmbed}" title="Vídeo da notícia" allowfullscreen></iframe></div>`
      : "";

    const blocoFonte = noticia.linkFonte
      ? `<p class="fonte-noticia">Fonte: <a href="${noticia.linkFonte}" target="_blank" rel="noopener noreferrer">${noticia.fonte || "Ler notícia original"}</a></p>`
      : "";

    container.innerHTML = `
      <h1>${noticia.titulo}</h1>
      <p>${noticia.resumo}</p>
      <p class="data">Publicado em ${formatarData(noticia.data)}</p>
      <img src="${noticia.imagem}" alt="${noticia.titulo}" class="imagem-primaria">
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

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível enviar a imagem.");
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
  const data = document.getElementById("admin-data")?.value;
  const categoria = document.getElementById("admin-categoria")?.value.trim();
  const videoYoutube = document.getElementById("admin-video")?.value.trim();
  const fonte = document.getElementById("admin-fonte")?.value.trim();
  const linkFonte = document.getElementById("admin-link-fonte")?.value.trim();
  const conteudoTexto = document.getElementById("admin-conteudo")?.value.trim();
  const id = Date.now();

  return {
    id,
    titulo,
    resumo,
    imagem,
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

  preview.innerHTML = `
    <article class="noticia-preview-card">
      <img src="${noticia.imagem}" alt="${noticia.titulo}">
      <h3>${noticia.titulo}</h3>
      <p>${noticia.resumo}</p>
      <p class="data">Publicado em ${formatarData(noticia.data)}</p>
      ${renderizarConteudo(noticia.conteudo)}
    </article>
  `;
}

async function publicarNoticiaAdmin(noticia) {
  const senha = obterSenhaAdmin();

  if (!senha) {
    bloquearPainelAdmin();
    mostrarStatusAdmin("Digite a senha do painel antes de publicar.", "erro");
    return;
  }

  mostrarStatusAdmin("Publicando notícia...", "carregando");

  const resposta = await fetch("/api/publicar-noticia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha, noticia })
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível publicar a notícia.");
  }

  mostrarStatusAdmin("Notícia enviada para o GitHub. A Vercel deve publicar em alguns instantes.", "sucesso");
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

function iniciarAdmin() {
  const form = document.getElementById("form-admin");
  const conteudo = document.getElementById("admin-conteudo");
  const login = document.getElementById("admin-login");
  if (!login && (!form || !conteudo)) return;

  if (obterSenhaAdmin()) {
    liberarPainelAdmin();
    carregarNoticiasAdmin();
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

      if (tag) envolverSelecao(conteudo, `<${tag}>`, `</${tag}>`);
      if (classe) envolverSelecao(conteudo, `<span class="${classe}">`, "</span>");
    });
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const noticia = montarNoticiaAdmin();
    mostrarResultadoAdmin(noticia);
    mostrarPreviewAdmin(noticia);

    try {
      await publicarNoticiaAdmin(noticia);
      await carregarNoticiasAdmin();
      form.reset();
      if (campoData) campoData.value = new Date().toISOString().slice(0, 10);
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
  document.getElementById("btn-preview")?.addEventListener("click", () => {
    const noticia = montarNoticiaAdmin();
    mostrarResultadoAdmin(noticia);
    mostrarPreviewAdmin(noticia);
  });

  document.getElementById("btn-carregar-noticias")?.addEventListener("click", carregarNoticiasAdmin);

  document.getElementById("admin-lista-noticias")?.addEventListener("click", async (evento) => {
    const botao = evento.target.closest(".btn-excluir-noticia");
    if (!botao) return;

    try {
      await excluirNoticiaAdmin(botao.dataset.id, botao.dataset.titulo || "esta notícia");
    } catch (erro) {
      mostrarStatusAdmin(erro.message, "erro");
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
  iniciarAdmin();
  atualizarDatasRelativas();
});

atualizarTitulo();





