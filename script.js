const laminas = [
  "Mi mejor amig@",
  "En mi traje de gala",
  "El momento más divertido",
  "Selfie en el bus",
  "El peor peinado",
  "Actuando una película",
  "El paisaje más lindo",
  "Una foto random"
];

const contenedor = document.getElementById('laminas');
const modal = document.getElementById('camera-modal');
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

let currentLamina = null;
let currentCard = null;
let stream = null;

function iniciarAlbum() {
  document.getElementById('portada').classList.add('hidden');
  document.getElementById('contenido').classList.remove('hidden');
}

function getRandomAngle() {
  const angles = [-8, -5, 0, 3, 5, 8];
  return angles[Math.floor(Math.random() * angles.length)];
}

laminas.forEach(titulo => {
  const div = document.createElement('div');
  div.className = 'card';
  div.style.setProperty('--angle', getRandomAngle() + 'deg');
  div.innerHTML = `
    <div class="inner-frame" onclick="abrirCamara('${titulo}', this)">
    </div>
    <p>${titulo}</p>
  `;
  contenedor.appendChild(div);
});

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  modal.classList.remove('hidden');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
    });
}

function insertarImagen(dataUrl) {
  if (!currentCard) return;
  const img = document.createElement('img');
  img.src = dataUrl;
  img.className = 'shrink-in';
  if (currentCard.children.length < 3) {
    currentCard.appendChild(img);
  }
}

function capturarFoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL();
  insertarImagen(dataUrl);
  modal.classList.add('hidden');
  if (stream) stream.getTracks().forEach(track => track.stop());
}

function subirDesdeGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    insertarImagen(e.target.result);
  };
  reader.readAsDataURL(file);
  modal.classList.add('hidden');
  if (stream) stream.getTracks().forEach(track => track.stop());
}

function compartirAlbum() {
  if (navigator.share) {
    navigator.share({
      title: '¡Mira mi álbum de la gira!',
      text: 'Mira mi álbum virtual interactivo ✨',
      url: window.location.href
    });
  } else {
    alert("Tu navegador no soporta la función de compartir.");
  }
}

function modoPresentacion() {
  alert("Próximamente: Modo presentación con pase de diapositivas 🔭");
}
