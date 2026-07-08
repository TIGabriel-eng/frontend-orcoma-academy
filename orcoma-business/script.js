function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar")
  const menuToggleBtn = document.getElementById("menuToggle")
  const overlay = document.getElementById("sidebarOverlay")
  if (!sidebar || !menuToggleBtn || !overlay) return;
  function openSidebar() { sidebar.classList.add("is-open"); overlay.classList.add("is-visible"); document.body.style.overflow = "hidden"; }
  function closeSidebar() { sidebar.classList.remove("is-open"); overlay.classList.remove("is-visible"); document.body.style.overflow = ""; }
  menuToggleBtn.addEventListener("click", function () { sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar(); });
  overlay.addEventListener("click", closeSidebar);
}

function navigateWithAnimation(url) { if (!url) return; Router.navigate(url); }

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var page = item.getAttribute("data-page");
      if (page === "sair") { sessionStorage.clear(); window.location.href = "../Login/index.html"; return; }
      var url = null;
      if (page === "inicio") url = "../orcoma-business/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "/Certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
      else if (page === "favoritos") url = "../favoritos/index.html";
      else if (page === "suporte") url = "../suporte/index.html";
      else if (page === "config") url = "../configuracoes/index.html";
      if (!url) { navItems.forEach(function (i) { i.classList.remove("active"); }); item.classList.add("active"); return; }
      item.classList.add("clicked");
      setTimeout(function () { navigateWithAnimation(url); }, 200);
    });
  });
}

function animateProgressCircle(targetPercent) {
  const ring = document.getElementById("progressRing");
  const percentLabel = document.getElementById("progressPercent");
  if (!ring || !percentLabel) return;
  const circumference = 2 * Math.PI * 50;
  const targetOffset = circumference - (targetPercent / 100) * circumference;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { ring.style.strokeDashoffset = targetOffset; });
  });
  let currentValue = 0;
  const step = targetPercent / 60;
  const counter = setInterval(function () {
    currentValue += step;
    if (currentValue >= targetPercent) { currentValue = targetPercent; clearInterval(counter); }
    percentLabel.textContent = Math.round(currentValue) + "%";
  }, 20);
}

function animateProgressBars() {
  const bars = document.querySelectorAll(".progress__bar-fill");
  bars.forEach(function (bar) {
    const targetWidth = bar.getAttribute("data-width");
    if (!targetWidth) return;
    setTimeout(function () { bar.style.width = targetWidth + "%"; }, 300);
  });
}

function initStatsCounters() {
  const statNumbers = document.querySelectorAll(".stat-item__number");
  if (!statNumbers.length) return;
  function formatNumber(value) {
    if (value >= 1000) { return (value / 1000).toFixed(0) + "K"; }
    return value.toString();
  }
  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target"), 10);
    const duration = 1500;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      element.textContent = formatNumber(current);
      if (progress < 1) { requestAnimationFrame(update); }
    }
    requestAnimationFrame(update);
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(function (el) { observer.observe(el); });
}

function carregarDashboard() {
  API.get('/api/dashboard/').then(function (data) {
    var metricas = data.metricas || {};
    var statEls = document.querySelectorAll(".stat-item__number");
    if (statEls.length >= 4 && metricas.cursos_ativos !== undefined) {
      statEls[0].setAttribute("data-target", metricas.cursos_ativos || 0);
      statEls[1].setAttribute("data-target", metricas.total_usuarios || 0);
      statEls[2].setAttribute("data-target", metricas.certificados || metricas.total_usuarios || 0);
      statEls[3].setAttribute("data-target", 98);
    }
    initStatsCounters();
  }).catch(function () { initStatsCounters(); });
}

function carregarCursos() {
  API.get('/api/cursos/').then(function (cursos) {
    var slider = document.getElementById("coursesSlider");
    if (!slider || !cursos || cursos.length === 0) return;
    var inProgress = cursos;
    slider.innerHTML = inProgress.map(function (c) {
      return '<div class="course-card">' +
        '<img src="../assets/images/reforma-tributária.png" alt="' + c.titulo + '" class="curso-capa">' +
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
  }).catch(function () {});
}

function carregarEventos() {
  API.get('/api/eventos/').then(function (eventos) {
    var eventsList = document.querySelector(".events-list");
    if (!eventsList || !eventos || eventos.length === 0) return;
    eventsList.innerHTML = eventos.slice(0, 3).map(function (e) {
      var d = new Date(e.data);
      var day = d.getDate();
      var months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      var month = months[d.getMonth()];
      var time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return '<article class="event-card">' +
        '<div class="event-date"><span class="day">' + day + '</span><span class="month">' + month + '</span></div>' +
        '<div class="event-content"><h4>' + e.titulo + '</h4><span>' + time + '</span></div>' +
        '</article>';
    }).join("");
  }).catch(function () {});
}

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

document.addEventListener("DOMContentLoaded", function () {
  initSidebarNav();
  initSidebarMobile();
  carregarDashboard();
  carregarCursos();
  carregarEventos();
  carregarTrilhas();

  animateProgressCircle(72);
  animateProgressBars();

  const userRole = sessionStorage.getItem('orcoma_user_role') || 'visitor';
  const envCards = document.querySelectorAll('.module-pill');
  envCards.forEach(function (card) {
    const allowedRoles = (card.getAttribute('data-roles') || '').split(',');
    if (!allowedRoles.includes(userRole)) { card.classList.add('locked'); }
  });

  const planoMap = { 'cliente_orcoma': 'Cliente Orcoma', 'colaborador_orcoma': 'Orcoma Team', 'gestor_orcoma': 'Orcoma Business', 'admin': 'Administrador', 'empresario': 'Empresário', 'visitor': 'Visitante' };
  const tipoUsuario = userRole;
  const planLabel = document.querySelector('.progress-sidebar__plan');
  if (planLabel) {
    planLabel.textContent = planoMap[tipoUsuario] ?? 'Visitante';
    planLabel.classList.remove('pill-admin', 'pill-cliente', 'pill-visitor');
    if (userRole === 'admin') { planLabel.classList.add('pill-admin'); }
    else if (userRole === 'visitor') { planLabel.classList.add('pill-visitor'); }
    else { planLabel.classList.add('pill-cliente'); }
  }

  const chevron = document.getElementById('profileChevron');
  const dropdown = document.getElementById('profileDropdown');
  if (chevron && dropdown) {
    chevron.addEventListener('click', function (e) { e.stopPropagation(); chevron.classList.toggle('is-open'); dropdown.classList.toggle('is-visible'); });
    document.addEventListener('click', function () { chevron.classList.remove('is-open'); dropdown.classList.remove('is-visible'); });
    dropdown.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  const envToggle = document.getElementById('envSelectorToggle');
  const envDropdown = document.getElementById('envDropdown');
  const envChevron = document.getElementById('envChevron');
  const currentEnvName = document.getElementById('currentEnvName');
  if (envToggle && envDropdown) {
    envToggle.addEventListener('click', function (e) { e.stopPropagation(); envDropdown.classList.toggle('is-visible'); if (envChevron) envChevron.classList.toggle('is-open'); });
    document.addEventListener('click', function () { envDropdown.classList.remove('is-visible'); if (envChevron) envChevron.classList.remove('is-open'); });
    envDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    const currentPath = window.location.pathname;
    const envItems = envDropdown.querySelectorAll('.env-dropdown__item');
    envItems.forEach(function (item) { item.classList.remove('active'); if (currentPath.includes(item.getAttribute('href'))) { item.classList.add('active'); if (currentEnvName) { currentEnvName.textContent = item.textContent.trim(); } } });
  }

  if (userRole === 'admin') {
    const adminPill = document.getElementById('adminPill');
    const adminDropdown = document.getElementById('adminDropdown');
    if (adminPill && adminDropdown) {
      var adminDropdownTimeout;
      function showAdminDropdown() { clearTimeout(adminDropdownTimeout); adminDropdown.classList.add('is-visible'); }
      function hideAdminDropdown() { adminDropdownTimeout = setTimeout(function () { adminDropdown.classList.remove('is-visible'); }, 150); }
      adminPill.addEventListener('mouseenter', showAdminDropdown);
      adminPill.addEventListener('mouseleave', hideAdminDropdown);
      adminDropdown.addEventListener('mouseenter', showAdminDropdown);
      adminDropdown.addEventListener('mouseleave', hideAdminDropdown);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'k') { e.preventDefault(); const input = document.getElementById('searchInput'); if (input) input.focus(); }
  });

  const userName = sessionStorage.getItem('orcoma_user_name') || 'Usuário';
  const usernameEl = document.querySelector('.progress-sidebar__username');
  if (usernameEl) usernameEl.textContent = userName;
});

const slider = document.getElementById("coursesSlider");
if (slider) {
  document.querySelector(".slider-btn--next")?.addEventListener("click", () => { slider.scrollBy({ left: 320, behavior: "smooth" }); });
  document.querySelector(".slider-btn--prev")?.addEventListener("click", () => { slider.scrollBy({ left: -320, behavior: "smooth" }); });
}

(function checkPremium() {
  var plano = sessionStorage.getItem('orcoma_plano_nome') || '';
  var modal = document.getElementById('premiumModal');
  var btnAssinar = document.getElementById('btnAssinar');
  var btnDepois = document.getElementById('btnDepois');
  if (!modal) return;
  modal.classList.add('is-visible');
  btnDepois.addEventListener('click', function () { modal.classList.remove('is-visible'); });
  btnAssinar.addEventListener('click', function () { modal.classList.remove('is-visible'); var assinarModal = document.getElementById('assinarModal'); if (assinarModal) assinarModal.classList.add('is-visible'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) { modal.classList.remove('is-visible'); } });
  var assinarModal = document.getElementById('assinarModal');
  var btnCancelarAssinar = document.getElementById('btnCancelarAssinar');
  if (assinarModal) {
    assinarModal.addEventListener('click', function (e) { if (e.target === assinarModal) { assinarModal.classList.remove('is-visible'); } });
    if (btnCancelarAssinar) { btnCancelarAssinar.addEventListener('click', function () { assinarModal.classList.remove('is-visible'); }); }
  }
  var sidebarBtn = document.querySelector('.sidebar__premium .btn-premium');
  if (sidebarBtn && assinarModal) { sidebarBtn.addEventListener('click', function (e) { e.preventDefault(); assinarModal.classList.add('is-visible'); }); }
})();

document.addEventListener("DOMContentLoaded", function () {
  const trilhasSlider = document.getElementById("trilhasSlider");
  const trilhasPrev = document.querySelector(".trilhas-prev-btn");
  const trilhasNext = document.querySelector(".trilhas-next-btn");
  if (trilhasSlider && trilhasNext) { trilhasNext.addEventListener("click", () => { trilhasSlider.scrollBy({ left: 260, behavior: "smooth" }); }); }
  if (trilhasSlider && trilhasPrev) { trilhasPrev.addEventListener("click", () => { trilhasSlider.scrollBy({ left: -260, behavior: "smooth" }); }); }
});

const cards = document.querySelectorAll('.course-card');
let current = 0;
function showCard(index) { cards.forEach(function (card) { card.classList.remove('active'); }); cards[index].classList.add('active'); }
document.getElementById('nextBtn')?.addEventListener('click', function () { current++; if (current >= cards.length) { current = 0; } showCard(current); });
document.getElementById('prevBtn')?.addEventListener('click', function () { current--; if (current < 0) { current = cards.length - 1; } showCard(current); });

document.addEventListener('copy', function (e) { e.preventDefault(); });
document.addEventListener('cut', function (e) { e.preventDefault(); });
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('dragstart', function (e) { e.preventDefault(); });

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
    setTimeout(function () { icon.style.transform = 'translateY(0) scale(1)'; icon.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)'; }, 250);
    setTimeout(pulse, 600);
  }
  pulse();
  icon.onclick = function () { jumping = false; icon.style.transition = 'none'; icon.style.transform = 'none'; icon.style.boxShadow = '0 4px 20px rgba(255, 157, 0, 0.4)'; panel.classList.toggle('is-visible'); };
  if (closeBtn) { closeBtn.onclick = function (e) { e.stopPropagation(); panel.classList.remove('is-visible'); }; }
  document.addEventListener('click', function (e) { if (panel.classList.contains('is-visible') && !e.target.closest('.checklist-widget')) { panel.classList.remove('is-visible'); } });
  var ckIds = ['ck1', 'ck2', 'ck3', 'ck4'];
  var delays = [2000, 5000, 8000, 11000];
  for (var i = 0; i < ckIds.length; i++) {
    (function (id, delay) { setTimeout(function () { var el = document.getElementById(id); if (el) el.checked = true; }, delay); })(ckIds[i], delays[i]);
  }
})();
