module.exports = async function excluirEmprego(req, res) {
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
      return res.status(400).json({ erro: "ID da vaga inválido." });
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
    const empregos = JSON.parse(conteudoAtual || "[]");

    if (!Array.isArray(empregos)) {
      return res.status(500).json({ erro: "O empregos.json precisa ser uma lista." });
    }

    const empregoRemovido = empregos.find((emprego) => Number(emprego.id) === idNumerico);
    if (!empregoRemovido) {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }

    const empregosAtualizados = empregos.filter((emprego) => Number(emprego.id) !== idNumerico);
    const novoConteudo = `${JSON.stringify(empregosAtualizados, null, 2)}\n`;

    const salvar = await fetch(apiUrl, {
      method: "PUT",
      headers: cabecalhosGitHub(token),
      body: JSON.stringify({
        message: `Remove vaga: ${empregoRemovido.titulo || idNumerico}`,
        content: Buffer.from(novoConteudo, "utf8").toString("base64"),
        sha: dadosAtuais.sha,
        branch
      })
    });

    if (!salvar.ok) {
      const detalhe = await salvar.text();
      return res.status(500).json({ erro: "Não foi possível salvar empregos.json no GitHub.", detalhe });
    }

    return res.status(200).json({ ok: true, removida: empregoRemovido });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao excluir vaga.", detalhe: erro.message });
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
