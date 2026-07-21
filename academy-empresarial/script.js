/* ============================================================
   ORCOMA ACADEMY — JavaScript
   ============================================================ */

function carregarTrilhas() {
  API.get('/api/trilhas/').then(function (trilhas) {
    var slider = document.getElementById("trilhasSlider");
    if (!slider || !trilhas || trilhas.length === 0) return;
    slider.innerHTML = trilhas.map(function (t) {
      return '<div class="trail-card">' +
        '<div class="trail-card__icon"><i class="fas fa-route"></i></div>' +
        '<div><h3>' + t.nome + '</h3><span>' + (t.ambiente_nome || '') + '</span></div></div>';
    }).join("");
  }).catch(function () {});
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
      if (page === "inicio") url = "../academy-empresarial/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
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

function initStatsCounters() {
  const statNumbers = document.querySelectorAll(".stat-item__number");

  if (!statNumbers.length) return;

  function formatNumber(value) {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value.toString();
  }

  function animateCounter(element) {
    const target    = parseInt(element.getAttribute("data-target"), 10);
    const duration  = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      element.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) {
    observer.observe(el);
  });
}

function carregarStats() {
  API.get('/api/dashboard/').then(function (data) {
    var metricas = data.metricas || {};
    var statEls = document.querySelectorAll(".stat-item__number");
    if (statEls.length >= 1 && metricas.cursos_ativos !== undefined) {
      statEls.forEach(function (el, i) {
        var key = ['cursos_ativos', 'total_usuarios', 'total_certificados', 'satisfacao'][i];
        if (key && metricas[key] !== undefined) el.setAttribute("data-target", metricas[key]);
      });
    }
    initStatsCounters();
  }).catch(function () { initStatsCounters(); });
}

function carregarCursos() {
  var container = document.getElementById('cursosContainer');
  if (!container) return;

  API.get('/api/cursos/').then(function (cursos) {
    container.innerHTML = '';
    if (!cursos || cursos.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-secondary);padding:20px;">Nenhum curso dispon\u00edvel no momento.</p>';
      return;
    }
    var grid = document.createElement('div');
    grid.className = 'cursos-grid';
    cursos.forEach(function (curso) {
      var card = document.createElement('div');
      card.className = 'curso-card';
      var thumbSrc = (curso.titulo === 'ONBOARDING MEI') ? '../assets/images/onboarding-mei.jpg' : (curso.thumbnail_url || '');
      var statusLabel = '';
      var statusClass = '';
      if (curso.status_matricula === 'concluido') {
        statusLabel = 'Conclu\u00eddo';
        statusClass = 'status-concluido';
      } else if (curso.status_matricula === 'em_andamento') {
        statusLabel = 'Em andamento';
        statusClass = 'status-em-andamento';
      } else {
        statusLabel = 'N\u00e3o-Iniciado';
        statusClass = 'status-nao-iniciado';
      }
      card.innerHTML =
        '<div class="curso-card__image">' +
          '<img src="' + thumbSrc + '" alt="' + curso.titulo + '" loading="lazy">' +
          '<span class="curso-card__status ' + statusClass + '">' + statusLabel + '</span>' +
        '</div>' +
        '<div class="curso-card__name">' + curso.titulo + '</div>' +
        '<div class="curso-card__divider"></div>' +
        '<div class="curso-card__meta"><span><i class="fa-solid fa-book"></i> Curso</span><span><i class="fa-solid fa-award"></i> Certificado</span></div>';
      card.addEventListener('click', function () {
        window.location.href = '../video-area/index.html?curso=' + curso.slug;
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }).catch(function () {
    container.innerHTML = '<p style="color:var(--color-text-secondary);padding:20px;">Erro ao carregar cursos.</p>';
  });
}

document.addEventListener("DOMContentLoaded", function () {

  initSidebarNav();
  initSidebarMobile();
  carregarStats();
  carregarTrilhas();
  carregarCursos();

  const planoMap = {
    'admin':              'Administrador',
    'cliente_premium':    'Cliente Premium \u2b50',
    'cliente_orcoma':     'Cliente Orcoma',
    'colaborador_orcoma': 'Orcoma Team',
    'gestor_orcoma':      'Orcoma Business',
    'empresario':         'Empres\u00e1rio',
    'visitor':            'Visitante'
  };

  const tipoUsuario = auth.getRole();

  const planLabel = document.querySelector('.progress-sidebar__plan');
  if (planLabel) {
    planLabel.textContent = planoMap[tipoUsuario] ?? 'Cliente Orcoma';
    planLabel.classList.remove('pill-admin', 'pill-cliente', 'pill-visitor', 'pill-premium');
    if (tipoUsuario === 'admin') {
      planLabel.classList.add('pill-admin');
    } else if (tipoUsuario === 'visitor') {
      planLabel.classList.add('pill-visitor');
    } else if (tipoUsuario === 'cliente_premium') {
      planLabel.classList.add('pill-premium');
    } else {
      planLabel.classList.add('pill-cliente');
    }
  }

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

  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });

  const userName = auth.getName() || 'Usu\u00e1rio';
  const usernameEl = document.querySelector('.progress-sidebar__username');
  if (usernameEl) usernameEl.textContent = userName;
  const heroUserName = document.getElementById('heroUserName');
  if (heroUserName) heroUserName.textContent = userName;
  var avatarUrl = auth.getAvatar();
  var avatarEl = document.getElementById('userAvatar');
  if (avatarEl && avatarUrl) avatarEl.src = avatarUrl;

  carregarUserStats();
  carregarContinuarAssistindo();
});

function carregarContinuarAssistindo() {
  var container = document.getElementById('continuarAssistindo');
  if (!container) return;
  API.get('/api/matriculas/').then(function (matriculas) {
    var emAndamento = matriculas.filter(function (m) { return m.progresso > 0 && !m.concluido; });
    if (!emAndamento || emAndamento.length === 0) {
      container.className = '';
      container.innerHTML = '<div class="continuar-card__empty"><img src="../assets/images/curso-n\u00e3o-conclu\u00eddo.png" alt="Nenhum curso" style="width:100px;height:auto;object-fit:contain;"><span>Voc\u00ea n\u00e3o tem nenhum curso em andamento!</span></div>';
      return;
    }
    container.className = 'continuar-card';
    var m = emAndamento[0];
    var progresso = m.progresso || 0;
    var tituloCurso = m.curso_titulo || 'Curso';
    var tituloVideo = m.video_corrente_titulo || '';
    var tituloCompleto = tituloCurso + (tituloVideo ? ': ' + tituloVideo : '');
    container.innerHTML =
      '<div class="continuar-card__thumb">' +
        '<i class="fa-solid fa-play"></i>' +
        '<div class="continuar-card__play" onclick="window.location.href=\'../video-area/index.html?curso=' + m.curso + '\'"><i class="fa-solid fa-play"></i></div>' +
      '</div>' +
      '<div class="continuar-card__body">' +
        '<span class="continuar-card__tag">M\u00f3dulo</span>' +
        '<h3 class="continuar-card__title">' + tituloCompleto + '</h3>' +
        '<span class="continuar-card__progress-label">Progresso da Aula</span>' +
        '<div class="continuar-card__progress">' +
          '<div class="continuar-card__bar"><div class="continuar-card__bar-fill" style="width:' + progresso + '%"></div></div>' +
          '<span class="continuar-card__percent">' + progresso + '%</span>' +
        '</div>' +
        '<button class="continuar-card__btn" onclick="window.location.href=\'../video-area/index.html?curso=' + m.curso + '\'">Retomar curso <i class="fa-solid fa-arrow-right"></i></button>' +
      '</div>';
  }).catch(function () {
    container.className = '';
    container.innerHTML = '<div class="continuar-card__empty"><img src="../assets/images/curso-n\u00e3o-conclu\u00eddo.png" alt="Nenhum curso" style="width:100px;height:auto;object-fit:contain;"><span>Voc\u00ea n\u00e3o tem nenhum curso em andamento!</span></div>';
  });
}

function carregarUserStats() {
  API.get('/api/user-stats/').then(function (stats) {
    var tempoEl = document.getElementById('statTempoEstudo');
    if (tempoEl) tempoEl.textContent = (stats.horas_estudo || 0) + 'h';

    var certEl = document.getElementById('statCertificados');
    if (certEl) certEl.textContent = stats.total_certificados || 0;

    var metaProgress = document.getElementById('metaProgress');
    var metaCta = document.getElementById('metaCta');
    var heroMetaPercent = document.getElementById('heroMetaPercent');
    if (stats.meta_semanal) {
      if (metaProgress) metaProgress.style.display = '';
      if (metaCta) metaCta.style.display = 'none';
      var fill = document.getElementById('metaFill');
      var statMeta = document.getElementById('statMeta');
      if (fill) fill.style.width = stats.meta_semanal.percentual + '%';
      if (statMeta) statMeta.textContent = stats.meta_semanal.percentual + '%';
      if (heroMetaPercent) heroMetaPercent.textContent = stats.meta_semanal.percentual + '%';
    } else {
      if (metaProgress) metaProgress.style.display = 'none';
      if (metaCta) metaCta.style.display = '';
      if (heroMetaPercent) heroMetaPercent.textContent = '0%';
    }
  }).catch(function () {});
}

function criarMeta() {
  var titulo = prompt('Qual sua meta de estudo para esta semana?');
  if (!titulo) return;
  var horas = prompt('Quantas horas por semana voc\u00ea quer estudar?', '5');
  if (!horas || isNaN(horas)) return;
  var hoje = new Date();
  var inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - hoje.getDay());
  var fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  var fmt = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  API.post('/api/metas-semanais/', {
    titulo: titulo,
    meta_horas: parseInt(horas),
    horas_concluidas: 0,
    semana_inicio: fmt(inicio),
    semana_fim: fmt(fim),
    concluida: false,
  }).then(function () {
    carregarUserStats();
  }).catch(function () {
    alert('Erro ao criar meta. Tente novamente.');
  });
}

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
