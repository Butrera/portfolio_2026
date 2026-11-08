(() => {
  const key = 'portfolio-privacy-v1';
  const ttl = 180 * 24 * 60 * 60 * 1000;
  const services = ['whimsical', 'heyzine', 'fonts'];
  const denied = () => Object.fromEntries(services.map((id) => [id, false]));
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 1 && Number.isFinite(saved.expires) && saved.expires > Date.now()
          && services.every((id) => typeof saved.choices?.[id] === 'boolean')) return saved.choices;
    } catch {}
    return null;
  };

  let choices = read();
  let opener = null;
  const frames = [...document.querySelectorAll('iframe[data-privacy-frame]')];
  const fonts = [...document.querySelectorAll('link[data-privacy-fonts]')];
  const toggles = [...document.querySelectorAll('[data-privacy-open]')];

  const setSource = (node, attribute, url, enabled) => {
    if (enabled && node.getAttribute(attribute) !== url) node.setAttribute(attribute, url);
    if (!enabled && node.hasAttribute(attribute)) node.removeAttribute(attribute);
  };

  const sync = () => {
    fonts.forEach((link) => setSource(link, 'href', link.dataset.privacyFonts, choices?.fonts));
    frames.forEach((frame) => {
      const allowed = choices?.[frame.dataset.privacyFrame] === true;
      if (allowed && frame.closest('.Lightbox[hidden]')) return;
      const placeholder = frame.parentElement.querySelector('[data-privacy-placeholder]');
      const moveFocus = allowed && placeholder?.contains(document.activeElement);
      frame.hidden = !allowed;
      setSource(frame, 'src', frame.dataset.privacySrc, allowed);
      if (placeholder) placeholder.hidden = allowed;
      if (moveFocus) frame.focus();
    });
  };

  document.body.insertAdjacentHTML('beforeend', `
    <section class="Privacy-banner" aria-labelledby="privacy-banner-title" hidden>
      <h2 class="Privacy-title" id="privacy-banner-title" tabindex="-1">Cookies y contenido externo</h2>
      <p class="Privacy-text">Whimsical y Heyzine pueden usar cookies o tecnologías similares al mostrar los proyectos. Google Fonts es opcional y recibe datos de conexión al servir las fuentes. Puedes navegar sin activarlos.</p>
      <p class="Privacy-text"><a class="Privacy-link" href="privacidad.html#cookies">Política de cookies</a></p>
      <div class="Privacy-actions">
        <button class="Privacy-button" type="button" data-privacy-action="reject">Rechazar todo</button>
        <button class="Privacy-button" type="button" data-privacy-action="accept">Aceptar todo</button>
        <button class="Privacy-button" type="button" data-privacy-action="configure" aria-controls="privacy-options" aria-expanded="false">Configurar</button>
      </div>
      <div class="Privacy-options" id="privacy-options" hidden>
        <label class="Privacy-option"><input type="checkbox" value="whimsical"> Whimsical: wireframes interactivos</label>
        <label class="Privacy-option"><input type="checkbox" value="heyzine"> Heyzine: revista interactiva</label>
        <label class="Privacy-option"><input type="checkbox" value="fonts"> Google Fonts: fuentes externas</label>
        <button class="Privacy-button" type="button" data-privacy-action="save">Guardar preferencias</button>
      </div>
    </section>`);
  const banner = document.querySelector('.Privacy-banner');
  const options = banner.querySelector('.Privacy-options');
  const configure = banner.querySelector('[data-privacy-action="configure"]');
  const inputs = [...options.querySelectorAll('input')];

  const showOptions = (open) => {
    options.hidden = !open;
    configure.setAttribute('aria-expanded', String(open));
    if (open) inputs.forEach((input) => { input.checked = choices?.[input.value] === true; });
  };

  const open = (trigger = null) => {
    opener = trigger;
    banner.hidden = false;
    showOptions(Boolean(trigger));
    if (trigger) banner.querySelector('h2').focus();
  };

  const save = (next) => {
    choices = next;
    try { localStorage.setItem(key, JSON.stringify({ version: 1, expires: Date.now() + ttl, choices })); } catch {}
    banner.hidden = true;
    if (opener) opener.focus();
    opener = null;
    sync();
  };

  banner.addEventListener('click', (event) => {
    const action = event.target.closest('[data-privacy-action]')?.dataset.privacyAction;
    if (action === 'configure') showOptions(options.hidden);
    if (action === 'reject') save(denied());
    if (action === 'accept') save(Object.fromEntries(services.map((id) => [id, true])));
    if (action === 'save') save(Object.fromEntries(inputs.map((input) => [input.value, input.checked])));
  });
  toggles.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => open(button));
  });
  document.querySelectorAll('[data-privacy-allow]').forEach((button) => {
    const service = button.dataset.privacyAllow;
    if (!services.includes(service)) return;
    button.hidden = false;
    button.addEventListener('click', () => save({ ...(choices ?? denied()), [service]: true }));
  });
  document.addEventListener('portfolio:embed', sync);
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    choices = read();
    sync();
    if (!choices) open();
    else if (!opener) banner.hidden = true;
    else showOptions(!options.hidden);
  });
  if (!choices) open();
  sync();
})();
