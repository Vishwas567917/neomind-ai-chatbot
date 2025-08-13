/* Main JS: navigation, scroll effects, skills animation, contact form validation */

// Helper: select
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Mobile nav toggle
const navToggleButton = $("#navToggle");
const navLinks = $("#navLinks");
if (navToggleButton && navLinks) {
  navToggleButton.addEventListener("click", () => {
    const isOpen = navLinks.getAttribute("data-open") === "true";
    navLinks.setAttribute("data-open", String(!isOpen));
    navToggleButton.setAttribute("aria-expanded", String(!isOpen));
  });
}

// Close nav on link click (mobile)
$$('#navLinks a').forEach(anchor => {
  anchor.addEventListener('click', () => {
    if (navLinks) { navLinks.setAttribute('data-open', 'false'); }
    if (navToggleButton) { navToggleButton.setAttribute('aria-expanded', 'false'); }
  });
});

// Active link highlighting for in-page sections
const sectionAnchors = $$('a[href^="#"]');
const idToLink = new Map();
sectionAnchors.forEach(anchor => {
  const id = anchor.getAttribute('href').slice(1);
  const section = document.getElementById(id);
  if (section) {
    idToLink.set(id, anchor);
  }
});

if (idToLink.size > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = idToLink.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        // Remove current from others in the same nav
        const parent = link.closest('#navLinks') || document;
        $$("a[aria-current='page']", parent).forEach(el => el.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

  idToLink.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.setAttribute('data-visible', 'true');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

$$('.reveal').forEach(el => revealObserver.observe(el));

// Skills bars animation when visible
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = $$('.skill__bar > span', entry.target);
      bars.forEach(bar => {
        const val = bar.getAttribute('data-value');
        if (val) bar.style.width = val;
      });
      skillsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

$$('.skills__list').forEach(list => skillsObserver.observe(list));

// Contact form validation
const contactForm = $('#contactForm');
if (contactForm) {
  const errorEl = $('#formError');
  const successEl = $('#formSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    // Basic validation
    if (!name) return showError('Please enter your name.');
    if (!isValidEmail(email)) return showError('Please enter a valid email.');
    if (message.length < 10) return showError('Message should be at least 10 characters.');

    // Simulate submission (can be replaced with fetch to backend)
    hideError();
    if (successEl) {
      successEl.textContent = 'Thanks! Your message has been sent successfully.';
      successEl.setAttribute('data-show', 'true');
    }
    contactForm.reset();
  });

  function isValidEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }
  function showError(msg) {
    if (errorEl) errorEl.textContent = msg;
  }
  function hideError() {
    if (errorEl) errorEl.textContent = '';
  }
}