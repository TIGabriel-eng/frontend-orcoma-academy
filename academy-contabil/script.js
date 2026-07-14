/* ============================================================
   ORCOMA ACADEMY — JavaScript
   Organização:
   1. Sidebar mobile (abrir/fechar)
   2. Navegação da sidebar (item ativo)
   3. Animação dos contadores de estatísticas (stats)
   4. Carregar stats da API
   5. Inicialização (chamada na carga do DOM)
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
      if (page === "inicio") url = "../academy-contabil/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "/Certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
      else if (page === "favoritos") url = "../favoritos/index.html";
      else if (page === "suporte") url = "../suporte/index.html";
      else if (page === "config") url = "../configuracoes/index.html";

      if (!url) {
        navItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");
        return;
      }

      item.classList.add("clicked");

      setTimeout(function () {
        Router.navigate(url);
      }, 200);
    });
  });
}





/* ============================================================
   3. ANIMAÇÃO DOS CONTADORES DE ESTATÍSTICAS
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
   4. CARREGAR STATS DA API
   ============================================================ */

function carregarStats() {
  API.get('/api/dashboard/').then(function (data) {
    var metricas = data.metricas || {};
    var statEls = document.querySelectorAll(".stat-item__number");
    if (statEls.length >= 3 && metricas.cursos_ativos !== undefined) {
      var targets = [metricas.cursos_ativos || 0, metricas.total_usuarios || 0, 98];
      statEls.forEach(function (el, i) {
        if (targets[i] !== undefined) el.setAttribute("data-target", targets[i]);
      });
    }
    initStatsCounters();
  }).catch(function () { initStatsCounters(); });
}

/* ============================================================
   5. CARREGAR CURSOS DA API
   ============================================================ */

function carregarCursos() {
  var container = document.getElementById('cursosContainer');
  if (!container) return;

  API.get('/api/cursos/?status=publicado').then(function (cursos) {
    container.innerHTML = '';
    if (!cursos || cursos.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-secondary);padding:20px;">Nenhum curso dispon\u00edvel no momento.</p>';
      return;
    }
    cursos.forEach(function (curso) {
      var card = document.createElement('div');
      card.className = 'curso-card';

      var thumbSrc = curso.thumbnail_url || '../assets/images/orcoma.contabilidade.jpg';

      card.innerHTML =
        '<div class="curso-card__image">' +
          '<img src="' + thumbSrc + '" alt="' + curso.titulo + '" loading="lazy" onerror="this.src=\'../assets/images/orcoma.contabilidade.jpg\'">' +
        '</div>' +
        '<div class="curso-card__content">' +
          '<h4>' + curso.titulo + '</h4>' +
          (curso.descricao ? '<p style="color:var(--color-text-secondary);font-size:.82rem;margin:6px 0;">' + curso.descricao.substring(0, 100) + (curso.descricao.length > 100 ? '...' : '') + '</p>' : '') +
          '<div class="curso-recursos">' +
            '<span><img src="../assets/images/video.png" alt=""> ' + (curso.tipo === 'video' ? 'V\u00eddeo' : 'Curso') + '</span>' +
            (curso.video_url ? '<span><img src="../assets/images/video.png" alt=""> 1 V\u00eddeo</span>' : '') +
          '</div>' +
        '</div>' +
        '<a href="../video-area/index.html?id=' + curso.id + '" class="btn-acessar">' +
          'Acessar <i class="fa-solid fa-arrow-right"></i>' +
        '</a>';

      container.appendChild(card);
    });
  }).catch(function () {
    container.innerHTML = '<p style="color:var(--color-text-secondary);padding:20px;">Erro ao carregar cursos.</p>';
  });
}


/* ============================================================
   5. INICIALIZAÇÃO
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

  /* Carrega stats da API e inicia contadores */
  carregarStats();

  /* Carrega cursos da API */
  carregarCursos();

  const planoMap = {
    'admin':              'Administrador',
    'cliente_orcoma':     'Cliente Orcoma',
    'colaborador_orcoma': 'Orcoma Team',
    'gestor_orcoma':      'Orcoma Business',
    'visitor':            'Visitante'
  };

  const tipoUsuario = sessionStorage.getItem('orcoma_user_role') || 'visitor';

  const planLabel = document.querySelector('.progress-sidebar__plan');
  if (planLabel) {
    planLabel.textContent = planoMap[tipoUsuario] ?? 'Cliente Orcoma';
    planLabel.classList.remove('pill-admin', 'pill-cliente', 'pill-visitor');
    if (tipoUsuario === 'admin') {
      planLabel.classList.add('pill-admin');
    } else if (tipoUsuario === 'visitor') {
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
  if (tipoUsuario === 'admin') {
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

  const userName = sessionStorage.getItem('orcoma_user_name') || 'Usuário';
  const usernameEl = document.querySelector('.progress-sidebar__username');
  if (usernameEl) usernameEl.textContent = userName;
});

/* Anti Copy */
/* Widget Checklist - pulsar */
(function initChecklist() {
  var icon = document.getElementById('checklistIcon');
  var panel = document.getElementById('checklistPanel');
  var closeBtn = document.getElementById('checklistClose');
  if (!icon || !panel) return;

  var jumping = true;

  function pulse() {
    if (!jumping) return;
    icon.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)';
    icon.style.transform = 'translateY(-16px) scale(1.15)';
    icon.style.boxShadow = '0 8px 32px rgba(255, 157, 0, 0.7)';
    setTimeout(function () {
      icon.style.transform = 'translateY(0) scale(1)';
      icon.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)';
    }, 250);
    setTimeout(pulse, 600);
  }

  pulse();

  icon.onclick = function () {
    jumping = false;
    icon.style.transition = 'none';
    icon.style.transform = 'none';
    icon.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)';
    panel.classList.toggle('is-visible');
  };

  if (closeBtn) {
    closeBtn.onclick = function (e) {
      e.stopPropagation();
      panel.classList.remove('is-visible');
    };
  }

  document.addEventListener('click', function (e) {
    if (panel.classList.contains('is-visible') && !e.target.closest('.checklist-widget')) {
      panel.classList.remove('is-visible');
    }
  });

  /* Auto-check itens com delay */
  var ckIds = ['ck1', 'ck2', 'ck3', 'ck4'];
  var delays = [2000, 5000, 8000, 11000];
  for (var i = 0; i < ckIds.length; i++) {
    (function (id, delay) {
      setTimeout(function () {
        var el = document.getElementById(id);
        if (el) el.checked = true;
      }, delay);
    })(ckIds[i], delays[i]);
  }
})();
