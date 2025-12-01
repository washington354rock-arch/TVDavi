// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBg6BMcZXfCPX6V0_WhTIbQf4m8pWbUCUU",
  authDomain: "tvdavi-fd587.firebaseapp.com",
  projectId: "tvdavi-fd587",
  storageBucket: "tvdavi-fd587.firebasestorage.app",
  messagingSenderId: "1908490170",
  appId: "1:1908490170:web:475a8fc629f79883ef6783"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Elementos do painel
const form = document.getElementById("form");
const titulo = document.getElementById("titulo");
const conteudo = document.getElementById("conteudo");
const imagem = document.getElementById("imagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!titulo.value || !conteudo.value || !imagem.files[0]) {
    alert("Preencha tudo!");
    return;
  }

  try {
    // Upload da imagem
    const file = imagem.files[0];
    const imgRef = ref(storage, `imagens/${Date.now()}-${file.name}`);
    await uploadBytes(imgRef, file);

    const imgURL = await getDownloadURL(imgRef);

    // Salvar notícia no Firebase
    await addDoc(collection(db, "noticias"), {
      titulo: titulo.value,
      conteudo: conteudo.value,
      imagem: imgURL,
      data: new Date()
    });

    alert("✅ Notícia publicada!");
    form.reset();
  } catch (err) {
    alert("Erro ao salvar notícia");
    console.error(err);
  }
});

