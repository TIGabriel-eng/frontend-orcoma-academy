/* ============================================================
   ORCOMA ACADEMY — JavaScript (Continuar Assistindo)
   ============================================================ */

function slugify(str) {
  return String(str).toLowerCase().normalize('NFD').replace(/[\u0000-\u001F]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getCurrentUserKey() {
  var email = auth.getEmail() || auth.getName() || 'guest';
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
  if (!data.users) {
    data.users = {};
  }

  var userKey = getCurrentUserKey();
  if (!data.users[userKey]) {
    data.users[userKey] = { cursos: {}, ultima_atualizacao: null };
  }

  var userData = data.users[userKey];
  if (!userData.cursos) {
    userData.cursos = {};
  }

  return {
    rootData: data,
    userData: userData,
    userKey: userKey
  };
}

function getUserCourseProgress(slug) {
  var state = getCurrentUserProgressState();
  return state.userData.cursos[slug] || state.userData.cursos['slug_' + slug] || null;
}

function getAllUserProgress() {
  var state = getCurrentUserProgressState();
  return state.userData.cursos || {};
}

function initSidebarMobile() {
  const sidebar        = document.getElementById("sidebar");
  const menuToggleBtn  = document.getElementById("menuToggle");
  const overlay        = document.getElementById("sidebarOverlay");

  if (!sidebar || !menuToggleBtn || !overlay) return;

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
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

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var page = item.getAttribute("data-page");
      if (page === "sair") {
        auth.logout();
        window.location.href = "../Login/index.html";
        return;
      }

      var url = null;
      if (page === "inicio") url = Router.getHomeUrl();
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") return; // already on this page
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "/Certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
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

function carregarCursos() {
  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  API.get('/api/cursos/').then(function (cursos) {
    if (!cursos || cursos.length === 0) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-regular fa-frown"></i><p>Nenhum curso em andamento.</p></div>';
      return;
    }

    // Filter only courses that are in progress (not started and not completed)
    var cursosEmAndamento = cursos.filter(function (c) {
      var slug = c.slug || c.id;
      var progresso = getUserCourseProgress(slug);
      if (!progresso) return false; // never started
      if (progresso.concluido) return false; // already completed
      return progresso.progresso > 0 && progresso.progresso < 100;
    });

    if (cursosEmAndamento.length === 0) {
      grid.innerHTML = '<div class="empty-state">' +
        '<img src="../assets/images/curso-não-concluído.png" alt="Nenhum curso em andamento" class="empty-state__img">' +
        '<p>Você não tem nenhum curso em andamento.</p>' +
        '<a href="../meuscursos/index.html" class="empty-state__pill">Catálogo de Cursos</a>' +
        '</div>';
      return;
    }

    grid.innerHTML = cursosEmAndamento.map(function (c) {
      var slug = c.slug || c.id;
      var thumbnail = c.thumbnail_url || '../assets/images/reforma-tributária.png';
      var progresso = getUserCourseProgress(slug);
      var pct = progresso ? (progresso.progresso || 0) : 0;
      return '<div class="course-card" data-curso="' + slug + '">' +
        '<img src="' + thumbnail + '" alt="' + c.titulo + '" class="curso-capa">' +
        '<div class="course-card__body">' +
        '<h3>' + c.titulo + '</h3>' +
        '<span class="course-card__badge badge--andamento">Em andamento</span>' +
        '<div class="course-card__progress">' +
        '<div class="progress__bar-track"><div class="progress__bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span>' + pct + '%</span>' +
        '</div></div></div>';
    }).join("");
    atualizarProgressoCursos();
  }).catch(function () {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-triangle"></i><p>Erro ao carregar cursos.</p></div>';
  });
}

function initCourseCards() {
  var grid = document.getElementById("catalogGrid");
  if (!grid) return;

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".course-card");
    if (!card) return;
    var slug = card.getAttribute("data-curso");
    if (!slug) return;
    card.classList.add("clicked");
    setTimeout(function () {
      window.location.href = "../curso/index.html?curso=" + slug;
    }, 200);
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

function formatarTempo(segundos) {
  if (!segundos || segundos <= 0) return '';
  var min = Math.floor(segundos / 60);
  var seg = Math.floor(segundos % 60);
  return min + ':' + (seg < 10 ? '0' : '') + seg;
}

function atualizarProgressoCursos() {
  try {
    document.querySelectorAll('.course-card[data-curso]').forEach(function (card) {
      var slug = card.getAttribute('data-curso');
      var progresso = getUserCourseProgress(slug);
      if (!progresso) return;
      if (progresso.concluido) {
        card.style.display = 'none';
        return;
      }
      var badge = card.querySelector('.course-card__badge');
      var barFill = card.querySelector('.progress__bar-fill');
      var percentSpan = card.querySelector('.course-card__progress span');
      if (badge) {
        badge.className = 'course-card__badge badge--andamento';
        var texto = 'Em andamento';
        var tempo = formatarTempo(progresso.ultimo_segundo_assistido);
        if (tempo) texto += ' · Assistido até ' + tempo;
        badge.textContent = texto;
      }
      if (barFill) barFill.style.width = Math.min(100, Math.max(0, progresso.progresso || 0)) + '%';
      if (percentSpan) percentSpan.textContent = Math.min(100, Math.max(0, progresso.progresso || 0)) + '%';
    });
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", function () {
  initEnvSelector();
  initSidebarNav();
  initSidebarMobile();
  initCourseCards();
  carregarCursos();
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