module.exports = async function publicarEmprego(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ erro: "Método não permitido." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { senha, empregos, emprego } = body;

    if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      return res.status(500).json({ erro: "Variáveis da Vercel não configuradas." });
    }

    if (!senha || senha !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ erro: "Senha inválida." });
    }

    const entrada = Array.isArray(empregos) ? empregos : [emprego];
    const empregosLimpos = entrada.map(validarEmprego);

    if (empregosLimpos.length === 0) {
      return res.status(400).json({ erro: "Envie pelo menos uma vaga." });
    }

    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const arquivo = process.env.GITHUB_JOBS_FILE || "empregos.json";
    const token = process.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${arquivo}`;

    const atual = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      headers: cabecalhosGitHub(token)
    });

    if (!atual.ok) {
      const detalhe = await atual.text();
      return res.status(500).json({ erro: "Não foi possível ler empregos.json no GitHub.", detalhe });
    }

    const dadosAtuais = await atual.json();
    const conteudoAtual = Buffer.from(dadosAtuais.content || "", "base64").toString("utf8").replace(/^\uFEFF/, "");
    const empregosAtuais = JSON.parse(conteudoAtual || "[]");

    if (!Array.isArray(empregosAtuais)) {
      return res.status(500).json({ erro: "O empregos.json precisa ser uma lista." });
    }

    empregosAtuais.unshift(...empregosLimpos);

    const novoConteudo = `${JSON.stringify(empregosAtuais, null, 2)}\n`;
    const salvar = await fetch(apiUrl, {
      method: "PUT",
      headers: cabecalhosGitHub(token),
      body: JSON.stringify({
        message: empregosLimpos.length === 1
          ? `Publica vaga: ${empregosLimpos[0].titulo}`
          : `Publica ${empregosLimpos.length} vagas`,
        content: Buffer.from(novoConteudo, "utf8").toString("base64"),
        sha: dadosAtuais.sha,
        branch
      })
    });

    if (!salvar.ok) {
      const detalhe = await salvar.text();
      return res.status(500).json({ erro: "Não foi possível salvar empregos.json no GitHub.", detalhe });
    }

    return res.status(200).json({ ok: true, empregos: empregosLimpos });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao publicar vaga.", detalhe: erro.message });
  }
};

function cabecalhosGitHub(token) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "tvdavi-admin"
  };
}

function validarEmprego(emprego) {
  if (!emprego || typeof emprego !== "object") throw new Error("Vaga inválida.");

  const id = Number(emprego.id) || Date.now();
  const titulo = textoObrigatorio(emprego.titulo, "Título");
  const resumo = textoObrigatorio(emprego.resumo, "Resumo");
  const imagem = textoObrigatorio(emprego.imagem, "Imagem");
  const data = textoObrigatorio(emprego.data, "Data");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error("Data inválida. Use o formato AAAA-MM-DD.");
  }

  return {
    id,
    titulo,
    resumo,
    imagem,
    legendaImagem: textoOpcional(emprego.legendaImagem),
    data,
    categoria: "Empregos",
    link: `emprego.html?id=${id}`,
    videoYoutube: urlOpcional(emprego.videoYoutube),
    fonte: textoOpcional(emprego.fonte),
    linkFonte: urlOpcional(emprego.linkFonte),
    conteudo: Array.isArray(emprego.conteudo)
      ? emprego.conteudo.map((item) => limparHtml(String(item))).filter(Boolean)
      : []
  };
}

function textoObrigatorio(valor, campo) {
  const texto = String(valor || "").trim();
  if (!texto) throw new Error(`${campo} é obrigatório.`);
  return texto.slice(0, 5000);
}

function textoOpcional(valor) {
  return String(valor || "").trim().slice(0, 1000);
}

function urlOpcional(valor) {
  const texto = textoOpcional(valor);
  if (!texto) return "";

  try {
    const url = new URL(texto);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch (_erro) {
    return "";
  }
}

function limparHtml(valor) {
  return valor
    .replace(/<\/?(script|iframe|object|embed|style|link|meta)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 10000);
}

