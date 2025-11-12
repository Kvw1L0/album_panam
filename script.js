// Constantes globales
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

// Variables globales
let currentLamina = null;
let currentCard = null;
let stream = null;
let bootstrapModal = null; 
let currentFacingMode = 'user'; 

// 💡 --- ¡SOLUCIÓN DEFINITIVA! --- 💡
// Espera a que el DOM esté listo y los scripts (defer) se hayan cargado.
document.addEventListener('DOMContentLoaded', (event) => {
    
    // 1. ESTO SÍ VA DENTRO: Inicializar el modal.
    // Para este punto, 'bootstrap' (del CDN) ya está cargado.
    if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        
        bootstrapModal = new bootstrap.Modal(modalElement, {
            keyboard: false, 
            backdrop: 'static'
        });

        // 2. ESTO SÍ VA DENTRO: Añadir listeners al modal.
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

    // 3. NO LLAMES a iniciarAlbum() aquí.
    // ¡Dejar este espacio vacío es correcto!
});
// 💡 --- FIN DEL BLOQUE DOMContentLoaded --- 💡


//
// --- TODAS LAS FUNCIONES DEBEN ESTAR FUERA, EN EL ÁMBITO GLOBAL ---
//

/**
 * Inicia el álbum: genera las tarjetas y muestra el contenido.
 * Esta función es llamada por 'onclick' en el HTML.
 */
function iniciarAlbum() {
  generarAlbum(); 
  document.getElementById('landing').classList.add('hidden'); 
  document.getElementById('contenido').classList.remove('hidden');
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
  tituloLamina.textContent = titulo;
  
  if (bootstrapModal) {
      bootstrapModal.show();
  } else {
      // Este error solo debería saltar si el DOMContentLoaded falló.
      alert("Error: El modal no está inicializado. Revisa la conexión o refresca.");
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
