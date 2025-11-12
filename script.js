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
const modalElement = document.getElementById('camera-modal'); // Referencia al div del modal
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

let currentLamina = null;
let currentCard = null;
let stream = null;
let bootstrapModal = null; // Variable para la instancia de Bootstrap Modal

// Inicializar el objeto Modal de Bootstrap
if (modalElement) {
    bootstrapModal = new bootstrap.Modal(modalElement, {
        keyboard: false // Opcional: Evita cerrar con la tecla Esc
    });
}

function iniciarAlbum() {
  // Oculta la landing page y muestra el contenido principal (Punto 3)
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('contenido').classList.remove('hidden');
}

// Ya no se necesita esta función porque las tarjetas ya no van en diagonal (Punto 2)
// function getRandomAngle() {
//   const angles = [-8, -5, 0, 3, 5, 8];
//   return angles[Math.floor(Math.random() * angles.length)];
// }

laminas.forEach(titulo => {
  // Se usa la estructura de columnas de Bootstrap (col)
  const colDiv = document.createElement('div');
  colDiv.className = 'col mb-4'; // Añade margen inferior
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card h-100 mx-auto'; // Centra la tarjeta y da altura completa
  // cardDiv.style.setProperty('--angle', getRandomAngle() + 'deg'); // Eliminado por el Punto 2
  
  cardDiv.innerHTML = `
    <div class="inner-frame" onclick="abrirCamara('${titulo}', this)">
    </div>
    <p class="text-center">${titulo}</p>
  `;
  
  colDiv.appendChild(cardDiv);
  contenedor.appendChild(colDiv);
});

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  // Usa el método .show() de Bootstrap para mostrar el modal
  if (bootstrapModal) bootstrapModal.show();
  
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.play();
    })
    .catch(error => {
        console.error("Error al acceder a la cámara:", error);
        alert("No se pudo acceder a la cámara. Asegúrate de dar los permisos.");
        cerrarModal();
    });
}

function cerrarModal() {
    // Usa el método .hide() de Bootstrap para ocultar el modal
    if (bootstrapModal) bootstrapModal.hide();
    
    // Detiene el stream de video
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function insertarImagen(dataUrl) {
  if (!currentCard) return;
  // Limpia el contenido anterior antes de insertar la nueva imagen
  currentCard.innerHTML = ''; 
  
  const img = document.createElement('img');
  img.src = dataUrl;
  img.className = 'shrink-in';
  
  currentCard.appendChild(img);
}

function capturarFoto() {
  const canvas = document.createElement('canvas');
  // Asegúrate de que el video esté reproduciéndose antes de capturar
  canvas.width = video.videoWidth || 300; 
  canvas.height = video.videoHeight || 300;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg'); // Mejor calidad para fotos
  insertarImagen(dataUrl);
  
  cerrarModal(); // Cierra el modal y detiene la cámara
}

function subirDesdeGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    insertarImagen(e.target.result);
  };
  reader.readAsDataURL(file);
  
  cerrarModal(); // Cierra el modal y detiene la cámara
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
