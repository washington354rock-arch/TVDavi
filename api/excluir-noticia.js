module.exports = async function excluirNoticia(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ erro: "Método não permitido." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { senha, id } = body;

    if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      return res.status(500).json({ erro: "Variáveis da Vercel não configuradas." });
    }

    if (!senha || senha !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ erro: "Senha inválida." });
    }

    const idNumerico = Number(id);
    if (!idNumerico) {
      return res.status(400).json({ erro: "ID da notícia inválido." });
    }

    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const arquivo = process.env.GITHUB_NEWS_FILE || "noticias.json";
    const token = process.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${arquivo}`;

    const atual = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      headers: cabecalhosGitHub(token)
    });

    if (!atual.ok) {
      const detalhe = await atual.text();
      return res.status(500).json({ erro: "Não foi possível ler noticias.json no GitHub.", detalhe });
    }

    const dadosAtuais = await atual.json();
    const conteudoAtual = Buffer.from(dadosAtuais.content || "", "base64").toString("utf8").replace(/^\uFEFF/, "");
    const noticias = JSON.parse(conteudoAtual || "[]");

    if (!Array.isArray(noticias)) {
      return res.status(500).json({ erro: "O noticias.json precisa ser uma lista de notícias." });
    }

    const noticiaRemovida = noticias.find((noticia) => Number(noticia.id) === idNumerico);
    if (!noticiaRemovida) {
      return res.status(404).json({ erro: "Notícia não encontrada." });
    }

    const noticiasAtualizadas = noticias.filter((noticia) => Number(noticia.id) !== idNumerico);
    const novoConteudo = `${JSON.stringify(noticiasAtualizadas, null, 2)}\n`;

    const salvar = await fetch(apiUrl, {
      method: "PUT",
      headers: cabecalhosGitHub(token),
      body: JSON.stringify({
        message: `Remove notícia: ${noticiaRemovida.titulo || idNumerico}`,
        content: Buffer.from(novoConteudo, "utf8").toString("base64"),
        sha: dadosAtuais.sha,
        branch
      })
    });

    if (!salvar.ok) {
      const detalhe = await salvar.text();
      return res.status(500).json({ erro: "Não foi possível salvar noticias.json no GitHub.", detalhe });
    }

    return res.status(200).json({ ok: true, removida: noticiaRemovida });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao excluir notícia.", detalhe: erro.message });
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
