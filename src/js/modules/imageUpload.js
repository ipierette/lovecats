/**
 * imageUpload.js — Drag-and-drop image upload for anuncie-doacao.html
 *
 * Accepted: jpeg, png, webp, gif
 * Max file size: 5 MB per file
 * Max files: 6
 */

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 6;

let uploadedFiles = [];

export function initImageUpload() {
  const zone = document.querySelector('.dropzone');
  if (!zone) return;

  const fileInput = zone.querySelector('.dropzone__input');
  const preview = document.querySelector('.upload-preview');
  const status = document.querySelector('.upload-status');

  if (!fileInput || !preview) return;

  // ── File input change ───────────────────────────────────────
  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files), preview, status);
    fileInput.value = ''; // allow re-selecting same file
  });

  // ── Drag & drop ─────────────────────────────────────────────
  zone.addEventListener('dragenter', (e) => { e.preventDefault(); zone.classList.add('is-drag-over'); });
  zone.addEventListener('dragover',  (e) => { e.preventDefault(); });
  zone.addEventListener('dragleave', (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-drag-over');
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-drag-over');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, preview, status);
  });
}

function handleFiles(files, preview, status) {
  const remaining = MAX_FILES - uploadedFiles.length;
  if (remaining <= 0) {
    showStatus(status, `Máximo de ${MAX_FILES} imagens atingido.`, 'is-error');
    return;
  }

  const accepted = [];
  const errors = [];

  files.slice(0, remaining).forEach((file) => {
    if (!ACCEPTED.includes(file.type)) {
      errors.push(`${file.name}: tipo não suportado`);
    } else if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: tamanho máximo é 5 MB`);
    } else {
      accepted.push(file);
    }
  });

  accepted.forEach((file) => addFile(file, preview));

  if (errors.length) {
    showStatus(status, errors.join(' · '), 'is-error');
  } else if (accepted.length) {
    showStatus(status, `${uploadedFiles.length} de ${MAX_FILES} imagens adicionadas.`, 'is-ok');
  }
}

function addFile(file, preview) {
  const id = Date.now() + Math.random();
  uploadedFiles.push({ id, file });

  const reader = new FileReader();
  reader.onload = (e) => {
    const thumb = createThumb(id, e.target.result, file.name, preview);
    preview.appendChild(thumb);
  };
  reader.readAsDataURL(file);
}

function createThumb(id, src, altText, preview) {
  const wrap = document.createElement('div');
  wrap.className = 'preview-thumb';
  wrap.dataset.id = id;

  const img = document.createElement('img');
  img.src = src;
  img.alt = altText;

  const btn = document.createElement('button');
  btn.className = 'preview-thumb__remove';
  btn.type = 'button';
  btn.setAttribute('aria-label', `Remover ${altText}`);
  btn.innerHTML = `<svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 2l10 10M12 2L2 12" stroke-linecap="round"/>
  </svg>`;

  btn.addEventListener('click', () => {
    uploadedFiles = uploadedFiles.filter((f) => f.id !== id);
    wrap.remove();
  });

  wrap.appendChild(img);
  wrap.appendChild(btn);
  return wrap;
}

function showStatus(el, msg, cls) {
  if (!el) return;
  el.textContent = msg;
  el.className = `upload-status ${cls}`;
}

/** Returns the current array of File objects ready for FormData. */
export function getUploadedFiles() {
  return uploadedFiles.map((f) => f.file);
}
