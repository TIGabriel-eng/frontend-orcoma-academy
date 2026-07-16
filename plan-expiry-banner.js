/* ============================================================
   ORCOMA ACADEMY — Banner de Expiração de Plano
   Mostra aviso proativo quando o plano está perto de expirar
   ============================================================ */

const PlanExpiryBanner = (() => {
  const SESSION_KEY = 'orcoma_expiry_banner_shown';
  const STORAGE_KEY = 'orcoma_expiry_dismissed';

  function shouldShow() {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    if (localStorage.getItem(STORAGE_KEY)) {
      var dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      var today = new Date().toDateString();
      if (dismissed.date === today) return false;
    }
    return true;
  }

  function markShown() {
    sessionStorage.setItem(SESSION_KEY, 'true');
  }

  function markDismissed() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: new Date().toDateString()
    }));
  }

  function getBannerStyles(level) {
    var colors = {
      urgent: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', icon: '#dc2626' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '#f59e0b' },
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '#3b82f6' }
    };
    return colors[level] || colors.info;
  }

  function getLevel(diasRestantes) {
    if (diasRestantes <= 3) return 'urgent';
    if (diasRestantes <= 7) return 'warning';
    return 'info';
  }

  function getMessage(diasRestantes, planoNome, dataExpiracao) {
    var dataFormatada = new Date(dataExpiracao + 'T00:00:00').toLocaleDateString('pt-BR');
    if (diasRestantes === 0) {
      return 'Seu plano <strong>' + planoNome + '</strong> expira <strong>hoje</strong>. Renove para manter o acesso.';
    }
    if (diasRestantes === 1) {
      return 'Seu plano <strong>' + planoNome + '</strong> expira <strong>amanhã</strong> (' + dataFormatada + '). Renove para manter o acesso.';
    }
    return 'Seu plano <strong>' + planoNome + '</strong> expira em <strong>' + diasRestantes + ' dias</strong> (' + dataFormatada + '). Renove para manter o acesso.';
  }

  function createBanner(diasRestantes, planoNome, dataExpiracao) {
    var level = getLevel(diasRestantes);
    var colors = getBannerStyles(level);
    var message = getMessage(diasRestantes, planoNome, dataExpiracao);

    var icons = {
      urgent: 'fa-solid fa-triangle-exclamation',
      warning: 'fa-solid fa-clock',
      info: 'fa-solid fa-info-circle'
    };

    var banner = document.createElement('div');
    banner.id = 'planExpiryBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-family:var(--font-body, "DM Sans", sans-serif);font-size:14px;animation:slideDown 0.3s ease-out;';
    banner.style.backgroundColor = colors.bg;
    banner.style.borderBottom = '2px solid ' + colors.border;
    banner.style.color = colors.text;

    banner.innerHTML = '<i class="' + icons[level] + '" style="font-size:18px;color:' + colors.icon + '"></i>' +
      '<span>' + message + '</span>' +
      '<button id="dismissExpiryBanner" style="margin-left:8px;padding:4px 12px;border-radius:6px;border:1px solid ' + colors.border + ';background:transparent;color:' + colors.text + ';cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap;">Entendi</button>';

    return banner;
  }

  function init() {
    if (!shouldShow()) return;

    if (typeof API === 'undefined' || typeof auth === 'undefined' || !auth.getAccessToken()) return;

    API.get('/api/assinaturas/').then(function(assinaturas) {
      if (!assinaturas || assinaturas.length === 0) return;

      var assinaturaAtiva = assinaturas.find(function(a) {
        return a.status === 'ativa' && a.dias_restantes <= 10;
      });

      if (!assinaturaAtiva) return;

      var banner = createBanner(
        assinaturaAtiva.dias_restantes,
        assinaturaAtiva.plano_nome,
        assinaturaAtiva.data_expiracao
      );

      document.body.prepend(banner);
      markShown();

      var dismissBtn = document.getElementById('dismissExpiryBanner');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', function() {
          banner.style.animation = 'slideUp 0.3s ease-out forwards';
          setTimeout(function() { banner.remove(); }, 300);
          markDismissed();
        });
      }

      setTimeout(function() {
        if (banner.parentNode) {
          banner.style.animation = 'slideUp 0.3s ease-out forwards';
          setTimeout(function() { banner.remove(); }, 300);
        }
      }, 15000);
    }).catch(function() {});
  }

  return { init };
})();

(function injectBannerStyles() {
  var style = document.createElement('style');
  style.textContent = '@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes slideUp{from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0}}';
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() { PlanExpiryBanner.init(); }, 1500);
});
