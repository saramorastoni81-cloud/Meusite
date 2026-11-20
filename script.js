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

// GUESTBOOK — compartilhado entre visitantes via Supabase.
// Configure a URL e a chave publica em supabase-config.js.
const guestForm = document.getElementById('guestbook-form');
const guestEntries = document.getElementById('guestbook-entries');
const guestCount = document.getElementById('guestbook-count');
const guestStatus = document.getElementById('guestbook-status');
const guestName = document.getElementById('guest-name');
const guestMessage = document.getElementById('guest-message');
const guestConfig = window.NOSTALGIA_SUPABASE || {};
const guestbookReady = Boolean(
  window.supabase && guestConfig.url && guestConfig.anonKey &&
  !guestConfig.url.includes('COLE_') && !guestConfig.anonKey.includes('COLE_')
);
const guestClient = guestbookReady
  ? window.supabase.createClient(guestConfig.url, guestConfig.anonKey)
  : null;

function setGuestStatus(message) {
  if (guestStatus) guestStatus.textContent = message;
}

function renderGuestEntries(entries) {
  if (!guestEntries) return;
  guestEntries.replaceChildren();
  entries.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'guest-entry';
    const heading = document.createElement('strong');
    heading.textContent = `${entry.name} says:`;
    const message = document.createElement('p');
    message.textContent = entry.message;
    const date = document.createElement('small');
    const parsedDate = entry.created_at ? new Date(entry.created_at) : null;
    date.textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleString('pt-BR')
      : (entry.date || 'DATE UNKNOWN');
    item.append(heading, message, date);
    guestEntries.append(item);
  });
  if (guestCount) guestCount.textContent = `[ ${entries.length} COMMENTS ] [ NEWEST FIRST ]`;
}

async function loadSharedGuestbook() {
  if (!guestClient) {
    setGuestStatus('GUESTBOOK SETUP NOT FINISHED — SEE SUPABASE-SETUP.txt');
    // Mantém visíveis neste navegador as mensagens antigas, sem fingir que são compartilhadas.
    try {
      const oldEntries = JSON.parse(localStorage.getItem('nostalgia-debute-guestbook-v1') || '[]');
      renderGuestEntries(oldEntries.slice().reverse());
    } catch { renderGuestEntries([]); }
    return;
  }
  setGuestStatus('LOADING MESSAGES...');
  const { data, error } = await guestClient
    .from('guestbook_entries')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('Guestbook load error:', error);
    setGuestStatus('COULD NOT LOAD THE GUESTBOOK. CHECK SUPABASE SETUP.');
    return;
  }
  renderGuestEntries(data || []);
  setGuestStatus('✦ MESSAGES FROM VISITORS AROUND THE WORLD ✦');
}

if (guestForm) {
  loadSharedGuestbook();
  guestForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = guestName.value.trim();
    const message = guestMessage.value.trim();
    if (!name || !message) return;
    if (name.length > 30 || message.length > 240) {
      setGuestStatus('NAME LIMIT: 30 CHARACTERS. MESSAGE LIMIT: 240.');
      return;
    }
    if (!guestClient) {
      setGuestStatus('GUESTBOOK IS NOT CONNECTED YET. FINISH SUPABASE SETUP FIRST.');
      return;
    }
    const submitButton = guestForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    setGuestStatus('SENDING YOUR MESSAGE...');
    const { error } = await guestClient
      .from('guestbook_entries')
      .insert({ name, message });
    if (submitButton) submitButton.disabled = false;
    if (error) {
      console.error('Guestbook insert error:', error);
      setGuestStatus('MESSAGE NOT SENT. PLEASE TRY AGAIN LATER.');
      return;
    }
    guestForm.reset();
    await loadSharedGuestbook();
    setGuestStatus('✦ THANK YOU FOR SIGNING MY GUESTBOOK! ✦');
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
