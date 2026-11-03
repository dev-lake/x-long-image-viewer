(async () => {
await window.siteI18n.ready;
const t = window.siteI18n.t;
const viewport = document.querySelector('#image-viewport');
const demoImage = document.querySelector('#demo-image');
const zoomValue = document.querySelector('#zoom-reset');
const textButton = document.querySelector('#select-text');
const toast = document.querySelector('.demo-toast');
const minimapPosition = document.querySelector('.minimap-position');
const slides = [
  { heading: t('demo.slide1Heading'), subtitle: t('demo.slide1Subtitle'), title: t('demo.slide1Title'), body: t('demo.slide1Body'), background: '#eff6f4', ink: '#233c40', sky: '#c9e3e1', mountain: '#387d82' },
  { heading: t('demo.slide2Heading'), subtitle: t('demo.slide2Subtitle'), title: t('demo.slide2Title'), body: t('demo.slide2Body'), background: '#f4f0e8', ink: '#5d5144', sky: '#e7d8bd', mountain: '#a79175' },
  { heading: t('demo.slide3Heading'), subtitle: t('demo.slide3Subtitle'), title: t('demo.slide3Title'), body: t('demo.slide3Body'), background: '#eef1f8', ink: '#384567', sky: '#d3dcef', mountain: '#7d8fb3' }
];
let zoom = 1;
let slideIndex = 0;
let textMode = false;
let toastTimer;
let drag;
const viewer = document.querySelector('.viewer');
const settingsButton = document.querySelector('#demo-settings-button');
const settingsPanel = document.querySelector('#demo-settings');
const guidePanel = document.querySelector('#demo-guide');
const startSelection = document.querySelector('#start-demo-selection');
let guideSeen = false;

function closeSettings(restoreFocus = false) {
  settingsPanel.hidden = true;
  settingsButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) settingsButton.focus({ preventScroll: true });
}

function openSettings() {
  guidePanel.hidden = true;
  settingsPanel.hidden = false;
  settingsButton.setAttribute('aria-expanded', 'true');
  settingsPanel.querySelector('input:checked').focus({ preventScroll: true });
}

function closeGuide(restoreFocus = false) {
  guidePanel.hidden = true;
  guideSeen = true;
  if (restoreFocus) textButton.focus({ preventScroll: true });
}

function showGuide() {
  closeSettings();
  guidePanel.hidden = false;
  startSelection.focus({ preventScroll: true });
}

settingsButton.addEventListener('click', () => settingsPanel.hidden ? openSettings() : closeSettings(true));
document.querySelector('[data-close-demo-panel="settings"]').addEventListener('click', () => closeSettings(true));
document.querySelectorAll('input[name="demo-style"]').forEach(input => input.addEventListener('change', () => {
  viewer.dataset.toolbarStyle = input.value;
}));
document.querySelectorAll('input[name="demo-position"]').forEach(input => input.addEventListener('change', () => {
  viewer.dataset.toolbarPosition = input.value;
}));
document.querySelector('#show-demo-guide').addEventListener('click', showGuide);
document.querySelector('#try-glass-settings').addEventListener('click', openSettings);
document.querySelector('#try-demo-guide').addEventListener('click', showGuide);
document.querySelector('#dismiss-demo-guide').addEventListener('click', () => closeGuide(true));
startSelection.addEventListener('click', () => {
  closeGuide();
  setTextMode(true);
  viewport.focus({ preventScroll: true });
});
document.addEventListener('pointerdown', event => {
  if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) closeSettings();
  if (!guidePanel.hidden && !guidePanel.contains(event.target) && !textButton.contains(event.target)) closeGuide();
});
document.addEventListener('focusin', event => {
  if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) closeSettings();
  if (!guidePanel.hidden && !guidePanel.contains(event.target)) closeGuide();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || (settingsPanel.hidden && guidePanel.hidden)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!settingsPanel.hidden) closeSettings(true);
  else closeGuide(true);
}, true);

function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3800);
}

function updateMinimap() {
  const available = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const ratio = available ? Math.min(1, Math.max(0, viewport.scrollTop / available)) : 0;
  const map = document.querySelector('.minimap');
  const travel = Math.max(0, map.clientHeight - minimapPosition.offsetHeight - 4);
  minimapPosition.style.transform = `translateY(${ratio * travel}px)`;
}

function setZoom(value) {
  zoom = Math.min(1.75, Math.max(.5, value));
  demoImage.style.zoom = String(zoom);
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  zoomValue.setAttribute('aria-label', t('demo.zoomReset', { percent: Math.round(zoom * 100) }));
  document.querySelector('#zoom-in').disabled = zoom >= 1.75;
  document.querySelector('#zoom-out').disabled = zoom <= .5;
  requestAnimationFrame(updateMinimap);
}

function sizeDemo() {
  // Scale the entire illustration to keep its composition intact on narrow screens.
  const baseWidth = Math.min(450, viewport.clientWidth - (viewport.clientWidth < 600 ? 70 : 150));
  demoImage.style.width = '450px';
  demoImage.style.setProperty('zoom', String((baseWidth / 450) * zoom));
  requestAnimationFrame(updateMinimap);
}

function changeZoom(value) {
  setZoom(value);
  sizeDemo();
}

function setTextMode(enabled, showHint = true) {
  textMode = enabled;
  demoImage.classList.toggle('text-mode', enabled);
  textButton.setAttribute('aria-pressed', String(enabled));
  viewport.style.cursor = enabled ? 'text' : '';
  if (showHint) announce(t(enabled ? 'toast.textOn' : 'toast.textOff'));
}

function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  const slide = slides[slideIndex];
  // All slide content is static, authored data; no external HTML is accepted.
  document.querySelector('#demo-heading').innerHTML = slide.heading;
  document.querySelector('#demo-subtitle').textContent = slide.subtitle;
  document.querySelector('#demo-article-title').textContent = slide.title;
  document.querySelector('#demo-article-body').textContent = slide.body;
  document.querySelector('#image-issue').textContent = `ISSUE 00${slideIndex + 1}`;
  document.querySelector('.viewer-counter').textContent = `0${slideIndex + 1} / 03`;
  demoImage.style.backgroundColor = slide.background;
  demoImage.style.color = slide.ink;
  document.querySelector('.landscape').style.backgroundColor = slide.sky;
  document.querySelector('.mountain-front').style.backgroundColor = slide.mountain;
  demoImage.setAttribute('aria-label', t('demo.imageLabel', { number: slideIndex + 1 }));
  changeZoom(1);
  viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

document.querySelector('#zoom-in').addEventListener('click', () => changeZoom(zoom + .25));
document.querySelector('#zoom-out').addEventListener('click', () => changeZoom(zoom - .25));
const zoomPresets = [.5, .8, 1];
zoomValue.addEventListener('click', () => {
  const current = zoomPresets.findIndex(preset => Math.abs(preset - zoom) < .001);
  changeZoom(zoomPresets[(current + 1) % zoomPresets.length]);
});
document.querySelector('#fit-image').addEventListener('click', () => { changeZoom(1); viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' }); announce(t('toast.fit')); });
textButton.addEventListener('click', () => {
  if (!textMode && !guideSeen) showGuide();
  else setTextMode(!textMode);
});
document.querySelector('.previous').addEventListener('click', () => showSlide(slideIndex - 1));
document.querySelector('.next').addEventListener('click', () => showSlide(slideIndex + 1));

document.querySelector('#copy-text').addEventListener('click', async () => {
  const selection = window.getSelection();
  const selected = selection && demoImage.contains(selection.anchorNode) && demoImage.contains(selection.focusNode) ? selection.toString().trim() : '';
  const content = selected || demoImage.innerText;
  try {
    await navigator.clipboard.writeText(content);
    announce(t(selected ? 'toast.copySelection' : 'toast.copyAll'));
  } catch {
    setTextMode(true, false);
    const range = document.createRange();
    range.selectNodeContents(demoImage);
    selection?.removeAllRanges();
    selection?.addRange(range);
    announce(t('toast.copyFallback'));
  }
});

document.querySelector('#try-text').addEventListener('click', () => {
  viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (!guideSeen) showGuide();
  else {
    setTextMode(true);
    viewport.focus({ preventScroll: true });
  }
});

viewport.addEventListener('scroll', updateMinimap, { passive: true });
viewport.addEventListener('dblclick', (event) => { if (!textMode && event.target.closest('.demo-image')) changeZoom(zoom > 1 ? 1 : 1.5); });
viewport.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(zoom + .25); }
  if (event.key === '-') { event.preventDefault(); changeZoom(zoom - .25); }
  if (event.key === '0') { event.preventDefault(); changeZoom(1); }
  if (event.key === 'Escape') setTextMode(false, false);
});
viewport.addEventListener('pointerdown', (event) => {
  if (textMode || event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, active: false };
});
viewport.addEventListener('pointermove', (event) => {
  if (!drag) return;
  if (!drag.active) {
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
    drag.active = true;
    viewport.setPointerCapture(event.pointerId);
  }
  viewport.scrollLeft = drag.left - (event.clientX - drag.x);
  viewport.scrollTop = drag.top - (event.clientY - drag.y);
});
function endDrag() { drag = undefined; }
viewport.addEventListener('pointerup', endDrag);
window.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('lostpointercapture', endDrag);
new ResizeObserver(sizeDemo).observe(viewport);
sizeDemo();

showSlide(0);
})();
