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
let bootstrapModal = null; // Inicia como null. Se inicializará al primer clic.
let currentFacingMode = 'user'; // 'user' es la cámara frontal

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
 * Cambia entre la cámara frontal y trasera (Requisito 3)
 */
function cambiarCamara() {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    iniciarCamara(currentFacingMode);
}

// 💡 --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- 💡

/**
 * Inicializa el modal de Bootstrap (si no lo está) y luego lo muestra.
 * Esto evita el error de que el script de Bootstrap no esté cargado.
 */
function inicializarYMostrarModal() {
    // 1. Si el modal AÚN NO se ha inicializado...
    if (!bootstrapModal) {
        // 2. Comprueba si la librería Bootstrap está LISTA AHORA.
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            
            // 3. Inicializa el modal
            bootstrapModal = new bootstrap.Modal(modalElement, {
                keyboard: false, 
                backdrop: 'static'
            });

            // 4. Añade los listeners AHORA
            modalElement.addEventListener('shown.bs.modal', () => {
                currentFacingMode = 'user';
                iniciarCamara(currentFacingMode);
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                cerrarStream(); 
            });
            
        } else {
            // Si Bootstrap sigue sin cargar, es un error fatal.
            alert("Error: La librería de Bootstrap no se pudo cargar. Revisa la conexión a internet o refresca la página.");
            return; // No continúa
        }
    }
    
    // 5. Si todo fue bien (o ya estaba inicializado), muestra el modal.
    bootstrapModal.show();
}


/**
 * Prepara los datos para el modal y llama a la función de inicialización.
 */
function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  // Llama a la nueva función que maneja la inicialización
  inicializarYMostrarModal();
}

/**
 * Cierra el modal. La lógica de apagar la cámara se dispara por 'hidden.bs.modal'
 */
function cerrarModal() {
    // Solo intenta ocultar si el modal ha sido inicializado
    if (bootstrapModal) {
        bootstrapModal.hide();
    }
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
