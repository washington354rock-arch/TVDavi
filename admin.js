// ===================================================
// LOGIN FIXADO
// ===================================================

const USER = "tvDavi";
const PASS = "tvDavi6010#";

// pega os elementos
const loginBox = document.getElementById("login-box");
const painel   = document.getElementById("painel");
const erro     = document.getElementById("erro");

function logar() {

  const u = document.getElementById("login").value.trim();
  const p = document.getElementById("senha").value.trim();

  if (u === USER && p === PASS) {

    loginBox.style.display = "none";
    painel.style.display = "block";

  } else {

    erro.innerText = "Usuário ou senha incorretos ❌";

  }
}


// ===================================================
// FORMULÁRIO NOTÍCIAS
// ===================================================

function mostrarForm(){
  document.getElementById("form").style.display = "block";
}

function salvar(){

  const titulo    = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const inputImg  = document.getElementById("imagem");

  if(!titulo || !descricao || !inputImg.files.length){
    alert("Preencha todos os campos!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(){

    const noticia = {
      titulo: titulo,
      descricao: descricao,
      imagem: reader.result,
      link: "#"
    };

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.unshift(noticia);

    localStorage.setItem("noticias", JSON.stringify(noticias));

    alert("✅ Notícia salva com sucesso!");

    // limpa
    document.getElementById("titulo").value = "";
    document.getElementById("descricao").value = "";
    inputImg.value = "";

  }

  reader.readAsDataURL(inputImg.files[0]);

}
