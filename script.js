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

let currentCard = null;
let stream = null;

function mostrarAlbum() {
  document.getElementById('pantalla-inicio').classList.add('hidden');
  document.getElementById('pantalla-album').classList.remove('hidden');
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
    <div class="inner-frame">
    </div>
    <p>${titulo}</p>
    <div class="thumbnail-row"></div>
  `;
  const inner = div.querySelector('.inner-frame');
  inner.onclick = () => abrirCamara(titulo, div);
  div.querySelector('p').onclick = () => {
    const thumbs = div.querySelector('.thumbnail-row');
    thumbs.style.display = thumbs.style.display === 'flex' ? 'none' : 'flex';
  };
  contenedor.appendChild(div);
});

function abrirCamara(titulo, cardRef) {
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  modal.classList.remove('hidden');
  navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
    stream = s;
    video.srcObject = stream;
  });
}

function insertarImagen(dataUrl) {
  if (!currentCard) return;
  const thumbs = currentCard.querySelector('.thumbnail-row');
  if (thumbs.children.length >= 3) return;
  const img = document.createElement('img');
  img.src = dataUrl;
  thumbs.appendChild(img);
}

function capturarFoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL();
  insertarImagen(dataUrl);
  cerrarCamara();
}

function subirDesdeGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    insertarImagen(e.target.result);
  };
  reader.readAsDataURL(file);
  cerrarCamara();
}

function cerrarCamara() {
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

let presentando = false;
let indexActual = 0;
let slides = [];

function modoPresentacion() {
  if (presentando) return;

  slides = [];
  document.querySelectorAll('.thumbnail-row img').forEach(img => {
    slides.push(img.src);
  });

  if (slides.length === 0) {
    alert("Aún no hay fotos para mostrar.");
    return;
  }

  presentando = true;
  const overlay = document.createElement('div');
  overlay.id = 'overlay-presentacion';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'black';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10000';

  const img = document.createElement('img');
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.borderRadius = '12px';
  img.style.boxShadow = '0 0 30px white';
  overlay.appendChild(img);

  document.body.appendChild(overlay);

  let i = 0;
  function mostrarSiguiente() {
    if (!presentando || i >= slides.length) {
      cerrarPresentacion();
      return;
    }
    img.src = slides[i];
    i++;
    setTimeout(mostrarSiguiente, 2000);
  }

  mostrarSiguiente();
}

function cerrarPresentacion() {
  presentando = false;
  const overlay = document.getElementById('overlay-presentacion');
  if (overlay) overlay.remove();
}
