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
