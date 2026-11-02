const initSidebar = () => {
  const sidebar = document.querySelector('.Sidebar');
  const content = document.querySelector('.Sidebar-content');
  const toggle = document.querySelector('.Sidebar-toggle');
  const desktop = window.matchMedia('(min-width: 768px)');
  const setOpen = (open) => {
    sidebar.classList.toggle('is-open', open);
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
    const focusedToggle = document.activeElement === toggle;
    setOpen(desktop.matches);
    if (desktop.matches && focusedToggle) document.querySelector('.Sidebar-current').focus();
    if (!desktop.matches && content.contains(document.activeElement)) toggle.focus();
  };

  sidebar.classList.toggle('is-ready', true);
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !desktop.matches) close();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!desktop.matches && !sidebar.contains(event.target)) close();
  });
  content.addEventListener('click', (event) => {
    if (event.target.closest('a[href]') && !desktop.matches) close();
  });
  desktop.addEventListener('change', syncViewport);
  syncViewport();
};

const initRevealOnScroll = () => {
  const sections = document.querySelectorAll('.Section');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const reveal = (section) => {
    section.classList.toggle('is-visible', true);
    section.classList.toggle('is-pending', false);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05 });
  sections.forEach((section) => {
    section.classList.toggle('is-pending', true);
    observer.observe(section);
  });
  const revealFocused = (event) => {
    const section = event.target.closest('.Section');
    if (section) reveal(section);
  };
  document.addEventListener('focusin', revealFocused);
  motion.addEventListener('change', (event) => {
    if (!event.matches) return;
    sections.forEach(reveal);
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
  document.querySelectorAll('.Media-image').forEach((image) => {
    const placeholder = image.closest('.Media').querySelector('.Media-placeholder');
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
      control.querySelector('.u-visuallyHidden').textContent = ', abre en otra pestaña';
      return;
    }
    control.addEventListener('click', (event) => {
      event.preventDefault();
      if (valid) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      status.textContent = `Enlace a ${key} pendiente. Añade su URL en el objeto links de script.js.`;
      status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    });
    if (control.tagName === 'A') {
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') control.click();
      });
    }
  });
};

const init = () => {
  initSidebar();
  initRevealOnScroll();
  initActiveCard();
  initImages();
  initLinks();
};

document.addEventListener('DOMContentLoaded', init);
