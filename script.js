// --- 1. Definir constantes y variables de estado ---
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

// Variables de estado
let currentLamina = null;
let currentCard = null;
let stream = null;
let bootstrapModal = null; 
let currentFacingMode = 'user'; 

// --- 2. DECLARAR variables de elementos (¡no asignar!) ---
let contenedor = null;
let modalElement = null;
let video = null;
let tituloLamina = null;


// --- 3. ASIGNAR variables e inicializar DENTRO de DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', (event) => {
    
    // 3a. ¡Ahora SÍ asignamos las variables!
    // En este punto, el <body> y todos sus elementos existen.
    contenedor = document.getElementById('laminas');
    modalElement = document.getElementById('camera-modal');
    video = document.getElementById('video');
    tituloLamina = document.getElementById('titulo-lamina');

    // 3b. Validar que los elementos principales existan
    if (!contenedor || !modalElement || !video || !tituloLamina) {
        console.error("Error crítico: Faltan elementos esenciales del DOM. Revisa tu HTML.");
        alert("Error al cargar la página. Refresca.");
        return;
    }

    // 3c. Inicializar el modal (ahora modalElement no es null)
    if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        
        bootstrapModal = new bootstrap.Modal(modalElement, {
            keyboard: false, 
            backdrop: 'static'
        });

        // Añadir listeners al modal
        modalElement.addEventListener('shown.bs.modal', () => {
            currentFacingMode = 'user';
            iniciarCamara(currentFacingMode);
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            cerrarStream(); 
        });

    } else {
        console.error("Error fatal: La librería de Bootstrap no se pudo cargar a tiempo.");
    }
});


// --- 4. El resto de las funciones permanecen globales ---
// (Estas funciones son llamadas por 'onclick' o por otras funciones)

/**
 * Inicia el álbum: genera las tarjetas y muestra el contenido.
 */
function iniciarAlbum() {
  generarAlbum(); 
  document.getElementById('landing').classList.add('hidden'); 
  document.getElementById('contenido').classList.remove('hidden');
}

/**
 * Genera dinámicamente las tarjetas (marcos de fotos)
 * Usa 'addEventListener' para seguridad y compatibilidad.
 */
function generarAlbum() {
    // 'contenedor' fue asignado en DOMContentLoaded
    if (!contenedor) {
        console.error("Error: El 'contenedor' de láminas es nulo.");
        return;
    }
    if (contenedor.children.length > 0) return; // Evita duplicar
    
    laminas.forEach(titulo => {
        // Crear elementos
        const colDiv = document.createElement('div');
        colDiv.className = 'col mb-4';
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 mx-auto';
        
        const innerFrame = document.createElement('div');
        innerFrame.className = 'inner-frame';
        
        const p = document.createElement('p');
        p.className = 'text-center';
        p.textContent = titulo;

        // Añadir el Event Listener
        innerFrame.addEventListener('click', () => {
            abrirCamara(titulo, innerFrame); 
        });

        // Ensamblar
        cardDiv.appendChild(innerFrame);
        cardDiv.appendChild(p);
        colDiv.appendChild(cardDiv);
        contenedor.appendChild(colDiv);
    });
}

/**
 * Detiene el stream de video
 */
function cerrarStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        if (video) video.srcObject = null;
    }
}

/**
 * Inicia la cámara (frontal o trasera)
 */
async function iniciarCamara(facingMode) {
    cerrarStream(); 

    if (!video) {
        console.error("Error: El elemento <video> es nulo.");
        return;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { exact: facingMode }
            }
        });

        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play().catch(e => {
                console.error("Fallo al reproducir el video:", e);
                alert("No se pudo iniciar la previsualización de la cámara.");
            });
        };

    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        
        if (error.name === 'OverconstrainedError' && facingMode === 'environment') {
            alert("No se pudo acceder a la cámara trasera. Intentando con la cámara frontal.");
            currentFacingMode = 'user';
            iniciarCamara(currentFacingMode);
        } else {
            alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
            cerrarModal(); 
        }
    }
}

/**
 * Cambia entre la cámara frontal y trasera
 */
function cambiarCamara() {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    iniciarCamara(currentFacingMode);
}

/**
 * Prepara los datos para el modal y lo muestra.
 */
function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  
  if (!tituloLamina) {
      console.error("Error: El elemento 'tituloLamina' es nulo.");
      return;
  }
  tituloLamina.textContent = titulo;
  
  if (bootstrapModal) {
      bootstrapModal.show();
  } else {
      alert("Error: El modal no está inicializado. Refresca.");
  }
}

/**
 * Cierra el modal.
 */
function cerrarModal() {
    if (bootstrapModal) {
        bootstrapModal.hide();
    }
}

/**
 * Inserta la imagen capturada en el marco
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
  
  cerrarModal(); 
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
  
  cerrarModal(); 
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
