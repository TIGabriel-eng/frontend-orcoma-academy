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
   1. PROTEÇÃO CONTRA DEVTOOLS E INJECT
   ============================================================ */

/**
 * Detecta abertura do DevTools monitorando a diferença entre
 * o tamanho interno e externo da janela.
 * Quando detectado, redireciona para página de aviso.
 */
(function protectDevTools() {
  "use strict";

  /* Limpa o console periodicamente */
  const consoleClearInterval = setInterval(function () {
    console.clear();
  }, 1000);

  /* Sobrescreve os métodos do console para bloquear outputs */
  const noop = function () {};
  const consoleMethods = ["log", "warn", "error", "info", "debug", "table", "dir"];
  consoleMethods.forEach(function (method) {
    console[method] = noop;
  });

  /* Detecta abertura do DevTools pela diferença de tamanho da janela */
  const THRESHOLD = 160; /* pixels de diferença que indicam painel aberto */

  /* Verifica a cada 800ms */
  setInterval(checkDevTools, 800);

  /* Bloqueia atalhos de teclado comuns do DevTools */
  document.addEventListener("keydown", function (event) {
    const blockedKeys = [
      { key: "F12" },                                    /* F12 */
      { key: "I", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+I */
      { key: "J", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+J */
      { key: "C", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+C */
      { key: "U", ctrlKey: true },                       /* Ctrl+U (View Source) */
    ];

    const isBlocked = blockedKeys.some(function (combo) {
      return (
        event.key === combo.key &&
        (combo.ctrlKey  === undefined || event.ctrlKey  === combo.ctrlKey)  &&
        (combo.shiftKey === undefined || event.shiftKey === combo.shiftKey)
      );
    });

    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  /* Bloqueia clique direito (menu de contexto) */
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

}()); /* Execução imediata para proteção antes do DOM */


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
function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      /* Remove o estado ativo de todos */
      navItems.forEach(function (i) {
        i.classList.remove("active");
      });

      /* Adiciona ao clicado */
      item.classList.add("active");
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

  const planoMap = {
  'cliente_orcoma':     'Cliente Orcoma',
  'colaborador_orcoma': 'Orcoma Team',
  'gestor_orcoma':      'Orcoma Business',
    };  /* Atualiza o plano do usuário no sidebar de progresso */

    const tipoUsuario = 'cliente_orcoma';

    const planLabel = document.querySelector('.progress-sidebar__plan');
        if (planLabel) {
         planLabel.textContent = planoMap[tipoUsuario] ?? 'Cliente Orcoma';
    }

    /* Avatar: usa foto do usuário ou fallback para avatar-icon.jpg */
    const avatarEl = document.getElementById('userAvatar');
    const fotoUsuario = null; // substitua por ex: usuario.foto_url vindo do backend

        if (avatarEl) {
        if (fotoUsuario) {
                avatarEl.src = fotoUsuario;
            } 
        else {
                avatarEl.src = 'assets/images/avatar-icon.jpg';
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
  const trilhasPrev   = document.querySelector(".trilhas-prev");
  const trilhasNext   = document.querySelector(".trilhas-next");

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