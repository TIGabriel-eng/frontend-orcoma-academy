/* =========================================
   MODAL RECUPERAR SENHA
========================================= */

const openRecovery =
document.getElementById("openRecovery");

const closeRecovery =
document.getElementById("closeRecovery");

const recoveryModal =
document.getElementById("recoveryModal");

openRecovery.addEventListener("click", (e) => {
    e.preventDefault();
    recoveryModal.classList.add("active");
});

closeRecovery.addEventListener("click", () => {
    recoveryModal.classList.remove("active");
});

recoveryModal.addEventListener("click", (e) => {
    if(e.target === recoveryModal){
        recoveryModal.classList.remove("active");
    }
});

/* =========================================
   CONEXÃO COM ACADEMY
========================================= */

