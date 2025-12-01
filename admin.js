// LOGIN
document.getElementById("loginBtn").addEventListener("click", () => {

  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  if(login === "tvDavi" && senha === "Davibass6010#"){

    document.getElementById("login-box").style.display = "none";
    document.getElementById("form").style.display = "block";

  } else {
    alert("Login ou senha incorretos!");
  }

});

// FORMATA TEXTO DO EDITOR
function formatar(cmd){
  document.execCommand(cmd);
}

// SALVAR NOTÍCIA
function salvarNoticia(){

  const titulo = document.getElementById("titulo").value;
  const texto = document.getElementById("conteudo").innerHTML;
  const imagem = document.getElementById("imagem").files[0];

  if(!titulo || !texto || !imagem){
    alert("Preencha TODOS os campos!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(){

    const novaNoticia = {
      titulo: titulo,
      conteudo: texto,
      imagem: reader.result,
      link: "#"
    };

    let noticias = JSON.parse(localStorage.getItem("noticias")) || [];

    noticias.unshift(novaNoticia);

    localStorage.setItem("noticias", JSON.stringify(noticias));

    alert("✅ Notícia salva com sucesso!");

    document.getElementById("titulo").value = "";
    document.getElementById("conteudo").innerHTML = "";
    document.getElementById("imagem").value = "";

  };

  reader.readAsDataURL(imagem);
}
