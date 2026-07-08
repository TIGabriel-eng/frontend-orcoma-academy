(function () {
  "use strict";

  /* ========== SIDEBAR MOBILE ========== */
  function initSidebarMobile() {
    var sidebar = document.getElementById("sidebar");
    var menuToggleBtn = document.getElementById("menuToggle");
    var overlay = document.getElementById("sidebarOverlay");

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

  /* ========== NAVEGAÇÃO DA SIDEBAR ========== */
  function initSidebarNav() {
    var navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        var page = item.getAttribute("data-page");

        navItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");

        var titles = {
          "visao-geral": "Visão Geral",
          "cursos-videos": "Cursos e vídeos",
          "trilhas": "Trilhas",
          "novidades": "Novidades",
          "anuncios": "Eventos",
          "usuarios": "Usuários",
          "log-atividades": "Log de Atividades"
        };

        var titleEl = document.getElementById("pageTitle");
        if (titleEl && titles[page]) {
          titleEl.textContent = titles[page];
        }

        var sections = document.querySelectorAll(".page-section");
        sections.forEach(function (s) { s.classList.remove("active"); });
        var target = document.querySelector('.page-section[data-page="' + page + '"]');
        if (target) target.classList.add("active");

        item.classList.add("clicked");
        setTimeout(function () {
          item.classList.remove("clicked");
        }, 200);

        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("sidebarOverlay");
        if (sidebar && overlay && window.innerWidth <= 768) {
          sidebar.classList.remove("is-open");
          overlay.classList.remove("is-visible");
          document.body.style.overflow = "";
        }
      });
    });
  }

  /* ========== MODAL ADICIONAR CONTEÚDO ========== */
  function initModal() {
    var btnAdd = document.querySelector(".btn-add-content");
    var overlay = document.getElementById("modalOverlay");
    var closeBtn = document.getElementById("modalClose");
    var cancelBtn = document.getElementById("modalCancel");
    var form = document.getElementById("addContentForm");
    var trilhasList = document.getElementById("trilhasList");
    var filterInput = document.getElementById("trilhaFilter");

    if (!btnAdd || !overlay) return;

    function openModal() {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      populateTrilhas("");
    }

    function closeModal() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      form.reset();
    }

    btnAdd.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    /* Popula lista de trilhas */
    function populateTrilhas(filter) {
      if (!trilhasList) return;
      var data = typeof SEARCH_DATA !== "undefined" ? SEARCH_DATA.trilhas : [];
      var lowerFilter = filter.toLowerCase().trim();
      var html = "";

      if (data.length === 0) {
        html = '<div class="modal__trilha-empty">Nenhuma trilha encontrada.</div>';
      } else {
        data.forEach(function (t) {
          var match = !lowerFilter || t.titulo.toLowerCase().includes(lowerFilter);
          var hidden = match ? "" : " hidden";
          html +=
            '<label class="modal__trilha-item' + hidden + '">' +
              '<input type="checkbox" value="' + t.id + '" />' +
              '<span>' + t.titulo + '</span>' +
            '</label>';
        });
      }

      trilhasList.innerHTML = html;
    }

    if (filterInput) {
      filterInput.addEventListener("input", function () {
        populateTrilhas(this.value);
      });
    }

    /* Submit do form */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = document.getElementById("contentTitle").value.trim();
      var type = document.getElementById("contentType").value;
      var desc = document.getElementById("contentDescription").value.trim();
      var checked = trilhasList.querySelectorAll('input[type="checkbox"]:checked');
      var trilhasSelecionadas = [];
      checked.forEach(function (cb) { trilhasSelecionadas.push(cb.value); });

      console.log("Conteúdo adicionado:", { title: title, type: type, desc: desc, trilhas: trilhasSelecionadas });
      closeModal();
      showToast("Conteúdo \"" + title + "\" adicionado com sucesso!");
    });
  }

  /* ========== TOAST ========== */
  function showToast(message) {
    var overlay = document.getElementById("toastOverlay");
    var msgEl = document.getElementById("toastMessage");
    var okBtn = document.getElementById("toastOk");
    if (!overlay || !msgEl || !okBtn) return;

    msgEl.textContent = message;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    function closeToast() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    okBtn.onclick = closeToast;
    overlay.onclick = function (e) {
      if (e.target === overlay) closeToast();
    };
  }

  /* ========== MODAL ADICIONAR TRILHA ========== */
  function initModalTrilha() {
    var btnAdd = document.querySelector(".btn-add-trilha");
    var overlay = document.getElementById("modalOverlayTrilha");
    var closeBtn = document.getElementById("modalCloseTrilha");
    var cancelBtn = document.getElementById("modalCancelTrilha");
    var form = document.getElementById("addTrilhaForm");

    if (!btnAdd || !overlay) return;

    function openModal() {
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      form.reset();
    }

    btnAdd.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("trilhaName").value.trim();
      var ambiente = document.getElementById("trilhaAmbiente").value;
      var desc = document.getElementById("trilhaDesc").value.trim();

      console.log("Trilha adicionada:", { name: name, ambiente: ambiente, desc: desc });
      closeModal();
      showToast("Trilha \"" + name + "\" adicionada com sucesso!");
    });
  }

  /* ========== EFEITO RIPPLE NOS BOTÕES ========== */
  function initRippleEffect() {
    var navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        var ripple = document.createElement("span");
        ripple.className = "nav-item__ripple";

        var rect = item.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        item.appendChild(ripple);

        setTimeout(function () {
          ripple.remove();
        }, 600);
      });
    });
  }

  /* ========== INICIALIZAÇÃO ========== */
  document.addEventListener("DOMContentLoaded", function () {
    initSidebarMobile();
    initSidebarNav();
    initRippleEffect();
    initModal();
    initModalTrilha();
  });

})();

/* Anti Copy */
document.addEventListener('copy', function (e) { e.preventDefault(); });
document.addEventListener('cut', function (e) { e.preventDefault(); });
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('dragstart', function (e) { e.preventDefault(); });

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
