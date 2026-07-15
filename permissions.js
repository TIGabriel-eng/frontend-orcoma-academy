/* ============================================================
   PERMISSÕES DINÂMICAS VIA API
   ============================================================ */

const Permissions = (() => {
  let cached = null;

  async function load() {
    if (cached) return cached;

    try {
      const response = await API.get('/api/user-permissions/');
      cached = response;
      return cached;
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      return null;
    }
  }

  function getRole() {
    return cached?.role || sessionStorage.getItem('orcoma_user_role') || 'visitor';
  }

  function canAccess(academyName) {
    if (!cached) return false;
    
    const role = getRole();
    
    const fullAccessRoles = ['admin', 'gestor_orcoma', 'cliente_premium'];
    if (fullAccessRoles.includes(role)) return true;

    return cached.academias_permitidas?.includes(academyName) || false;
  }

  function getAcademySlug(academyName) {
    return academyName.toLowerCase().replace(/\s+/g, '-');
  }

  function getAcademyUrl(academyName) {
    return `/frontend/academy-${getAcademySlug(academyName)}/index.html`;
  }

  function init() {
    load().then(() => {
      document.querySelectorAll('[data-academy]').forEach(element => {
        const academyName = element.getAttribute('data-academy');
        if (!canAccess(academyName)) {
          element.style.display = 'none';
        }
      });

      document.querySelectorAll('[data-academy-href]').forEach(element => {
        const academyName = element.getAttribute('data-academy-href');
        if (!canAccess(academyName)) {
          element.style.display = 'none';
        }
      });

      updateEnvDropdown();
      updatePremiumSidebar();
    });
  }

  function updateEnvDropdown() {
    document.querySelectorAll('.env-dropdown__item').forEach(item => {
      const academyName = item.getAttribute('data-env');
      if (academyName && !canAccess(academyName)) {
        item.style.display = 'none';
      }
    });
  }

  function updatePremiumSidebar() {
    const role = getRole();
    const premiumSidebar = document.querySelector('.sidebar__premium');
    const premiumModal = document.getElementById('premiumModal');

    if (premiumSidebar) {
      if (role === 'cliente_premium') {
        premiumSidebar.style.display = 'none';
      }
    }

    if (premiumModal) {
      if (role === 'cliente_premium') {
        premiumModal.style.display = 'none';
      }
    }
  }

  return {
    load,
    getRole,
    canAccess,
    getAcademySlug,
    getAcademyUrl,
    init,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Permissions.init();
});