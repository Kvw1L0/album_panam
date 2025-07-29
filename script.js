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
const modal = document.getElementById('camera-modal');
const video = document.getElementById('video');
const tituloLamina = document.getElementById('titulo-lamina');

let currentLamina = null;
let currentCard = null;
let stream = null;

function getRandomAngle() {
  const angles = [-8, -5, 0, 3, 5, 8];
  return angles[Math.floor(Math.random() * angles.length)];
}

laminas.forEach(titulo => {
  const div = document.createElement('div');
  div.className = 'card';
  div.style.setProperty('--angle', getRandomAngle() + 'deg');
  div.innerHTML = `<p>${titulo}</p>`;
  div.onclick = () => abrirCamara(titulo, div);
  contenedor.appendChild(div);
});

function abrirCamara(titulo, cardRef) {
  currentLamina = titulo;
  currentCard = cardRef;
  tituloLamina.textContent = titulo;
  modal.classList.remove('hidden');
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

  currentCard.innerHTML = `<img src="${dataUrl}" class="shrink-in">`;

  modal.classList.add('hidden');
  if (stream) stream.getTracks().forEach(track => track.stop());
}
