function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggle");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar || !menuToggleBtn || !overlay) return;
  function openSidebar() { sidebar.classList.add("is-open"); overlay.classList.add("is-visible"); document.body.style.overflow = "hidden"; }
  function closeSidebar() { sidebar.classList.remove("is-open"); overlay.classList.remove("is-visible"); document.body.style.overflow = ""; }
  menuToggleBtn.addEventListener("click", function () { sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar(); });
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
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "/Certificados/index.html";
      else if (page === "trilhas") return;
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

function renderTrilhas() {
  const grid = document.querySelector('.trilhas-grid');
  const emptyState = document.querySelector('.trilhas-empty');
  if (!grid) return;

  API.get('/api/trilhas/')
    .then(function(data) {
      var trilhas = Array.isArray(data) ? data : [];
      if (!trilhas.length) {
        if (grid) grid.innerHTML = '';
        if (emptyState) {
          emptyState.style.display = '';
        } else {
          var msg = document.createElement('div');
          msg.className = 'trilhas-empty';
          msg.innerHTML = '<div class="checklist-widget__icon"><i class="fa-regular fa-lightbulb"></i></div><h3>Sem trilhas disponíveis</h3><p>Ainda não existem trilhas compatíveis com seu acesso no momento.</p>';
          document.querySelector('.main-content').appendChild(msg);
        }
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      grid.innerHTML = '';
      trilhas.forEach(function(trilha) {
        var cursos = Array.isArray(trilha.cursos) ? trilha.cursos : [];
        var horasTotaisMin = 0;
        cursos.forEach(function(c) {
          var minutos = (c.duracao_minutos || 0);
          if (typeof minutos === 'number') horasTotaisMin += minutos;
        });
        var totalHoras = horasTotaisMin / 60;
        var horasLabel = totalHoras >= 1 ? (totalHoras >= 10 ? Math.round(totalHoras) + ' horas' : totalHoras.toFixed(1).replace('.', ',') + ' horas') : Math.round(totalHoras * 60) + ' min';
        var ambienteNome = '';
        if (trilha.ambiente && typeof trilha.ambiente === 'object') {
          ambienteNome = trilha.ambiente.nome || '';
        } else if (trilha.ambiente_nome) {
          ambienteNome = trilha.ambiente_nome;
        }

        var card = document.createElement('div');
        card.className = 'trilha-card';
        card.innerHTML = '<div class="trilha-card__banner"><i class="fa-solid fa-calculator"></i></div>' +
          '<div class="trilha-card__body">' +
            '<h3>' + (trilha.nome || 'Trilha') + '</h3>' +
            '<p>' + (trilha.descricao || '') + '</p>' +
            '<div class="trilha-card__meta">' +
              '<span><i class="fa-solid fa-book-open"></i> ' + cursos.length + ' curso' + (cursos.length === 1 ? '' : 's') + '</span>' +
              '<span><i class="fa-regular fa-clock"></i> ' + horasLabel + '</span>' +
            '</div>' +
            '<div class="trilha-card__progress"><div class="progress__bar-track"><div class="progress__bar-fill" style="width:0%"></div></div><span>0%</span></div>' +
            '<button class="trilha-card__btn">Ver trilha <i class="fa-solid fa-arrow-right"></i></button>' +
          '</div>';
        grid.appendChild(card);
      });
    })
    .catch(function(err) {
      console.error(err);
      if (emptyState) {
        emptyState.style.display = '';
      } else {
        var msg = document.createElement('div');
        msg.className = 'trilhas-empty';
        msg.innerHTML = '<div class="checklist-widget__icon"><i class="fa-regular fa-lightbulb"></i></div><h3>Sem trilhas disponíveis</h3><p>Ainda não existem trilhas compatíveis com seu acesso no momento.</p>';
        document.querySelector('.main-content').appendChild(msg);
      }
    });
}

document.addEventListener("DOMContentLoaded", function () { initEnvSelector(); initSidebarNav(); initSidebarMobile(); renderTrilhas(); });