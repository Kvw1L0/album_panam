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
// Se usa un chequeo de 'typeof bootstrap' para asegurar que el CDN de Bootstrap JS ya cargó.
if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrapModal = new bootstrap.Modal(modalElement, {
        keyboard: false
    });
}

/**
 * Genera dinámicamente las tarjetas (marcos de fotos) en el contenedor del álbum.
 * Esta función debe llamarse al iniciar el álbum para asegurar su visibilidad.
 */
function generarAlbum() {
    // Evita duplicar las tarjetas si se llama más de una vez
    if (contenedor.children.length > 0) return; 
    
    laminas.forEach(titulo => {
        // Usa la estructura de columnas de Bootstrap (col)
        const colDiv = document.createElement('div');
        colDiv.className = 'col mb-4'; 
        
        const cardDiv = document.createElement('div');
        // Usa h-100 y mx-auto para asegurar que la tarjeta ocupe toda la altura de la columna y esté centrada
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

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  // 1. Mostrar el modal de Bootstrap primero.
  if (bootstrapModal) {
      bootstrapModal.show();
  } else {
      modalElement.classList.remove('hidden'); 
  }

  // Detiene cualquier stream anterior.
  if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
  }

  // Solicitud de la cámara
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      
      // 2. Forzar la reproducción del video una vez que el stream está listo.
      video.onloadedmetadata = function() {
          video.play().catch(e => {
              console.error("Error al iniciar la reproducción de video:", e);
              alert("No se pudo iniciar la reproducción del video. Puede que necesites interacción adicional en tu navegador.");
              cerrarModal();
          });
      };

    })
    .catch(error => {
        console.error("Error al acceder a la cámara:", error);
        alert("No se pudo acceder a la cámara. Asegúrate de que no esté siendo usada por otra aplicación y de dar los permisos.");
        // Si falla la promesa, cerramos el modal.
        cerrarModal();
    });
}

function cerrarModal() {
    // Oculta el modal y detiene la cámara
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
  // Usa dimensiones reales o un fallback
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
