// MODAL RECUPERAR SENHA
const openRecovery  = document.getElementById("openRecovery");
const closeRecovery = document.getElementById("closeRecovery");
const recoveryModal = document.getElementById("recoveryModal");

openRecovery.addEventListener("click", (e) => {
    e.preventDefault();
    recoveryModal.classList.add("active");
});

closeRecovery.addEventListener("click", () => {
    recoveryModal.classList.remove("active");
});

recoveryModal.addEventListener("click", (e) => {
    if (e.target === recoveryModal) {
        recoveryModal.classList.remove("active");
    }
});

function togglePassword(inputId, button){

    const input = document.getElementById(inputId);

    const icon = button.querySelector("img");

    if(input.type === "password"){

        input.type = "text";

        icon.src =
        "../assets/images/olho-senha.png";

        icon.alt =
        "Ocultar senha";

    }else{

        input.type = "password";

        icon.src =
        "../assets/images/olho-senha-hidden.png";

        icon.alt =
        "Mostrar senha";
    }
}