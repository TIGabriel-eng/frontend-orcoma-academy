/* ============================================================
   ORCOMA ACADEMY — JavaScript (Certificados)
   ============================================================ */

function formatarData(dataStr) {
  if (!dataStr) return '';
  var d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function carregarCertificados() {
  var list = document.getElementById('certList');
  if (!list) return;

  if (typeof API === 'undefined' || typeof auth === 'undefined' || !auth.getAccessToken()) {
    list.innerHTML = '<div class="cert-empty">Faça login para ver seus certificados.</div>';
    return;
  }

  API.get('/api/certificados/').then(function(certificados) {
    if (!certificados || certificados.length === 0) {
      list.innerHTML = '<div class="cert-empty">Nenhum certificado encontrado. Conclua um curso para receber seu certificado!</div>';
      return;
    }

    list.innerHTML = certificados.map(function(cert) {
      var duracao = cert.curso_duracao ? ' — ' + cert.curso_duracao : '';
      var data = formatarData(cert.emitido_em);
      return '<div class="cert-item">' +
        '<div class="cert-item__icon"><i class="fa-solid fa-certificate"></i></div>' +
        '<div class="cert-item__info">' +
        '<h3>' + cert.curso_titulo + '</h3>' +
        '<span>Concluído em ' + data + duracao + '</span>' +
        '<span class="cert-code">Código: ' + cert.codigo + '</span>' +
        '</div>' +
        '<a href="' + cert.download_url + '" target="_blank" class="cert-item__btn" data-i18n="certificados.download"><i class="fa-solid fa-download"></i> Baixar PDF</a>' +
        '</div>';
    }).join('');
  }).catch(function() {
    list.innerHTML = '<div class="cert-empty">Erro ao carregar certificados. Tente novamente.</div>';
  });
}

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
      else if (page === "eventos") url = "../eventos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") return; // already on this page
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

document.addEventListener("DOMContentLoaded", function () { initEnvSelector(); initSidebarNav(); initSidebarMobile(); carregarCertificados(); });

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
