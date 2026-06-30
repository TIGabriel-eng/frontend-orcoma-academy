/* ============================================================
   ORCOMA ACADEMY — JavaScript
   Organização:
   1. Proteção contra DevTools / console injection
   2. Sidebar mobile (abrir/fechar)
   3. Navegação da sidebar (item ativo)
   4. Animação do círculo de progresso
   5. Animação das barras de progresso
   6. Animação dos contadores de estatísticas (stats)
   7. Inicialização (chamada na carga do DOM)
   ============================================================ */



/* ============================================================
   2. SIDEBAR MOBILE
   ============================================================ */

/**
 * Abre e fecha a sidebar em telas pequenas.
 * Também fecha ao clicar no overlay escuro.
 */
function initSidebarMobile() {
  const sidebar        = document.getElementById("sidebar");
  const menuToggleBtn  = document.getElementById("menuToggle");
  const overlay        = document.getElementById("sidebarOverlay");

  if (!sidebar || !menuToggleBtn || !overlay) return;

  /* Abre a sidebar */
  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden"; /* Trava scroll do body */
  }

  /* Fecha a sidebar */
  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.style.overflow = ""; /* Libera scroll */
  }

  menuToggleBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  /* Fecha ao clicar no overlay */
  overlay.addEventListener("click", closeSidebar);
}


/* ============================================================
   3. NAVEGAÇÃO DA SIDEBAR (ITEM ATIVO)
   ============================================================ */

/**
 * Marca o item clicado como ativo e remove dos demais.
 */
function navigateWithAnimation(url) {
  if (!url) return;
  window.location.href = url;
}

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var page = item.getAttribute("data-page");
      if (page === "sair") {
        sessionStorage.clear();
        window.location.href = "../Login/index.html";
        return;
      }

      var url = null;
      if (page === "inicio") url = "../orcoma-business/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "../certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
      else if (page === "favoritos") url = "../favoritos/index.html";
      else if (page === "suporte") url = "../suporte/index.html";
      else if (page === "config") url = "../configuracoes/index.html";

      if (!url) {
        navItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");
        return;
      }

      /* Add click animation */
      item.classList.add("clicked");

      /* Delay navigation for visual feedback */
      setTimeout(function () {
        navigateWithAnimation(url);
      }, 200);
    });
  });
}


/* ============================================================
   4. ANIMAÇÃO DO CÍRCULO DE PROGRESSO
   ============================================================ */

/**
 * Anima o círculo SVG de progresso de 0 até o valor alvo.
 * Usa stroke-dashoffset para controlar o preenchimento.
 *
 * @param {number} targetPercent - Percentual alvo (0 a 100)
 */
function animateProgressCircle(targetPercent) {
  const ring          = document.getElementById("progressRing");
  const percentLabel  = document.getElementById("progressPercent");

  if (!ring || !percentLabel) return;

  const circumference = 2 * Math.PI * 50; /* r=50, conforme o SVG */
  const targetOffset  = circumference - (targetPercent / 100) * circumference;

  /* Força reflow para a transição CSS funcionar do início */
  ring.style.strokeDasharray  = circumference;
  ring.style.strokeDashoffset = circumference;

  /* Aguarda 1 frame e inicia a animação */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      ring.style.strokeDashoffset = targetOffset;
    });
  });

  /* Anima o número no centro do círculo */
  let currentValue = 0;
  const step       = targetPercent / 60; /* ~60 passos */
  const counter    = setInterval(function () {
    currentValue += step;
    if (currentValue >= targetPercent) {
      currentValue = targetPercent;
      clearInterval(counter);
    }
    percentLabel.textContent = Math.round(currentValue) + "%";
  }, 20);
}


/* ============================================================
   5. ANIMAÇÃO DAS BARRAS DE PROGRESSO
   ============================================================ */

/**
 * Percorre todos os elementos com classe 'progress__bar-fill'
 * e aplica a largura definida em data-width após um pequeno delay.
 */
function animateProgressBars() {
  const bars = document.querySelectorAll(".progress__bar-fill");
  bars.forEach(function (bar) {
    const targetWidth = bar.getAttribute("data-width");
    if (!targetWidth) return;
    /* Pequeno delay para garantir que o CSS transition funcione */
    setTimeout(function () {
      bar.style.width = targetWidth + "%";
    }, 300);
  });
}


/* ============================================================
   6. ANIMAÇÃO DOS CONTADORES DE ESTATÍSTICAS
   ============================================================ */

/**
 * Anima os números nas cards de estatísticas de 0 até o valor alvo.
 * Usa IntersectionObserver para iniciar apenas quando visível.
 */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll(".stat-item__number");

  if (!statNumbers.length) return;

  /* Formata número com sufixos: 15000 → "15K" */
  function formatNumber(value) {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value.toString();
  }

  /* Anima um único elemento contador */
  function animateCounter(element) {
    const target    = parseInt(element.getAttribute("data-target"), 10);
    const duration  = 1500; /* ms */
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      /* Easing: desacelera no final */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      element.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* Usa IntersectionObserver: anima quando o elemento entra na tela */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); /* Anima uma única vez */
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) {
    observer.observe(el);
  });
}





/* ============================================================
   7. INICIALIZAÇÃO
   ============================================================ */

/**
 * Ponto de entrada principal.
 * Chamado quando o DOM está totalmente carregado.
 */
document.addEventListener("DOMContentLoaded", function () {

  /* Inicializa módulo de navegação da sidebar */
  initSidebarNav();

  /* Inicializa abertura/fechamento da sidebar no mobile */
  initSidebarMobile();

  /* Anima o círculo de progresso geral (72%) */
  animateProgressCircle(72);

  /* Anima todas as barras de progresso */
  animateProgressBars();

  /* Inicia os contadores de estatísticas */
  initStatsCounters();

  /* Role do usuário */
  const userRole = sessionStorage.getItem('orcoma_user_role') || 'visitor';

  /* Bloqueio dos pills por role */
  const envCards = document.querySelectorAll('.module-pill');
  envCards.forEach(function (card) {
    const allowedRoles = (card.getAttribute('data-roles') || '').split(',');
    if (!allowedRoles.includes(userRole)) {
      card.classList.add('locked');
    }
  });

  const planoMap = {
  'cliente_orcoma':     'Cliente Orcoma',
  'colaborador_orcoma': 'Orcoma Team',
  'gestor_orcoma':      'Orcoma Business',
  'admin':              'Administrador',
  'empresario':         'Empresário',
  'visitor':            'Visitante'
    };

    const tipoUsuario = userRole;

    const planLabel = document.querySelector('.progress-sidebar__plan');
        if (planLabel) {
         planLabel.textContent = planoMap[tipoUsuario] ?? 'Visitante';
         planLabel.classList.remove('pill-admin', 'pill-cliente', 'pill-visitor');
         if (userRole === 'admin') {
           planLabel.classList.add('pill-admin');
         } else if (userRole === 'visitor') {
           planLabel.classList.add('pill-visitor');
         } else {
           planLabel.classList.add('pill-cliente');
         }
    }

    /* Dropdown do perfil */
    const chevron = document.getElementById('profileChevron');
    const dropdown = document.getElementById('profileDropdown');
    if (chevron && dropdown) {
      chevron.addEventListener('click', function (e) {
        e.stopPropagation();
        chevron.classList.toggle('is-open');
        dropdown.classList.toggle('is-visible');
      });
      document.addEventListener('click', function () {
        chevron.classList.remove('is-open');
        dropdown.classList.remove('is-visible');
      });
      dropdown.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    /* Dropdown do admin pill (hover) */
    if (userRole === 'admin') {
      const adminPill = document.getElementById('adminPill');
      const adminDropdown = document.getElementById('adminDropdown');
      if (adminPill && adminDropdown) {
        var adminDropdownTimeout;
        function showAdminDropdown() {
          clearTimeout(adminDropdownTimeout);
          adminDropdown.classList.add('is-visible');
        }
        function hideAdminDropdown() {
          adminDropdownTimeout = setTimeout(function () {
            adminDropdown.classList.remove('is-visible');
          }, 150);
        }
        adminPill.addEventListener('mouseenter', showAdminDropdown);
        adminPill.addEventListener('mouseleave', hideAdminDropdown);
        adminDropdown.addEventListener('mouseenter', showAdminDropdown);
        adminDropdown.addEventListener('mouseleave', hideAdminDropdown);
      }
    }

    /* Atalho de teclado: Ctrl + K para focar no input de busca */
    document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    if (input) input.focus();
  }
});
});

// ===============================
// 9. SLIDER DE CURSOS
// ===============================
const slider = document.getElementById("coursesSlider");

if (slider) {
  document.querySelector(".slider-btn--next")?.addEventListener("click", () => {
    slider.scrollBy({ left: 320, behavior: "smooth" });
  });

  document.querySelector(".slider-btn--prev")?.addEventListener("click", () => {
    slider.scrollBy({ left: -320, behavior: "smooth" });
  });
}

// ===============================
// 10. SLIDER DAS TRILHAS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const trilhasSlider = document.getElementById("trilhasSlider");
  const trilhasPrev   = document.querySelector(".trilhas-prev-btn");
  const trilhasNext   = document.querySelector(".trilhas-next-btn");

  if (trilhasSlider && trilhasNext) {
    trilhasNext.addEventListener("click", () => {
      trilhasSlider.scrollBy({ left: 260, behavior: "smooth" });
    });
  }

  if (trilhasSlider && trilhasPrev) {
    trilhasPrev.addEventListener("click", () => {
      trilhasSlider.scrollBy({ left: -260, behavior: "smooth" });
    });
  }
});


// carrocel dos cursos //

const cards = document.querySelectorAll('.course-card');

let current = 0;

function showCard(index){

  cards.forEach(card => {
    card.classList.remove('active');
  });

  cards[index].classList.add('active');
}

document.getElementById('nextBtn').addEventListener('click', () => {

  current++;

  if(current >= cards.length){
    current = 0;
  }

  showCard(current);
});

document.getElementById('prevBtn').addEventListener('click', () => {

  current--;

  if(current < 0){
    current = cards.length - 1;
  }

  showCard(current);
});
