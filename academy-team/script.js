/* ============================================================
   ORCOMA ACADEMY — JavaScript
   Organização:
   1. Sidebar mobile (abrir/fechar)
   2. Navegação da sidebar (item ativo)
   3. Animação do círculo de progresso
   4. Animação das barras de progresso
   5. Animação dos contadores de estatísticas (stats)
   6. Carregar dashboard da API
   7. Carregar cursos da API
   8. Carregar eventos da API
   9. Carregar trilhas da API
   10. Inicialização (chamada na carga do DOM)
   ============================================================ */


/* ============================================================
   2. SIDEBAR MOBILE
   ============================================================ */

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


/* ============================================================
   3. NAVEGAÇÃO DA SIDEBAR (ITEM ATIVO)
   ============================================================ */

function applyFloatingProfile() {
  var actions = document.querySelector(".topbar__actions");
  var profileBar = document.querySelector(".progress-profile-bar");
  var topbar = document.querySelector(".topbar");
  if (!actions || !profileBar || !topbar) return;

  if (window.innerWidth <= 1024) {
    if (actions.parentElement !== profileBar) {
      profileBar.appendChild(actions);
    }
  } else {
    if (actions.parentElement !== topbar) {
      topbar.appendChild(actions);
    }
  }
}

function applyCourseCardLayout() {
  var cards = document.querySelectorAll(".course-card");
  var pills = document.querySelectorAll(".module-pill");
  var trails = document.querySelectorAll(".trail-card");
  var isCompact = window.innerWidth <= 1024;
  cards.forEach(function (card) {
    if (isCompact) {
      card.classList.add("compact");
    } else {
      card.classList.remove("compact");
    }
  });
  pills.forEach(function (pill) {
    if (isCompact) {
      pill.classList.add("compact");
    } else {
      pill.classList.remove("compact");
    }
  });
  trails.forEach(function (trail) {
    if (isCompact) {
      trail.classList.add("compact");
    } else {
      trail.classList.remove("compact");
    }
  });
}

function navigateWithAnimation(url) {
  if (!url) return;
  Router.navigate(url);
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
      if (page === "inicio") url = "../academy-team/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "eventos") url = "../eventos/index.html";
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
        navigateWithAnimation(url);
      }, 200);
    });
  });
}


/* ============================================================
   4. ANIMAÇÃO DO CÍRCULO DE PROGRESSO
   ============================================================ */

function animateProgressCircle(targetPercent) {
  const ring          = document.getElementById("progressRing");
  const percentLabel  = document.getElementById("progressPercent");

  if (!ring || !percentLabel) return;

  const circumference = 2 * Math.PI * 50;
  const targetOffset  = circumference - (targetPercent / 100) * circumference;

  ring.style.strokeDasharray  = circumference;
  ring.style.strokeDashoffset = circumference;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      ring.style.strokeDashoffset = targetOffset;
    });
  });

  let currentValue = 0;
  const step       = targetPercent / 60;
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

function animateProgressBars() {
  const bars = document.querySelectorAll(".progress__bar-fill");
  bars.forEach(function (bar) {
    const targetWidth = bar.getAttribute("data-width");
    if (!targetWidth) return;
    setTimeout(function () {
      bar.style.width = targetWidth + "%";
    }, 300);
  });
}


function carregarProgressoSidebar() {
  Promise.all([
    API.get('/api/cursos/'),
    API.get('/api/matriculas/minhas/')
  ]).then(function ([cursos, matriculas]) {
    var total = cursos.length || 1;
    var concluidas = matriculas.filter(function (m) { return m.concluido; }).length;
    var percent = Math.round((concluidas / total) * 100);

    animateProgressCircle(percent);

    var tiers = [
      { max: 10,  label: 'Iniciante',  color: '#dc2626', msg: 'Você deu o primeiro passo! Cada aula é uma conquista.' },
      { max: 47,  label: 'Razoável',   color: '#eab308', msg: 'Bom começo! Continue assistindo suas aulas.' },
      { max: 99,  label: 'Bom',        color: '#22c55e', msg: 'Incrível! Você já completou metade dos cursos.' },
      { max: 100, label: 'Excelente',  color: '#0073ff', msg: 'Parabéns! Você completou todos os cursos! Queremos ouvir suas sugestões e, se desejar, preparamos uma insignia especial para você.' }
    ];

    var tier = tiers.find(function (t) { return percent <= t.max; });

    var ring = document.getElementById('progressRing');
    if (ring) ring.style.stroke = tier.color;

    var labelEl = document.getElementById('progressLabel');
    var subEl = document.getElementById('progressSub');
    if (labelEl) labelEl.textContent = tier.label + '!';
    if (subEl) subEl.textContent = tier.msg;
  }).catch(function () {
    animateProgressCircle(0);
  });
}


/* ============================================================
   6. ANIMAÇÃO DOS CONTADORES DE ESTATÍSTICAS
   ============================================================ */

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


/* ============================================================
   7. CARREGAR DASHBOARD DA API
   ============================================================ */

function carregarDashboard() {
  API.get('/api/dashboard/').then(function (data) {
    var metricas = data.metricas || {};
    var statEls = document.querySelectorAll(".stat-item__number");
    if (statEls.length >= 4 && metricas.cursos_ativos !== undefined) {
      statEls[0].setAttribute("data-target", metricas.cursos_ativos || 0);
      statEls[1].setAttribute("data-target", metricas.total_usuarios || 0);
      statEls[2].setAttribute("data-target", metricas.certificados_emitidos || 0);
      statEls[3].setAttribute("data-target", metricas.satisfacao_alunos || 0);
    }
    initStatsCounters();
  }).catch(function () { initStatsCounters(); });
}


/* ============================================================
   8. CARREGAR CURSOS DA API
   ============================================================ */

function carregarCursos() {
  API.get('/api/cursos/').then(function (cursos) {
    var slider = document.getElementById("coursesSlider");
    if (!slider) return;
    if (!cursos || cursos.length === 0) {
      slider.innerHTML = '<div style="text-align:center;padding:32px 12px;"><img src="../assets/images/nenhum-curso.png" alt="Nenhum curso" style="max-width:140px;margin-bottom:12px;"><p style="color:var(--text-2);font-size:1rem;font-weight:600;">Nenhum curso disponível!</p></div>';
      return;
    }
    slider.innerHTML = cursos.map(function (c) {
      var slug = c.slug || c.id;
      return '<div class="course-card" data-slug="' + slug + '" style="cursor: pointer;">' +
        '<img src="' + (c.titulo === 'ONBOARDING MEI' ? '../assets/images/onboarding-mei.jpg' : (c.thumbnail_url || '')) + '" alt="' + c.titulo + '" class="curso-capa">' +
        '<div class="course-card__thumb">' +
        '<div class="course-card__body">' +
        '<h3>' + c.titulo + '</h3>' +
        '<span class="course-card__badge badge--em-andamento">' + (c.status === 'publicado' ? 'Publicado' : c.status) + '</span>' +
        '</div>' +
        '<div class="course-card__progress">' +
        '<div class="progress__bar-track"><div class="progress__bar-fill" data-width="0"></div></div><span>0%</span>' +
        '</div></div></div>';
    }).join("");
    animateProgressBars();
    applyCourseCardLayout();

    slider.querySelectorAll('.course-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var slug = card.getAttribute('data-slug');
        if (slug) {
          window.location.href = '../video-area/index.html?curso=' + slug;
        }
      });
    });
  }).catch(function () {});
}


/* ============================================================
   8b. CARREGAR CURSOS RECOMENDADOS
   ============================================================ */

function carregarRecomendados() {
  API.get('/api/cursos-recomendados/').then(function (cursos) {
    var section = document.getElementById('recomendadosSection');
    if (!section) return;
    if (!cursos || cursos.length === 0) {
      section.innerHTML = '<div style="text-align:center;padding:32px 12px;"><img src="../assets/images/nenhum-curso.png" alt="Nenhum curso recomendado" style="max-width:140px;margin-bottom:12px;"><p style="color:var(--text-2);font-size:1rem;font-weight:600;">Nenhum curso recomendado!</p></div>';
      section.style.display = '';
      return;
    }
    section.innerHTML = cursos.map(function (c) {
      var slug = c.slug || c.id;
      var thumb = (c.titulo === 'ONBOARDING MEI') ? '../assets/images/onboarding-mei.jpg' : (c.thumbnail_url || '');
      var desc = c.descricao ? c.descricao.substring(0, 120) : '';
      var videos = (c.videos || []).length;
      return '<div class="curso-recomendado__badge"><i class="fa-solid fa-sparkles"></i> Recomendado para você</div>' +
        '<div class="curso-recomendado__content">' +
        '<div class="curso-recomendado__thumb"><img src="' + thumb + '" alt="' + c.titulo + '"></div>' +
        '<div class="curso-recomendado__info">' +
        '<h3>' + c.titulo + '</h3>' +
        (desc ? '<p>' + desc + (c.descricao && c.descricao.length > 120 ? '...' : '') + '</p>' : '') +
        '<div class="curso-recomendado__meta">' +
        (videos > 0 ? '<span><i class="fa-solid fa-video"></i> ' + videos + ' aula' + (videos > 1 ? 's' : '') + '</span>' : '') +
        '<span><i class="fa-solid fa-certificate"></i> Certificado</span>' +
        '</div>' +
        '<a href="../video-area/index.html?curso=' + slug + '" class="btn-recomendado">Começar agora <i class="fa-solid fa-arrow-right"></i></a>' +
        '</div></div>';
    }).join('');
    section.style.display = '';
  }).catch(function () {});
}


/* ============================================================
   9. CARREGAR EVENTOS DA API
   ============================================================ */

function parseBRDateTime(str) {
  if (!str) return null;
  var parts = str.split(' ');
  if (parts.length < 2) return null;
  var dateParts = parts[0].split('/');
  var timeParts = parts[1].split(':');
  if (dateParts.length < 3 || timeParts.length < 2) return null;
  var d = new Date(
    parseInt(dateParts[2], 10),
    parseInt(dateParts[1], 10) - 1,
    parseInt(dateParts[0], 10),
    parseInt(timeParts[0], 10),
    parseInt(timeParts[1], 10)
  );
  return isNaN(d.getTime()) ? null : d;
}

function carregarEventos() {
  var emptyEl = document.getElementById('eventsEmpty');
  var listEl = document.getElementById('eventsList');
  if (!emptyEl || !listEl) return;

  API.get('/api/eventos/').then(function (eventos) {
    if (!eventos || eventos.length === 0) {
      emptyEl.style.display = '';
      listEl.innerHTML = '';
      return;
    }

    var agora = new Date();
    var futuro = eventos
      .map(function (e) {
        var d = parseBRDateTime(e.data);
        return d ? { evento: e, data: d } : null;
      })
      .filter(function (item) {
        return item !== null && item.data > agora;
      });

    if (futuro.length === 0) {
      emptyEl.style.display = '';
      listEl.innerHTML = '';
      return;
    }

    futuro.sort(function (a, b) {
      return a.data - b.data;
    });

    var limitados = futuro.slice(0, 5);
    var meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

    listEl.innerHTML = limitados.map(function (item) {
      var ev = item.evento;
      var d = item.data;
      var mes = meses[d.getMonth()];
      var dia = d.getDate();
      var hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return '<div class="events-list__item" data-evento-id="' + ev.id + '">' +
        '<div class="events-list__date">' +
        '<span class="events-list__month">' + mes + '</span>' +
        '<span class="events-list__day">' + dia + '</span>' +
        '</div>' +
        '<div class="events-list__info">' +
        '<div class="events-list__title">' + (ev.titulo || 'Evento') + '</div>' +
        '<div class="events-list__time">' + hora + '</div>' +
        '</div>' +
        '<i class="ti ti-chevron-right events-list__arrow"></i>' +
        '</div>';
    }).join('');

    emptyEl.style.display = 'none';
  }).catch(function () {
    emptyEl.style.display = '';
    listEl.innerHTML = '';
  });
}


/* ============================================================
   10. CARREGAR TRILHAS DA API
   ============================================================ */

function carregarTrilhas() {
  API.get('/api/trilhas/').then(function (trilhas) {
    var slider = document.getElementById("trilhasSlider");
    if (!slider) return;
    if (!trilhas || trilhas.length === 0) {
      slider.innerHTML = '<div style="text-align:center;padding:32px 12px;"><img src="../assets/images/trilha-não-encontrada.png" alt="Nenhuma trilha" style="max-width:140px;margin-bottom:12px;"><p style="color:var(--text-2);font-size:1rem;font-weight:600;">Nenhuma trilha disponível!</p></div>';
      return;
    }
    slider.innerHTML = trilhas.map(function (t) {
      var total = (t.cursos || []).length;
      var label = total + ' curso' + (total !== 1 ? 's' : '');
      return '<div class="trail-card">' +
        '<div class="trail-card__icon"><i class="fas fa-route"></i></div>' +
        '<div><h3>' + t.nome + '</h3><span>' + label + '</span></div></div>';
    }).join("");
    applyCourseCardLayout();
  }).catch(function () {});
}


/* ============================================================
   11. INICIALIZAÇÃO
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
  if (!data.users) { data.users = {}; }
  var userKey = getCurrentUserKey();
  if (!data.users[userKey]) { data.users[userKey] = { cursos: {}, ultima_atualizacao: null }; }
  var userData = data.users[userKey];
  if (!userData.cursos) { userData.cursos = {}; }
  return { rootData: data, userData: userData, userKey: userKey };
}

function getUserCourseProgress(slug) {
  var state = getCurrentUserProgressState();
  return state.userData.cursos[slug] || state.userData.cursos['slug_' + slug] || null;
}

function carregarContinuarAssistindo() {
  var container = document.getElementById('continuarAssistindo');
  if (!container) return;

  API.get('/api/cursos/').then(function (cursos) {
    if (!cursos || cursos.length === 0) {
      container.className = '';
      container.innerHTML = '<div style="text-align:center;padding:24px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
        '<img src="../assets/images/curso-não-concluído.png" alt="Nenhum curso em andamento" style="max-width:100px;margin-bottom:10px;">' +
        '<p style="color:var(--color-text-secondary);font-size:0.95rem;font-weight:600;margin:0;">Você não tem nenhum curso em andamento!</p></div>';
      return;
    }

    var cursosEmAndamento = cursos.filter(function (c) {
      var slug = c.slug || c.id;
      var progresso = getUserCourseProgress(slug);
      if (!progresso) return false;
      if (progresso.concluido) return false;
      return progresso.progresso > 0 && progresso.progresso < 100;
    });

    if (cursosEmAndamento.length === 0) {
      container.className = '';
      container.innerHTML = '<div style="text-align:center;padding:24px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
        '<img src="../assets/images/curso-não-concluído.png" alt="Nenhum curso em andamento" style="max-width:100px;margin-bottom:10px;">' +
        '<p style="color:var(--color-text-secondary);font-size:0.95rem;font-weight:600;margin:0;">Você não tem nenhum curso em andamento!</p></div>';
      return;
    }

    var curso = cursosEmAndamento[0];
    var slug = curso.slug || curso.id;
    var thumbnail = curso.thumbnail_url || '';
    var progresso = getUserCourseProgress(slug);
    var pct = progresso ? (progresso.progresso || 0) : 0;

    container.className = 'continuar-card';
    container.innerHTML =
      '<div class="continuar-card__thumb">' +
        '<img src="' + thumbnail + '" alt="' + curso.titulo + '" style="width:100%;height:100%;object-fit:cover;">' +
        '<div class="continuar-card__play" onclick="window.location.href=\'../video-area/index.html?curso=' + slug + '\'"><i class="fa-solid fa-play"></i></div>' +
      '</div>' +
      '<div class="continuar-card__body">' +
        '<span class="continuar-card__tag">Curso</span>' +
        '<h3 class="continuar-card__title">' + curso.titulo + '</h3>' +
        '<span class="continuar-card__progress-label">Progresso da Aula</span>' +
        '<div class="continuar-card__progress">' +
          '<div class="continuar-card__bar"><div class="continuar-card__bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="continuar-card__percent">' + pct + '%</span>' +
        '</div>' +
        '<button class="continuar-card__btn" onclick="window.location.href=\'../video-area/index.html?curso=' + slug + '\'">Retomar curso <i class="fa-solid fa-arrow-right"></i></button>' +
      '</div>';
  }).catch(function () {
    container.className = '';
    container.innerHTML = '<div style="text-align:center;padding:24px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<img src="../assets/images/curso-não-concluído.png" alt="Nenhum curso em andamento" style="max-width:100px;margin-bottom:10px;">' +
      '<p style="color:var(--color-text-secondary);font-size:0.95rem;font-weight:600;margin:0;">Você não tem nenhum curso em andamento!</p></div>';
  });
}

document.addEventListener("DOMContentLoaded", function () {

  initSidebarNav();

  initSidebarMobile();

  carregarDashboard();

  carregarContinuarAssistindo();

  carregarCursos();

  carregarRecomendados();

  carregarEventos();

  carregarTrilhas();

  carregarProgressoSidebar();
  applyFloatingProfile();
  applyCourseCardLayout();
  window.addEventListener("resize", function() {
    applyFloatingProfile();
    applyCourseCardLayout();
  });

  const userRole = auth.getRole();


  // Garantir que as permissões são carregadas antes de verificar ambientes
  Permissions.load().then(() => {
    const envCards = document.querySelectorAll('.ambiente-card');
    envCards.forEach(function (card) {
      const academyName = card.getAttribute('data-academy');
      if (academyName && !Permissions.canAccess(academyName)) {
        card.style.display = 'none';
      }
    });
  });

  const planoMap = {
  'cliente_premium':    'Cliente Premium ⭐',
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
         planLabel.classList.remove('pill-admin', 'pill-cliente', 'pill-visitor', 'pill-premium');
         if (userRole === 'admin') {
           planLabel.classList.add('pill-admin');
         } else if (userRole === 'visitor') {
           planLabel.classList.add('pill-visitor');
          } else if (userRole === 'cliente_premium') {
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

    var profileLogout = document.getElementById('profileLogout');
    if (profileLogout) {
      profileLogout.addEventListener('click', function (e) {
        e.preventDefault();
        auth.logout();
        window.location.href = '../Login/index.html';
      });
    }

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
        var allowedRoles = (item.getAttribute('data-roles') || '').split(',');
        if (allowedRoles.length && !allowedRoles.includes(userRole)) {
          item.style.display = 'none';
        } else {
          item.style.display = '';
        }
        if (currentPath.includes(item.getAttribute('href'))) {
          item.classList.add('active');
          if (currentEnvName) { currentEnvName.textContent = item.textContent.trim(); }
        }
      });

      Permissions.load().then(() => {
        const envItems = envDropdown.querySelectorAll('.env-dropdown__item');
        envItems.forEach(function (item) {
          const academyName = item.getAttribute('data-academy');
          if (academyName && !Permissions.canAccess(academyName)) {
            item.style.display = 'none';
          }
        });
      });
    }

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

    document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    if (input) input.focus();
  }
});

  const userName = auth.getName() || 'Usuário';
  const usernameEl = document.querySelector('.progress-sidebar__username');
  if (usernameEl) usernameEl.textContent = userName;
  var avatarUrl = auth.getAvatar();
  var avatarEl = document.getElementById('userAvatar');
  if (avatarEl && avatarUrl) avatarEl.src = avatarUrl;
});

/* Modal Premium */
(function checkPremium() {
  var plano = auth.getPlanoNome();
  var modal = document.getElementById('premiumModal');
  var btnAssinar = document.getElementById('btnAssinar');
  var btnDepois = document.getElementById('btnDepois');
  if (!modal) return;

  /* Se já for Cliente Premium, não mostra modal */
  if (plano.toLowerCase().includes('premium')) return;

  /* Se já dispensou, não mostra de novo */
  if (localStorage.getItem('premiumModalDismissed')) return;

  modal.classList.add('is-visible');

  btnDepois.addEventListener('click', function () {
    localStorage.setItem('premiumModalDismissed', '1');
    modal.classList.remove('is-visible');
  });

  btnAssinar.addEventListener('click', function () {
    modal.classList.remove('is-visible');
    var assinarModal = document.getElementById('assinarModal');
    if (assinarModal) assinarModal.classList.add('is-visible');
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('is-visible');
    }
  });

  var assinarModal = document.getElementById('assinarModal');
  var btnCancelarAssinar = document.getElementById('btnCancelarAssinar');
  if (assinarModal) {
    assinarModal.addEventListener('click', function (e) {
      if (e.target === assinarModal) {
        assinarModal.classList.remove('is-visible');
      }
    });
    if (btnCancelarAssinar) {
      btnCancelarAssinar.addEventListener('click', function () {
        assinarModal.classList.remove('is-visible');
      });
    }
  }

  var sidebarBtn = document.querySelector('.sidebar__premium .btn-premium');
  if (sidebarBtn && assinarModal) {
    sidebarBtn.addEventListener('click', function (e) {
      e.preventDefault();
      assinarModal.classList.add('is-visible');
    });
  }

})();

// ===============================
// SLIDER DE CURSOS
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
// SLIDER DAS TRILHAS
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


// CARROCEL DOS CURSOS //

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
