// NOSTALGIA DEBUTE — pequenas interações do site
// O contador continua cenográfico: não mede visitas reais.
const count = document.getElementById('count');
if (count) count.textContent = String(482 + Math.floor(Math.random() * 50)).padStart(3, '0');

// Segredo: abre e fecha a mensagem escondida.
const secretButton = document.getElementById('secret-button');
const secret = document.getElementById('secret');
if (secretButton && secret) {
  secretButton.addEventListener('click', () => {
    secret.hidden = !secret.hidden;
    secretButton.textContent = secret.hidden ? 'CLICK???' : 'HIDE THE SECRET';
  });
}

// Guestbook salvo neste navegador (localStorage). Não é compartilhado entre visitantes.
const guestForm = document.getElementById('guestbook-form');
const guestEntries = document.getElementById('guestbook-entries');
const guestCount = document.getElementById('guestbook-count');
const storageKey = 'nostalgia-debute-guestbook-v1';
function loadEntries() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
  catch { return []; }
}
function renderEntries() {
  if (!guestEntries) return;
  const entries = loadEntries();
  guestEntries.replaceChildren();
  entries.slice().reverse().forEach(entry => {
    const item = document.createElement('div'); item.className = 'guest-entry';
    const heading = document.createElement('strong'); heading.textContent = entry.name + ' says:';
    const message = document.createElement('p'); message.textContent = entry.message;
    const date = document.createElement('small'); date.textContent = entry.date;
    item.append(heading, message, date); guestEntries.append(item);
  });
  if (guestCount) guestCount.textContent = `[ ${entries.length} COMMENTS ] [ PAGE 1 OF ??? ]`;
}
if (guestForm) {
  renderEntries();
  guestForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('guest-name').value.trim();
    const message = document.getElementById('guest-message').value.trim();
    if (!name || !message) return;
    const entries = loadEntries();
    entries.push({ name, message, date: new Date().toLocaleDateString('pt-BR') });
    try { localStorage.setItem(storageKey, JSON.stringify(entries.slice(-50))); }
    catch { alert('Seu navegador não permitiu salvar a mensagem :('); return; }
    guestForm.reset(); renderEntries();
  });
}

// Clique em imagens para ampliar; ESC ou botão fecha.
const viewer = document.getElementById('image-viewer');
const viewerImage = document.getElementById('viewer-image');
const closeViewer = () => { if (viewer) viewer.hidden = true; };
if (viewer && viewerImage) {
  document.querySelectorAll('img:not(.no-zoom)').forEach(img => {
    img.tabIndex = 0; img.classList.add('zoomable');
    const open = () => { viewerImage.src = img.src; viewerImage.alt = img.alt || 'Image preview'; viewer.hidden = false; };
    img.addEventListener('click', open);
    img.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  document.getElementById('viewer-close').addEventListener('click', closeViewer);
  viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeViewer(); });
}

// Link aleatório entre as áreas do arquivo.
const randomLink = document.getElementById('webring-random');
if (randomLink) {
  const destinations = ['mlp.html', 'furry.html', 'sonic.html', 'ships.html', 'galeria.html', 'autor.html'];
  randomLink.addEventListener('click', event => {
    event.preventDefault(); location.href = destinations[Math.floor(Math.random() * destinations.length)];
  });
}
