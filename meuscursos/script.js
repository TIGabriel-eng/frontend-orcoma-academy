/* ============================================================
   ORCOMA ACADEMY — JavaScript (Meus Cursos)
   1. Sidebar mobile (abrir/fechar)
   2. Navegação da sidebar (item ativo)
   3. Tabs (Cursos em Andamento / Salvos)
   4. Inicialização
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
      if (page === "inicio") url = "../orcoma-business/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") return; // already on this page
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "../certificados/index.html";
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
        window.location.href = url;
      }, 200);
    });
  });
}


/* ============================================================
   3. TABS (CURSOS EM ANDAMENTO / SALVOS)
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

      if (target === "andamento") {
        setTimeout(animateProgressBars, 50);
      }
    });
  });
}


/* ============================================================
   4. INICIALIZAÇÃO
   ============================================================ */

function animateProgressBars() {
  var bars = document.querySelectorAll(".progress__bar-fill");
  bars.forEach(function (bar) {
    var w = bar.getAttribute("data-width");
    if (w) {
      bar.style.width = "0%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.width = w + "%";
        });
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initSidebarNav();
  initSidebarMobile();
  initTabs();
  animateProgressBars();

  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }
  });
});