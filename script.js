// =============================
// BOTÃO MODO ESCURO
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
// CALCULAR DATA RELATIVA
// =============================
function calcularTempo(dataPublicacao) {
  const partes = dataPublicacao.split("-");
  const data = new Date(
    partes[0],        // ano
    partes[1] - 1,    // mês (começa do 0)
    partes[2]         // dia
  );

  const hoje = new Date();

  hoje.setHours(0,0,0,0);
  data.setHours(0,0,0,0);

  const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff > 1) return `Há ${diff} dias`;

  return "";
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".data-noticia").forEach(elemento => {
    const data = elemento.getAttribute("data-data");

    if (data) {
      elemento.textContent =
        calcularTempo(data) + " - em Feira de Santana e Região";
    }
  });
});
// =============================
// ACESSIBILIDADE - TAMANHO DA FONTE
// =============================
let tamanhoFonte = 100;

const btnAumentar = document.getElementById("aumentar-fonte");
const btnDiminuir = document.getElementById("diminuir-fonte");

if (btnAumentar && btnDiminuir) {
  btnAumentar.addEventListener("click", () => {
    if (tamanhoFonte < 150) {
      tamanhoFonte += 10;
      document.documentElement.style.fontSize = tamanhoFonte + "%";
    }
  });

  btnDiminuir.addEventListener("click", () => {
    if (tamanhoFonte > 70) {
      tamanhoFonte -= 10;
      document.documentElement.style.fontSize = tamanhoFonte + "%";
    }
  });
}
function atualizarTitulo() {
  const hoje = new Date();

  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();

  document.title = `TVDavi - Notícias ${dia}/${mes}/${ano}`;
}

atualizarTitulo();