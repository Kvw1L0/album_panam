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

const fotos = {};
const contenedor = document.getElementById('laminas');
const cameraContainer = document.getElementById('camera-container');
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

let currentLamina = null;
let stream = null;

laminas.forEach(titulo => {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<p>${titulo}</p>`;
  div.onclick = () => abrirCamara(titulo, div);
  contenedor.appendChild(div);
});

function abrirCamara(titulo, divRef) {
  currentLamina = titulo;
  tituloLamina.textContent = titulo;
  cameraContainer.classList.remove('hidden');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
    });
}

function capturarFoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL();

  [...contenedor.children].forEach(div => {
    if (div.textContent === currentLamina) {
      div.innerHTML = `<img src="${dataUrl}" alt="Foto">`;
    }
  });

  cameraContainer.classList.add('hidden');
  stream.getTracks().forEach(track => track.stop());
}
