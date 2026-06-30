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
        sessionStorage.clear();
        window.location.href = "../Login/index.html";
        return;
      }

      var url = null;
      if (page === "inicio") url = "../orcoma-business/index.html";
      else if (page === "meu-perfil") url = "../meu-perfil/index.html";
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "../certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
      else if (page === "favoritos") url = "../favoritos/index.html";
      else if (page === "suporte") url = "../suporte/index.html";
      else if (page === "config") return; // already on this page

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
document.addEventListener("DOMContentLoaded", function () { initSidebarNav(); initSidebarMobile(); });
