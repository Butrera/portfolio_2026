const initSidebar = () => {
  const sidebar = document.querySelector('.Sidebar');
  const page = document.querySelector('.Page');
  const content = document.querySelector('.Sidebar-content');
  const toggle = document.querySelector('.Sidebar-toggle');
  if (!sidebar || !page || !content || !toggle) return;
  const desktop = window.matchMedia('(min-width: 768px)');
  const setOpen = (open) => {
    sidebar.classList.toggle('is-open', open);
    page.classList.toggle('is-open', open);
    content.inert = !open;
    content.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar panel de proyectos' : 'Abrir panel de proyectos');
  };
  const close = () => {
    if (content.contains(document.activeElement)) toggle.focus();
    setOpen(false);
  };
  const syncViewport = () => {
    if (!desktop.matches && content.contains(document.activeElement)) toggle.focus();
    setOpen(desktop.matches);
  };
  sidebar.classList.toggle('is-ready', true);
  content.classList.toggle('is-ready', true);
  page.classList.toggle('is-ready', true);
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!desktop.matches && !sidebar.contains(event.target)) close();
  });
  content.addEventListener('click', (event) => {
    if (!desktop.matches && event.target.closest('a[href]')) close();
  });
  desktop.addEventListener('change', syncViewport);
  syncViewport();
};

const initRevealOnScroll = (root = null) => {
  const elements = [...(root ?? document).querySelectorAll('.Section, .u-reveal')]
    .filter((element) => root || !element.closest('.Lightbox'));
  if (!elements.length) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveal = (element) => {
    element.classList.remove('is-pending');
    element.classList.add('is-visible');
  };
  if (motion.matches || !('IntersectionObserver' in window)) {
    elements.forEach(reveal);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { root, threshold: 0.15, rootMargin: '0px 0px -24px 0px' });
  elements.forEach((element) => {
    element.classList.add('is-pending');
    observer.observe(element);
  });
  document.addEventListener('focusin', (event) => {
    if (root ? !root.contains(event.target) : event.target.closest('.Lightbox')) return;
    let element = event.target.closest('.Section, .u-reveal');
    while (element) {
      reveal(element);
      observer.unobserve(element);
      element = element.parentElement.closest('.Section, .u-reveal');
    }
  });
  motion.addEventListener('change', (event) => {
    if (!event.matches) return;
    elements.forEach(reveal);
    observer.disconnect();
  });
};

const initActiveCard = () => {
  const current = document.body.dataset.project;
  document.querySelectorAll('.Sidebar [data-project]').forEach((card) => {
    const active = card.dataset.project === current;
    card.classList.toggle('is-active', active);
    if (active) card.setAttribute('aria-current', 'page');
    else card.removeAttribute('aria-current');
  });
};

const initImages = () => {
  document.querySelectorAll('img[data-placeholder]').forEach((image) => {
    const placeholder = image.closest('.Media').querySelector('.Media-placeholder');
    if (!placeholder) return;
    const showImage = () => {
      image.hidden = false;
      placeholder.hidden = true;
    };
    const showPlaceholder = () => {
      image.hidden = true;
      placeholder.hidden = false;
    };
    image.addEventListener('load', showImage);
    image.addEventListener('error', showPlaceholder);
    if (image.complete) {
      if (image.naturalWidth > 0) showImage();
      else showPlaceholder();
    }
  });
};

// Sustituye los valores vacíos por tus URL reales.
const links = {
  web: '',
  prototipo: '',
  investigación: '',
  Instagram: '',
  Linkedin: '',
  Behance: '',
  Github: ''
};

const initLinks = () => {
  const status = document.querySelector('.Notice');
  document.querySelectorAll('[data-pending]').forEach((control) => {
    const key = control.dataset.pending;
    const url = links[key];
    const valid = url && /^https:\/\//i.test(url);
    if (valid && control.tagName === 'A') {
      control.href = url;
      control.removeAttribute('aria-disabled');
      control.removeAttribute('role');
      const hint = control.querySelector('.u-visuallyHidden');
      if (hint) hint.textContent = ', abre en otra pestaña';
      return;
    }
    control.addEventListener('click', (event) => {
      event.preventDefault();
      if (valid) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (!status) return;
      status.textContent = `El enlace a ${key} todavía no está disponible.`;
      status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    });
    if (control.tagName === 'A') {
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') control.click();
      });
    }
  });
};

const initVideos = () => {
  const videos = document.querySelectorAll('.Hero-video, .Action-video, .Testing-video');
  if (!videos.length) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  const updatePlayback = (video) => {
    video.controls = motion.matches;
    video.classList.toggle('is-controlled', motion.matches);
    if (motion.matches || document.hidden || !visible.has(video)) {
      video.pause();
      return;
    }
    const playback = video.play();
    if (playback) playback.catch(() => {
      video.controls = true;
      video.classList.toggle('is-controlled', true);
    });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        updatePlayback(entry.target);
      });
    }, { threshold: 0.1 });
    videos.forEach((video) => observer.observe(video));
  } else {
    videos.forEach((video) => {
      visible.add(video);
      updatePlayback(video);
    });
  }
  document.addEventListener('visibilitychange', () => videos.forEach(updatePlayback));
  motion.addEventListener('change', () => videos.forEach(updatePlayback));
};


const initMenu = () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  if (!toggle) return;
  const menu = toggle.closest('.Menu');
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!menu || !panel) return;
  const setOpen = (open) => {
    panel.hidden = !open;
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  const close = () => {
    if (panel.contains(document.activeElement)) toggle.focus();
    setOpen(false);
  };
  menu.classList.add('is-enhanced');
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.contains(event.target)) close();
  });
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a[href]')) close();
  });
};

const initShuffle = () => {
  const image = document.querySelector('.Intro-image');
  const button = document.querySelector('.Intro-shuffle');
  const status = document.querySelector('[data-photo-status]');
  if (!image || !button) return;

  const photos = [
    { src: 'assets/Sobre%20mi/Barbara_Utrera.jpg', alt: 'Retrato de Bárbara Utrera' },
    { src: 'assets/Sobre%20mi/Barbara_Muppet.jpg', alt: 'Bárbara Utrera representada como una marioneta' },
    { src: 'assets/Sobre%20mi/Barbara_anime.jpg', alt: 'Ilustración de Bárbara Utrera en estilo anime' }
  ];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let pending = null;

  photos.forEach(({ src }) => {
    const preload = new Image();
    preload.src = src;
  });

  const showPhoto = () => {
    if (pending === null) return;
    current = pending;
    pending = null;
    const { src, alt } = photos[current];
    image.src = src;
    image.alt = alt;
    if (status) status.textContent = alt;
    image.classList.remove('is-changing');
  };

  const finishTransition = (event) => {
    if (event.target === image && event.propertyName === 'opacity') showPhoto();
  };

  image.addEventListener('transitionend', finishTransition);
  image.addEventListener('transitioncancel', finishTransition);
  motion.addEventListener('change', (event) => {
    if (event.matches) showPhoto();
  });
  button.hidden = false;
  button.addEventListener('click', () => {
    if (pending !== null) return;
    pending = (current + 1 + Math.floor(Math.random() * (photos.length - 1))) % photos.length;
    if (motion.matches || Number.parseFloat(getComputedStyle(image).opacity) === 0) {
      showPhoto();
      return;
    }
    image.classList.add('is-changing');
  });
};

const initTitleIntro = () => {
  const title = document.querySelector('.Intro-title');
  if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const text = title.textContent;
  let index = 0;
  const words = text.split(/(\s+)/).map((word) => {
    if (/^\s+$/.test(word)) return document.createTextNode(word);
    const wrapper = document.createElement('span');
    wrapper.className = 'Intro-word';
    wrapper.setAttribute('aria-hidden', 'true');
    Array.from(word).forEach((letter) => {
      const span = document.createElement('span');
      span.className = 'Intro-letter';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--index', String(index++));
      span.textContent = letter;
      wrapper.append(span);
    });
    return wrapper;
  });
  title.setAttribute('aria-label', text);
  title.replaceChildren(...words);
  title.classList.add('is-animated');
};


const initLightbox = () => {
  const books = document.querySelectorAll('.Book[data-project]');
  if (!books.length) return;
  const background = [...document.querySelectorAll('[data-lightbox-background]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const focusable = 'a[href], button:not(:disabled), iframe, [tabindex]:not([tabindex="-1"])';
  let active = null;

  const getFocusTargets = () => [...active.window.querySelectorAll(focusable)]
    .filter((element) => !element.hidden && !element.hasAttribute('data-focus-edge') && element.getClientRects().length);

  const finishClose = () => {
    if (!active) return;
    const { box, book, previous } = active;
    active = null;
    box.hidden = true;
    document.body.classList.remove('is-locked');
    background.forEach((element, index) => { element.inert = previous[index]; });
    book.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    if (!active || active.closing) return;
    const { box } = active;
    active.closing = true;
    const animate = !motion.matches && box.classList.contains('is-open')
      && Number.parseFloat(getComputedStyle(box).opacity) > 0;
    box.classList.remove('is-open');
    if (!animate) {
      finishClose();
      return;
    }
    const finishTransition = (event) => {
      if (event.target !== box || event.propertyName !== 'opacity') return;
      box.removeEventListener('transitionend', finishTransition);
      box.removeEventListener('transitioncancel', finishTransition);
      if (active?.box === box && active.closing) finishClose();
    };
    box.addEventListener('transitionend', finishTransition);
    box.addEventListener('transitioncancel', finishTransition);
  };

  const openLightbox = (book, box, windowPanel, close) => {
    if (active) return;
    active = { box, book, window: windowPanel, previous: background.map((element) => element.inert), closing: false };
    const frame = box.querySelector('.Project-frame[data-src]');
    const url = frame?.dataset.src.trim();
    if (url && /^https:\/\//i.test(url) && frame.hidden) {
      frame.src = url;
      frame.hidden = false;
      box.querySelector('.Project-embedLabel').hidden = true;
    }
    box.hidden = false;
    windowPanel.scrollTop = 0;
    document.body.classList.add('is-locked');
    close.focus({ preventScroll: true });
    background.forEach((element) => { element.inert = true; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (active?.box === box && !active.closing) box.classList.add('is-open');
    }));
  };

  const trapFocus = (event) => {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key !== 'Tab') return;
    const targets = getFocusTargets();
    const first = targets[0];
    const last = targets.at(-1);
    if (!first) {
      event.preventDefault();
      active.window.focus();
      return;
    }
    const focused = document.activeElement;
    if (!targets.includes(focused) || (event.shiftKey ? focused === first : focused === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  };

  books.forEach((book) => {
    const box = document.getElementById(book.dataset.project);
    const windowPanel = box?.querySelector('.Lightbox-window');
    const close = box?.querySelector('.Lightbox-close');
    if (!box || !windowPanel || !close) return;
    initRevealOnScroll(windowPanel);
    close.addEventListener('click', closeLightbox);
    box.addEventListener('click', (event) => {
      if (event.target === box) closeLightbox();
    });
    windowPanel.querySelectorAll('[data-focus-edge]').forEach((edge) => {
      edge.addEventListener('focus', () => {
        if (active?.box !== box) return;
        const targets = getFocusTargets();
        const target = edge.dataset.focusEdge === 'start' ? targets.at(-1) : targets[0];
        (target ?? close).focus();
      });
    });
    book.disabled = false;
    book.addEventListener('click', () => openLightbox(book, box, windowPanel, close));
  });

  document.addEventListener('keydown', trapFocus);
  document.querySelectorAll('[data-publication][href="#"]').forEach((link) => {
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', (event) => event.preventDefault());
  });
};


const init = () => {
  initMenu();
  initShuffle();
  initTitleIntro();
  initSidebar();
  initRevealOnScroll();
  initLightbox();
  initActiveCard();
  initImages();
  initVideos();
  initLinks();
};

document.addEventListener('DOMContentLoaded', init);


