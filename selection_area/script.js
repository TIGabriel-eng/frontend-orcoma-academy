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