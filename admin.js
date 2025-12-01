const USER = "tvDavi";
const PASS = "tvDavi601039#";

function logar(){
  const u = login.value;
  const p = senha.value;

  if(u === USER && p === PASS){
    loginBox.style.display = "none";
    painel.style.display = "block";
  } else {
    erro.innerText = "Usuário ou senha incorretos ❌";
  }
}

function mostrarForm(){
  form.style.display = "block";
}

function salvar(){
  const titulo = document.getElementById("titulo").value;
  const descricao = document.getElementById("descricao").value;
  const file = document.getElementById("imagem").files[0];

  if(!titulo || !descricao || !file){
    alert("Preencha tudo!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(){
    const noticia = {
      titulo,
      descricao,
      imagem: reader.result,
      link: "#"
    };

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.unshift(noticia);

    localStorage.setItem("noticias", JSON.stringify(noticias));

    alert("✅ Notícia salva com sucesso!");
    location.reload();
  };

  reader.readAsDataURL(file);
}
