function initSidebarMobile() {
  var sidebar = document.getElementById("sidebar");
  var menuToggleBtn = document.getElementById("menuToggle");
  var overlay = document.getElementById("sidebarOverlay");
  if (!sidebar || !menuToggleBtn || !overlay) return;
  function openSidebar() { sidebar.classList.add("is-open"); overlay.classList.add("is-visible"); document.body.style.overflow = "hidden"; }
  function closeSidebar() { sidebar.classList.remove("is-open"); overlay.classList.remove("is-visible"); document.body.style.overflow = ""; }
  menuToggleBtn.addEventListener("click", function () { sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar(); });
  overlay.addEventListener("click", closeSidebar);
}

function initSidebarNav() {
  var navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var page = item.getAttribute("data-page");
      if (page === "sair") { auth.logout(); window.location.href = "../Login/index.html"; return; }
      var url = null;
      if (page === "inicio") url = Router.getHomeUrl();
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "eventos") return;
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
      setTimeout(function () { Router.navigate(url); }, 200);
    });
  });
}

function initEnvSelector() {
  var envToggle = document.getElementById('envSelectorToggle');
  var envDropdown = document.getElementById('envDropdown');
  var envChevron = document.getElementById('envChevron');
  var currentEnvName = document.getElementById('currentEnvName');
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
    envDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    var currentPath = window.location.pathname;
    var envItems = envDropdown.querySelectorAll('.env-dropdown__item');
    envItems.forEach(function (item) {
      item.classList.remove('active');
      if (currentPath.includes(item.getAttribute('href'))) {
        item.classList.add('active');
        if (currentEnvName) currentEnvName.textContent = item.textContent.trim();
      }
    });
  }
}

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

function formatarDataLonga(d) {
  var dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return dias[d.getDay()] + ', ' + d.getDate() + ' de ' + meses[d.getMonth()];
}

function abrirModalEvento(ev, d) {
  var overlay = document.getElementById('eventModalOverlay');
  var header = document.getElementById('eventModalHeader');
  if (!overlay) return;

  var agora = new Date();
  var diffMs = d - agora;
  var diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  var badge = '';
  if (d < agora) {
    badge = 'encerrado';
  } else if (diffDias === 0) {
    badge = 'hoje';
  } else if (diffDias === 1) {
    badge = 'amanhã';
  } else {
    badge = 'em ' + diffDias + ' dias';
  }

  if (ev.imagem_url) {
    header.innerHTML = '<button class="event-modal__close" id="eventModalClose" aria-label="Fechar"><i class="ti ti-x"></i></button>' +
      '<img class="event-modal__header-img" src="' + ev.imagem_url + '" alt="' + (ev.titulo || '') + '">';
    header.className = 'event-modal__header';
  } else {
    header.innerHTML = '<button class="event-modal__close" id="eventModalClose" aria-label="Fechar"><i class="ti ti-x"></i></button>' +
      '<i class="ti ti-calendar-event" style="font-size:48px;color:rgba(255,255,255,0.3);"></i>';
    header.className = 'event-modal__header event-modal__header--no-image';
  }

  var closeBtn = document.getElementById('eventModalClose');
  if (closeBtn) closeBtn.addEventListener('click', fecharModalEvento);

  document.getElementById('modalDate').textContent = formatarDataLonga(d) + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('modalTitle').textContent = ev.titulo || 'Evento';
  document.getElementById('modalBadge').textContent = badge;

  var desc = ev.descricao || '';
  var descEl = document.getElementById('modalDesc');
  if (desc.trim()) {
    descEl.innerHTML = desc.split('\n').filter(function (p) { return p.trim(); }).map(function (p) {
      return '<p>' + p + '</p>';
    }).join('');
  } else {
    descEl.innerHTML = '<p>Sem descrição disponível.</p>';
  }

  overlay.classList.add('is-visible');
}

function fecharModalEvento() {
  var overlay = document.getElementById('eventModalOverlay');
  if (overlay) overlay.classList.remove('is-visible');
}

function initModalEventos() {
  var overlay = document.getElementById('eventModalOverlay');
  var closeBtn = document.getElementById('eventModalClose');
  if (closeBtn) closeBtn.addEventListener('click', fecharModalEvento);
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fecharModalEvento();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalEvento();
  });
}

function carregarEventos() {
  var grid = document.getElementById('eventsGrid');
  var emptyEl = document.getElementById('eventsEmptyPage');
  var loadingEl = document.getElementById('eventsLoading');
  if (!grid) return;

  API.get('/api/eventos/').then(function (eventos) {
    if (loadingEl) loadingEl.style.display = 'none';

    if (!eventos || eventos.length === 0) {
      grid.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    var agora = new Date();
    var meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

    var comData = eventos
      .map(function (e) {
        var d = parseBRDateTime(e.data);
        return d ? { evento: e, data: d } : null;
      })
      .filter(function (item) { return item !== null; });

    comData.sort(function (a, b) { return b.data - a.data; });

    if (comData.length === 0) {
      grid.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    var html = comData.map(function (item, idx) {
      var ev = item.evento;
      var d = item.data;
      var isPassado = d < agora;
      var diffMs = d - agora;
      var diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      var badge = '';
      if (!isPassado) {
        if (diffDias === 0) badge = 'hoje';
        else if (diffDias === 1) badge = 'amanhã';
        else badge = 'em ' + diffDias + ' dias';
      } else {
        badge = 'encerrado';
      }

      var descHtml = ev.descricao
        ? '<p class="event-description">' + ev.descricao + '</p>'
        : '';

      return '<article class="event-card' + (isPassado ? ' event-card--past' : '') + '" data-evento-idx="' + idx + '">' +
        '<div class="event-date">' +
          '<span class="event-date__day">' + d.getDate() + '</span>' +
          '<span class="event-date__month">' + meses[d.getMonth()] + '</span>' +
          '<span class="event-date__time">' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '</span>' +
        '</div>' +
        '<div class="event-content">' +
          (ev.local ? '<p class="event-eyebrow"><i class="ti ti-map-pin"></i> ' + ev.local + '</p>' : '') +
          '<div class="event-title-row">' +
            '<h3 class="event-title">' + (ev.titulo || 'Evento') + '</h3>' +
            '<span class="event-badge">' + badge + '</span>' +
          '</div>' +
          descHtml +
        '</div>' +
        '<i class="fa-solid fa-chevron-right event-chevron"></i>' +
      '</article>';
    }).join('');

    grid.innerHTML = html;

    grid.querySelectorAll('.event-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var idx = parseInt(card.getAttribute('data-evento-idx'), 10);
        var item = comData[idx];
        if (item) abrirModalEvento(item.evento, item.data);
      });
    });
  }).catch(function () {
    if (loadingEl) loadingEl.style.display = 'none';
    grid.style.display = 'none';
    if (emptyEl) emptyEl.style.display = '';
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initEnvSelector();
  initSidebarNav();
  initSidebarMobile();
  initModalEventos();
  carregarEventos();
});
