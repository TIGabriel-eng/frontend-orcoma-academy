/* ============================================================
   ORCOMA ACADEMY — JavaScript (Meus Cursos / Catálogo)
   1. Sidebar mobile (abrir/fechar)
   2. Navegação da sidebar (item ativo)
   3. Tabs (Catálogo / Salvos)
   4. Carregar cursos da API
   5. Inicialização
   ============================================================ */


/* ============================================================
   1. SIDEBAR MOBILE
   ============================================================ */

function initSidebarMobile() {
  const sidebar        = document.getElementById("sidebar")
  const menuToggleBtn  = document.getElementById("menuToggle")
  const overlay        = document.getElementById("sidebarOverlay")

  if (!sidebar || !menuToggleBtn || !overlay) return;

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open")
    overlay.classList.remove("is-visible")
    document.body.style.overflow = "";
  }

  menuToggleBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener("click", closeSidebar);
}


/* ============================================================
   2. NAVEGAÇÃO DA SIDEBAR (ITEM ATIVO)
   ============================================================ */

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
      if (page === "inicio") url = Router.getHomeUrl();
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") return; // already on this page
      else if (page === "eventos") url = "../eventos/index.html";
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
   3. TABS (CATÁLOGO / SALVOS)
   ============================================================ */

function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  if (!tabs.length) return;

  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab");

      tabs.forEach(function (t) { t.classList.remove("active"); });
      btn.classList.add("active");

      document.querySelectorAll(".tab-content").forEach(function (c) {
        c.classList.remove("active");
      });

      var targetContent = document.getElementById("tab-" + target);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}


/* ============================================================
   4. CARREGAR CURSOS DA API
   ============================================================ */

function slugify(str) {
  return String(str).toLowerCase().normalize('NFD').replace(/[\u0000-\u001F]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getCurrentUserKey() {
  var email = sessionStorage.getItem('orcoma_user_email') || sessionStorage.getItem('orcoma_user_name') || 'guest';
  return 'user_' + slugify(email);
}

function getProgressStorage() {
  try {
    return JSON.parse(localStorage.getItem('orcoma_progresso') || '{}');
  } catch (e) {
    return {};
  }
}

function getCurrentUserProgressState() {
  var data = getProgressStorage();
  if (!data.users) data.users = {};

  var userKey = getCurrentUserKey();
  if (!data.users[userKey]) {
    data.users[userKey] = { cursos: {}, ultima_atualizacao: null };
    if (data.cursos && Object.keys(data.cursos).length > 0) {
      data.users[userKey].cursos = data.cursos;
      data.users[userKey].ultima_atualizacao = data.ultima_atualizacao || null;
    }
  }

  var userData = data.users[userKey];
  if (!userData.cursos) userData.cursos = {};
  return userData;
}

function getUserCourseProgress(slug) {
  var state = getCurrentUserProgressState();
  return state.cursos[slug] || state.cursos['slug_' + slug] || null;
}

function carregarCursos() {
  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  API.get('/api/cursos/').then(function (cursos) {
    if (!cursos || cursos.length === 0) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-frown"></i><p>Nenhum curso disponível no momento.</p></div>';
      return;
    }

    grid.innerHTML = cursos.map(function (c) {
      var slug = c.slug || c.id;
      var thumbnail = (c.titulo === 'ONBOARDING MEI') ? '../assets/images/onboarding-mei.jpg' : (c.thumbnail_url || '');
      var progresso = getUserCourseProgress(slug);
      var pct = progresso ? (progresso.progresso || 0) : 0;
      var badgeClass = 'badge--nao-iniciado';
      var badgeText = 'Não Iniciado';
      if (progresso && progresso.concluido) {
        badgeClass = 'badge--concluido';
        badgeText = '<i class="fa-solid fa-check"></i> Concluído';
      } else if (pct > 0) {
        badgeClass = 'badge--em-andamento';
        badgeText = 'Em andamento';
      }

      return '<div class="course-card" data-curso="' + slug + '">' +
        '<img src="' + thumbnail + '" alt="' + c.titulo + '" class="curso-capa">' +
        '<div class="course-card__body">' +
        '<h3>' + c.titulo + '</h3>' +
        '<span class="course-card__badge ' + badgeClass + '">' + badgeText + '</span>' +
        '<div class="course-card__progress">' +
        '<div class="progress__bar-track"><div class="progress__bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span>' + pct + '%</span>' +
        '</div></div></div>';
    }).join("");

    initCourseCardClicks();
  }).catch(function () {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-triangle"></i><p>Erro ao carregar cursos. Tente novamente mais tarde.</p></div>';
  });
}

function initCourseCardClicks() {
  document.querySelectorAll('.course-card[data-curso]').forEach(function (card) {
    card.addEventListener('click', function () {
      var slug = card.getAttribute('data-curso');
      if (slug) {
        window.location.href = '../curso/index.html?curso=' + slug;
      }
    });
    card.style.cursor = 'pointer';
  });
}

/* Dropdown de seleção de ambiente (Academy Business / Academy Team) */
function initEnvSelector() {
  const envToggle = document.getElementById('envSelectorToggle');
  const envDropdown = document.getElementById('envDropdown');
  const envChevron = document.getElementById('envChevron');
  const currentEnvName = document.getElementById('currentEnvName');
  if (envToggle && envDropdown) {
    envToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      envDropdown.classList.toggle('is-visible');
      if (envChevron) envChevron.classList.toggle('is-open');
    });
    document.addEventListener('click', function () {
      envDropdown.classList.remove('is-visible');
      if (envChevron) envChevron.classList.remove('is-open');
    });
    envDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    const currentPath = window.location.pathname;
    const envItems = envDropdown.querySelectorAll('.env-dropdown__item');
    envItems.forEach(function (item) {
      item.classList.remove('active');
      if (currentPath.includes(item.getAttribute('href'))) {
        item.classList.add('active');
        if (currentEnvName) {
          currentEnvName.textContent = item.textContent.trim();
        }
      }
    });
  }
}


/* ============================================================
   5. INICIALIZAÇÃO
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  initSidebarNav();
  initSidebarMobile();
  initEnvSelector();
  initTabs();
  carregarCursos();

  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });
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