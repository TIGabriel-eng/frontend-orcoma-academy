/* ==========================================================
   BOTÕES DE SELEÇÃO
========================================================== */

const botoes = document.querySelectorAll(".btn-plano");

/*
   Cada botão recebe um evento de clique.
   Futuramente você pode redirecionar o usuário
   para outra página ou salvar a escolha no Supabase.
*/

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const plano =
            botao
            .closest(".plano-card")
            .querySelector("h2")
            .textContent;

        console.log("Plano selecionado:", plano);

        /*
           Exemplo futuro:

           localStorage.setItem("plano", plano);

           ou

           window.location.href = "dashboard.html";
        */

    });

});


/* efeito pramium nos cards */

const cards = document.querySelectorAll('.plano-card');

cards.forEach(card => {

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

    const cards = document.querySelectorAll('.plano-card');

    cards.forEach((card,index) => {

        setTimeout(() => {

            card.classList.add('show');

        }, index * 150);

    });

});