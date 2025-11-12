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
let currentFacingMode = 'user'; 

// --- 2. Asignar variables de elementos ---
// (Esto funciona porque el script está al final del <body>)
const contenedor = document.getElementById('laminas');
const modalElement = document.getElementById('camera-modal');
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

// Validar que los elementos existan
if (!contenedor || !modalElement || !video || !tituloLamina) {
    console.error("Error crítico: Faltan elementos esenciales del DOM. Revisa tu HTML.");
    alert("Error al cargar la página. Refresca."); 
}

// --- 3. Funciones Globales ---

function iniciarAlbum() {
  generarAlbum(); 
  document.getElementById('landing').classList.add('hidden'); 
  document.getElementById('contenido').classList.remove('hidden');
}

function generarAlbum() {
    if (!contenedor) return;
    if (contenedor.children.length > 0) return;
    
    laminas.forEach(titulo => {
        // Usamos nuestras nuevas clases 'grid-col' y 'card'
        const colDiv = document.createElement('div');
        colDiv.className = 'grid-col';
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        const innerFrame = document.createElement('div');
        innerFrame.className = 'inner-frame';
        
        const p = document.createElement('p');
        p.className = 'text-center';
        p.textContent = titulo;

        // Listener de clic directo
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

// 💡 --- LÓGICA DEL MODAL SIMPLIFICADA --- 💡
function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  if (!tituloLamina) return;
  tituloLamina.textContent = titulo;
  
  // Simplemente mostramos el modal
  if (modalElement) {
      modalElement.classList.remove('hidden');
      // Iniciamos la cámara manualmente
      currentFacingMode = 'user';
      iniciarCamara(currentFacingMode);
  } else {
      alert("Error: No se encontró el modal.");
  }
}

function cerrarModal() {
    // Escondemos el modal y apagamos la cámara
    if (modalElement) {
        modalElement.classList.add('hidden');
    }
    cerrarStream(); // Apaga la cámara
}
// 💡 --- FIN DE LA LÓGICA DEL MODAL --- 💡

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
