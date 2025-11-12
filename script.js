// ... (código previo)

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  
  // 1. Mostrar el modal de Bootstrap primero.
  if (bootstrapModal) {
      bootstrapModal.show();
  } else {
      // Si por alguna razón el objeto modal no se inicializó, aseguramos visibilidad
      modalElement.classList.remove('hidden'); 
  }

  // Detiene cualquier stream anterior para evitar errores (Esto es correcto)
  if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
  }

  // Solicitud de la cámara
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      
      // 2. ¡IMPORTANTE! Forzar la reproducción del video
      // Algunos navegadores requieren una llamada explícita a .play() después de establecer srcObject.
      // Usaremos un `loadedmetadata` event listener para ser más robustos.
      video.onloadedmetadata = function() {
          video.play().catch(e => {
              console.error("Error al iniciar la reproducción de video:", e);
              alert("No se pudo iniciar la reproducción del video. Puede que necesites interacción adicional en tu navegador.");
              // Opcional: Cerrar el modal si falla la reproducción
              cerrarModal();
          });
      };

    })
    .catch(error => {
        console.error("Error al acceder a la cámara:", error);
        alert("No se pudo acceder a la cámara. Asegúrate de que no esté siendo usada por otra aplicación y de dar los permisos.");
        // Si falla la promesa, cerramos el modal que ya abrimos.
        cerrarModal();
    });
}

// ... (código posterior)
