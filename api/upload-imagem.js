module.exports = async function uploadImagem(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ erro: "Método não permitido." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { senha, nome, tipo, conteudoBase64 } = body;

    if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      return res.status(500).json({ erro: "Variáveis da Vercel não configuradas." });
    }

    if (!senha || senha !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ erro: "Senha inválida." });
    }

    if (!conteudoBase64 || typeof conteudoBase64 !== "string") {
      return res.status(400).json({ erro: "Imagem inválida." });
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ erro: "Use imagem JPG, PNG, WEBP ou GIF." });
    }

    const buffer = Buffer.from(conteudoBase64, "base64");
    if (buffer.length > 3 * 1024 * 1024) {
      return res.status(400).json({ erro: "Imagem muito grande. Use uma imagem com até 3 MB." });
    }

    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const token = process.env.GITHUB_TOKEN;
    const pasta = process.env.GITHUB_IMAGE_DIR || "img";
    const nomeArquivo = criarNomeArquivo(nome, tipo);
    const caminho = `${pasta}/${nomeArquivo}`;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(caminho).replace(/%2F/g, "/")}`;

    const salvar = await fetch(apiUrl, {
      method: "PUT",
      headers: cabecalhosGitHub(token),
      body: JSON.stringify({
        message: `Adiciona imagem: ${nomeArquivo}`,
        content: buffer.toString("base64"),
        branch
      })
    });

    if (!salvar.ok) {
      const detalhe = await salvar.text();
      return res.status(500).json({ erro: "Não foi possível enviar a imagem para o GitHub. Tente novamente em alguns segundos ou verifique o token do GitHub.", detalhe });
    }

    return res.status(200).json({ ok: true, caminho });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao enviar imagem.", detalhe: erro.message });
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

function criarNomeArquivo(nome, tipo) {
  const extensaoPorTipo = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  const extensao = extensaoPorTipo[tipo] || "jpg";
  const base = String(nome || "imagem")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "imagem";

  return `${Date.now()}-${base}.${extensao}`;
}

