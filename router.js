var Router = {
  currentAcademy: null,

  init: function () {
    var path = window.location.pathname.replace(/\\/g, '/');
    if (path.indexOf('/orcoma-business/') !== -1 || path.indexOf('/academy-contabil/') !== -1 || path.indexOf('/academy-empresarial/') !== -1) {
      this.currentAcademy = 'business';
    } else if (path.indexOf('/academy-team/') !== -1 || path.indexOf('/academy-cliente-time/') !== -1 || path.indexOf('/academy-orcomakers/') !== -1) {
      this.currentAcademy = 'team';
    } else {
      this.currentAcademy = auth.getCurrentAcademy();
    }
    auth.setCurrentAcademy(this.currentAcademy);
  },

  navigate: function (url) {
    if (url.indexOf('/orcoma-business/') !== -1 || url.indexOf('/academy-contabil/') !== -1 || url.indexOf('/academy-empresarial/') !== -1) {
      auth.setCurrentAcademy('business');
    } else if (url.indexOf('/academy-team/') !== -1 || url.indexOf('/academy-cliente-time/') !== -1 || url.indexOf('/academy-orcomakers/') !== -1) {
      auth.setCurrentAcademy('team');
    }
    window.location.href = url;
  },

  getHomeUrl: function () {
    return this.currentAcademy === 'team' ? '../academy-team/index.html' : '../orcoma-business/index.html';
  }
};

Router.init();

/* Intercepta cliques em links de dropdowns (perfil, admin, env) para preservar contexto */
document.addEventListener('click', function (e) {
  var link = e.target.closest('.profile-dropdown__item, .admin-dropdown__item, .env-dropdown__item');
  if (link && link.getAttribute('href') && link.getAttribute('href').indexOf('#') === -1) {
    e.preventDefault();
    Router.navigate(link.getAttribute('href'));
  }
});
