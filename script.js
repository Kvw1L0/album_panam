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

let currentLamina = null;
let currentCard = null;
let stream = null;
let bootstrapModal = null; 
let currentFacingMode = 'user'; 

// --- 2. Asignar variables de elementos ---
const contenedor = document.getElementById('laminas');
const modalElement = document.getElementById('camera-modal');
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');


// 💡 --- ¡SOLUCIÓN AQUÍ! --- 💡
// Esta función intentará inicializar el modal. Si Bootstrap no está listo,
// esperará 100ms y lo volverá a intentar.
function intentarInicializarModal(intentosRestantes = 10) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        // ¡Éxito! Bootstrap está cargado.
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
        
        console.log("Modal de Bootstrap inicializado con éxito.");

    } else if (intentosRestantes > 0) {
        // Bootstrap no está listo. Reintentamos en 100ms.
        console.log("Esperando a Bootstrap... reintento pendiente.");
        setTimeout(() => intentarInicializarModal(intentosRestantes - 1), 100);
    } else {
        // Fracaso total después de 10 intentos.
        console.error("Error: No se pudo cargar la librería Bootstrap a tiempo.");
        alert("Error: No se pudo cargar la librería Bootstrap. Revisa tu conexión y refresca.");
    }
}

// --- 3. Validar elementos e INICIAR el intento de inicialización ---
if (!contenedor || !modalElement || !video || !tituloLamina) {
    console.error("Error crítico: Faltan elementos esenciales del DOM. Revisa tu HTML.");
    alert("Error al cargar la página. Refresca."); 
} else {
    // En lugar de inicializar directamente, llamamos a nuestra función de reintento.
    intentarInicializarModal();
}
// 💡 --- FIN DE LA SOLUCIÓN --- 💡


// --- 4. El resto de las funciones permanecen globales ---

function iniciarAlbum() {
  generarAlbum(); 
  document.getElementById('landing').classList.add('hidden'); 
  document.getElementById('contenido').classList.remove('hidden');
}

function generarAlbum() {
    if (!contenedor) return;
    if (contenedor.children.length > 0) return;
    
    laminas.forEach(titulo => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col mb-4';
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card h-100 mx-auto';
        const innerFrame = document.createElement('div');
        innerFrame.className = 'inner-frame';
        const p = document.createElement('p');
        p.className = 'text-center';
        p.textContent = titulo;

        innerFrame.addEventListener('click', () => {
            abrirCamara(titulo, innerFrame); 
        });

        cardDiv.appendChild(innerFrame);
        cardDiv.appendChild(p);
        colDiv.appendChild(cardDiv);
        contenedor.appendChild(colDiv);
    });
}

function cerrarStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        if (video) video.srcObject = null;
    }
}

async function iniciarCamara(facingMode) {
    cerrarStream(); 
    if (!video) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { exact: facingMode }
            }
        });

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play().catch(e => console.error("Fallo al reproducir el video:", e));
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

function cambiarCamara() {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    iniciarCamara(currentFacingMode);
}

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  if (!tituloLamina) return;
  tituloLamina.textContent = titulo;
  
  if (bootstrapModal) {
      bootstrapModal.show();
  } else {
      // Este es el error que estabas viendo.
      alert("Error: El modal no está inicializado. Refresca.");
  }
}

function cerrarModal() {
    if (bootstrapModal) {
        bootstrapModal.hide();
    }
}

function insertarImagen(dataUrl) {
  if (!currentCard) return;
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
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
  // Corrección de un error tipográfico anterior (GURI -> DataURL)
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
