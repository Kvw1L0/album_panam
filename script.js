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
// Variable para rastrear la cámara (Requisito 3)
let currentFacingMode = 'user'; // 'user' es la cámara frontal

// Inicializar el objeto Modal de Bootstrap
if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrapModal = new bootstrap.Modal(modalElement, {
        keyboard: false, // No se puede cerrar con Esc
        backdrop: 'static' // No se puede cerrar haciendo clic afuera
    });

    // 💡 SOLUCIÓN: Escuchar los eventos del modal
    
    // 1. Cuando el modal se HAYA MOSTRADO, encender la cámara.
    modalElement.addEventListener('shown.bs.modal', () => {
        // Iniciar con la cámara frontal por defecto
        currentFacingMode = 'user';
        iniciarCamara(currentFacingMode);
    });

    // 2. Cuando el modal se HAYA OCULTADO, apagar la cámara.
    modalElement.addEventListener('hidden.bs.modal', () => {
        cerrarStream(); // Función dedicada para apagar la cámara
    });
}

/**
 * Genera dinámicamente las tarjetas (marcos de fotos)
 */
function generarAlbum() {
    if (contenedor.children.length > 0) return; // Evita duplicar
    
    laminas.forEach(titulo => {
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

/**
 * Inicia el álbum: genera las tarjetas y muestra el contenido.
 */
function iniciarAlbum() {
  generarAlbum(); // (Requisito 2)
  document.getElementById('landing').classList.add('hidden'); // (Requisito 1)
  document.getElementById('contenido').classList.remove('hidden');
}

/**
 * Detiene el stream de video y limpia el elemento <video>
 */
function cerrarStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
}

/**
 * Función principal para iniciar la cámara (frontal o trasera)
 */
async function iniciarCamara(facingMode) {
    cerrarStream(); // Apaga cualquier cámara anterior

    try {
        // Pide el stream de video
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { exact: facingMode } // 'user' (frontal) o 'environment' (trasera)
            }
        });

        video.srcObject = stream;
        
        // Espera a que los metadatos carguen y LUEGO reproduce
        video.onloadedmetadata = () => {
            video.play().catch(e => {
                console.error("Fallo al reproducir el video:", e);
                alert("No se pudo iniciar la previsualización de la cámara.");
            });
        };

    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        
        // Error común: El dispositivo no tiene la cámara solicitada (ej. pedir trasera en laptop)
        if (error.name === 'OverconstrainedError' && facingMode === 'environment') {
            alert("No se pudo acceder a la cámara trasera. Intentando con la cámara frontal.");
            // Fallback: Si falla la trasera, intenta con la frontal
            currentFacingMode = 'user';
            iniciarCamara(currentFacingMode);
        } else {
            // Error de permisos u otro
            alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
            cerrarModal(); // Cierra el modal si no hay permisos
        }
    }
}

/**
 * Cambia entre la cámara frontal y trasera (Requisito 3)
 */
function cambiarCamara() {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    iniciarCamara(currentFacingMode);
}

/**
 * Abre el modal. La lógica de la cámara se dispara por el evento 'shown.bs.modal'
 */
function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  if (bootstrapModal) {
      bootstrapModal.show(); // (Requisito 3)
  } else {
      alert("Error: No se pudo cargar el modal.");
  }
}

/**
 * Cierra el modal. La lógica de apagar la cámara se dispara por 'hidden.bs.modal'
 */
function cerrarModal() {
    if (bootstrapModal) bootstrapModal.hide();
}

/**
 * Inserta la imagen capturada en el marco (Requisito 4)
 */
function insertarImagen(dataUrl) {
  if (!currentCard) return;
  currentCard.innerHTML = ''; // Limpia el marco
  
  const img = document.createElement('img');
  img.src = dataUrl;
  img.className = 'shrink-in';
  
  currentCard.appendChild(img);
}

/**
 * Captura la foto desde el video
 */
function capturarFoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 300;
  canvas.height = video.videoHeight || 300;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  insertarImagen(dataUrl);
  
  cerrarModal(); // Esto disparará el evento 'hidden' y apagará la cámara
}

/**
 * Sube la foto desde la galería del dispositivo
 */
function subirDesdeGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    insertarImagen(e.target.result);
  };
  reader.readAsDataURL(file);
  
  cerrarModal(); // Esto disparará el evento 'hidden'
}

// Funciones de utilidad (sin cambios)
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
