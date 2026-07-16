/* ==========================================================
   CONTROLE DE ACESSO — POR ROLE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const role =
        auth.getRole();

    if (role === null) return;

    const ehAdmin = role === 'admin';

    const ehClienteOrcoma = role === 'cliente_orcoma';

    const todosCards = document.querySelectorAll('.plano-card');

    todosCards.forEach(card => {
        const titulo =
            card.querySelector("h2").textContent;

        if (titulo === "ADMIN ORCOMA") {
            if (!ehAdmin) {
                card.style.display = 'none';
            }
        }

    });

});

/* ==========================================================
   BOTÕES DE SELEÇÃO
========================================================= */

const botoes = document.querySelectorAll(".btn-plano");

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const plano =
            botao
            .closest(".plano-card")
            .querySelector("h2")
            .textContent;

        console.log("Plano selecionado:", plano);

        if (plano === "ADMIN ORCOMA") {
            Router.navigate("../orcoma-business/index.html");
        }

    });

});

/* Redirecionamento dos planos */

function acessarBusiness() {
    Router.navigate("../orcoma-business/index.html");
}

/* efeito premium nos cards */

const cardsJS = document.querySelectorAll('.plano-card');

cardsJS.forEach(card => {

    card.addEventListener('mousemove', (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 3;
        const centerY = rect.height / 3;

        const rotateY = (x - centerX) / 25;
        const rotateX = -(y - centerY) / 25;

        card.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-5px)`;

    });

    card.addEventListener('mouseleave', () => {

        card.style.transform =
            'perspective(1000px) rotateX(0) rotateY(0)';

    });

});

/* Cards entrando com efeito premium */

window.addEventListener('load', () => {

    const cardsLoad = document.querySelectorAll('.plano-card');

    cardsLoad.forEach((card,index) => {

        setTimeout(() => {

            card.classList.add('show');

        }, index * 150);

    });

});

/* Anti Copy */
