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
const modalElement = document.getElementById('camera-modal'); 
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

let currentLamina = null;
let currentCard = null;
let stream = null;
let bootstrapModal = null; 

// Inicializar el objeto Modal de Bootstrap
// Se debe inicializar tan pronto como sea posible, por eso se deja aquí.
if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrapModal = new bootstrap.Modal(modalElement, {
        keyboard: false
    });
}

/**
 * 💡 SOLUCIÓN: Mover la generación de tarjetas aquí.
 * Esta función es la que genera la estructura HTML de los marcos de fotos.
 * Al estar dentro de iniciarAlbum, aseguramos que se ejecuta solo cuando
 * el usuario entra al álbum.
 */
function generarAlbum() {
    // Evita duplicar las tarjetas si se llama más de una vez
    if (contenedor.children.length > 0) return; 
    
    laminas.forEach(titulo => {
        // Se usa la estructura de columnas de Bootstrap (col)
        const colDiv = document.createElement('div');
        colDiv.className = 'col mb-4'; 
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 mx-auto'; 
        
        cardDiv.innerHTML = `
          <div class="inner-frame" onclick="abrirCamara('${titulo}', this)">
          </div>
          <p class="text-center">${titulo}</p>
        `;
        
        colDiv.appendChild(cardDiv);
        contenedor.appendChild(colDiv);
    });
}

function iniciarAlbum() {
  // 1. Genera el HTML de las tarjetas
  generarAlbum(); 

  // 2. Oculta la landing page y muestra el contenido principal
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('contenido').classList.remove('hidden');
}


// --- El resto de las funciones se mantienen igual ---

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  if (bootstrapModal) bootstrapModal.show();
  
  // Detiene cualquier stream anterior para evitar errores
  if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
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
    if (bootstrapModal) bootstrapModal.hide();
    
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
  canvas.width = video.videoWidth || 300; 
  canvas.height = video.videoHeight || 300;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Mayor calidad
  insertarImagen(dataUrl);
  
  cerrarModal(); 
}

function subirDesdeGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    insertarImagen(e.target.result);
  };
  reader.readAsDataURL(file);
  
  cerrarModal(); 
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
