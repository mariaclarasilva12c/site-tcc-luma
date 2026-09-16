/* ============================================================
   LUMA | SafePin — main.js
   Interações: header on scroll, menu mobile, dropdowns,
   modal com validação de formulário, reveal on scroll, scroll-to-top
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Modo escuro ---------- */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const rootEl = document.documentElement;

  function isDark() {
    return rootEl.getAttribute('data-theme') === 'dark';
  }

  function setTheme(dark) {
    if (dark) {
      rootEl.setAttribute('data-theme', 'dark');
    } else {
      rootEl.removeAttribute('data-theme');
    }
    themeToggleBtn?.setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem('luma-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  // sincroniza o aria-pressed com o que o script inline já aplicou
  themeToggleBtn?.setAttribute('aria-pressed', String(isDark()));

  themeToggleBtn?.addEventListener('click', () => setTheme(!isDark()));

  /* ---------- Header: sombra ao rolar ---------- */
  const header = document.getElementById('siteHeader');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  function onScroll() {
    const scrolled = window.scrollY > 12;
    if (header) header.classList.toggle('scrolled', scrolled);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Menu mobile (hamburger) ---------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburgerBtn.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fecha o menu ao clicar em um link
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Dropdowns (sino / perfil) ---------- */
  function setupDropdown(btnId, dropdownId) {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    if (!btn || !dropdown) return;
    const wrapper = btn.closest('.icon-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !wrapper.classList.contains('open');
      // fecha todos os outros dropdowns abertos
      document.querySelectorAll('.icon-menu.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.icon-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        wrapper.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }
  setupDropdown('bellBtn', 'bellDropdown');
  setupDropdown('userBtn', 'userDropdown');

  document.addEventListener('click', () => {
    document.querySelectorAll('.icon-menu.open').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.icon-btn')?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Modal (Começar / Adquira / Falar com consultora) ---------- */
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalForm = document.getElementById('modalForm');
  const modalSuccess = document.getElementById('modalSuccess');
  const modalSuccessText = document.getElementById('modalSuccessText');
  const modalClose = document.getElementById('modalClose');
  const phoneField = document.getElementById('phoneField');

  const MODAL_CONTENT = {
    interest: {
      title: 'Conheça o SafePin',
      subtitle: 'Deixe seu contato e enviamos todos os detalhes do dispositivo e da lista de espera.',
      success: 'Recebido! Em breve enviamos os detalhes do SafePin para você.',
      showPhone: false,
    },
    buy: {
      title: 'Adquira seu SafePin',
      subtitle: 'Deixe seus dados que nossa equipe entra em contato com o frete e formas de pagamento.',
      success: 'Pedido recebido! Em breve entraremos em contato para confirmar sua compra.',
      showPhone: true,
    },
    talk: {
      title: 'Falar com uma consultora',
      subtitle: 'Conte um pouco sobre você e uma consultora Luma vai te responder em breve.',
      success: 'Mensagem enviada! Uma consultora Luma vai te responder em breve.',
      showPhone: true,
    },
  };

  let lastFocusedEl = null;

  function openModal(type) {
    const content = MODAL_CONTENT[type] || MODAL_CONTENT.interest;
    modalTitle.textContent = content.title;
    modalSubtitle.textContent = content.subtitle;
    modalSuccessText.textContent = content.success;
    phoneField.style.display = content.showPhone ? 'block' : 'none';

    modalForm.reset();
    modalForm.style.display = 'block';
    modalSuccess.classList.remove('show');
    modalForm.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    modalForm.querySelectorAll('input').forEach((el) => el.classList.remove('invalid'));

    lastFocusedEl = document.activeElement;
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalForm.querySelector('input')?.focus(), 200);
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-modal')));
  });

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('open')) closeModal();
  });

  /* ---------- Validação do formulário do modal ---------- */
  function showError(input, message) {
    input.classList.toggle('invalid', Boolean(message));
    const errorEl = input.closest('label').querySelector('.field-error');
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(input) {
    if (!input.hasAttribute('required') && input.value.trim() === '') {
      showError(input, '');
      return true;
    }
    if (input.validity.valueMissing) {
      showError(input, 'Esse campo é obrigatório.');
      return false;
    }
    if (input.type === 'email' && input.validity.typeMismatch) {
      showError(input, 'Digite um e-mail válido.');
      return false;
    }
    if (input.hasAttribute('minlength') && input.value.trim().length < Number(input.getAttribute('minlength'))) {
      showError(input, 'Nome muito curto.');
      return false;
    }
    showError(input, '');
    return true;
  }

  modalForm?.querySelectorAll('input').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
  });

  modalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = Array.from(modalForm.querySelectorAll('input')).filter(
      (i) => i.offsetParent !== null // ignora campos escondidos (telefone quando não exibido)
    );
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      inputs.find((i) => i.classList.contains('invalid'))?.focus();
      return;
    }

    // Aqui entraria a chamada para o backend/API real.
    modalForm.style.display = 'none';
    modalSuccess.classList.add('show');
    setTimeout(closeModal, 2600);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Rede de segurança: se por qualquer motivo o observer não disparar
  // (engine antiga, aba em segundo plano, etc.), garante que o conteúdo
  // nunca fique invisível pra sempre.
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }, 2500);
})();
