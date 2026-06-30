/* ==========================================================
   PLANO TEAM — CONTROLE DE ACESSO POR ROLE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const userRole =
        sessionStorage.getItem('orcoma_user_role') || 'visitor';

    const cards = document.querySelectorAll('.plano-card');

    cards.forEach(card => {
        const allowedRoles =
            (card.getAttribute('data-roles') || '').split(',');

        if (!allowedRoles.includes(userRole)) {
            card.classList.add('locked');
        }
    });

});

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
