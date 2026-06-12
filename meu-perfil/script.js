/* ============================================================
   ORCOMA ACADEMY — JavaScript
   Organização:
   1. Proteção contra DevTools / console injection
   2. Sidebar mobile (abrir/fechar)
   3. Navegação da sidebar (item ativo)
   4. Animação do círculo de progresso
   5. Animação das barras de progresso
   6. Animação dos contadores de estatísticas (stats)
   7. Inicialização (chamada na carga do DOM)
   ============================================================ */


/* ============================================================
   1. PROTEÇÃO CONTRA DEVTOOLS E INJECT
   ============================================================ */

/**
 * Detecta abertura do DevTools monitorando a diferença entre
 * o tamanho interno e externo da janela.
 * Quando detectado, redireciona para página de aviso.
 */
(function protectDevTools() {
  "use strict";

  /* Limpa o console periodicamente */
  const consoleClearInterval = setInterval(function () {
    console.clear();
  }, 1000);

  /* Sobrescreve os métodos do console para bloquear outputs */
  const noop = function () {};
  const consoleMethods = ["log", "warn", "error", "info", "debug", "table", "dir"];
  consoleMethods.forEach(function (method) {
    console[method] = noop;
  });

  /* Detecta abertura do DevTools pela diferença de tamanho da janela */
  const THRESHOLD = 160; /* pixels de diferença que indicam painel aberto */

  function checkDevTools() {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > THRESHOLD || heightDiff > THRESHOLD) {
      /* Redireciona para uma página de aviso ou em branco */
      document.body.innerHTML =
        "<div style=\"display:flex;align-items:center;justify-content:center;" +
        "height:100vh;background:#0a0e1a;color:#f5a623;font-family:sans-serif;" +
        "font-size:1.2rem;text-align:center;\">" +
        "<p>⚠️ Acesso não autorizado.<br>Feche o DevTools para continuar.</p></div>";
    }
  }

  /* Verifica a cada 800ms */
  setInterval(checkDevTools, 800);

  /* Bloqueia atalhos de teclado comuns do DevTools */
  document.addEventListener("keydown", function (event) {
    const blockedKeys = [
      { key: "F12" },                                    /* F12 */
      { key: "I", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+I */
      { key: "J", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+J */
      { key: "C", ctrlKey: true, shiftKey: true },       /* Ctrl+Shift+C */
      { key: "U", ctrlKey: true },                       /* Ctrl+U (View Source) */
    ];

    const isBlocked = blockedKeys.some(function (combo) {
      return (
        event.key === combo.key &&
        (combo.ctrlKey  === undefined || event.ctrlKey  === combo.ctrlKey)  &&
        (combo.shiftKey === undefined || event.shiftKey === combo.shiftKey)
      );
    });

    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  /* Bloqueia clique direito (menu de contexto) */
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

}()); /* Execução imediata para proteção antes do DOM */


/* ============================================================
   2. SIDEBAR MOBILE
   ============================================================ */

/**
 * Abre e fecha a sidebar em telas pequenas.
 * Também fecha ao clicar no overlay escuro.
 */
function initSidebarMobile() {
  const sidebar        = document.getElementById("sidebar");
  const menuToggleBtn  = document.getElementById("menuToggle");
  const overlay        = document.getElementById("sidebarOverlay");

  if (!sidebar || !menuToggleBtn || !overlay) return;

  /* Abre a sidebar */
  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden"; /* Trava scroll do body */
  }

  /* Fecha a sidebar */
  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.style.overflow = ""; /* Libera scroll */
  }

  menuToggleBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  /* Fecha ao clicar no overlay */
  overlay.addEventListener("click", closeSidebar);
}


/* ============================================================
   3. NAVEGAÇÃO DA SIDEBAR (ITEM ATIVO)
   ============================================================ */

/**
 * Marca o item clicado como ativo e remove dos demais.
 */
function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      /* Remove o estado ativo de todos */
      navItems.forEach(function (i) {
        i.classList.remove("active");
      });

      /* Adiciona ao clicado */
      item.classList.add("active");
    });
  });
}

/* ============================================================
   7. INICIALIZAÇÃO
   ============================================================ */

/**
 * Ponto de entrada principal.
 * Chamado quando o DOM está totalmente carregado.
 */
document.addEventListener("DOMContentLoaded", function () {

  /* Inicializa módulo de navegação da sidebar */
  initSidebarNav();

  /* Inicializa abertura/fechamento da sidebar no mobile */
  initSidebarMobile();

  /* Anima o círculo de progresso geral (72%) */
  animateProgressCircle(72);

  /* Anima todas as barras de progresso */
  animateProgressBars();

  /* Inicia os contadores de estatísticas */
  initStatsCounters();

  const planoMap = {
  'cliente_orcoma':     'Cliente Orcoma',
  'colaborador_orcoma': 'Orcoma Team',
  'gestor_orcoma':      'Orcoma Business',
    };  /* Atualiza o plano do usuário no sidebar de progresso */

    const tipoUsuario = 'cliente_orcoma';

    const planLabel = document.querySelector('.progress-sidebar__plan');
        if (planLabel) {
         planLabel.textContent = planoMap[tipoUsuario] ?? 'Cliente Orcoma';
    }

    /* Avatar: usa foto do usuário ou fallback para avatar-icon.jpg */
    const avatarEl = document.getElementById('userAvatar');
    const fotoUsuario = null; // substitua por ex: usuario.foto_url vindo do backend

        if (avatarEl) {
        if (fotoUsuario) {
                avatarEl.src = fotoUsuario;
            } 
        else {
                avatarEl.src = 'assets/images/avatar-icon.jpg';
        }
    }

    /* Atalho de teclado: Ctrl + K para focar no input de busca */
    document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    if (input) input.focus();
  }
});
});

// ===============================
// 10 . INICIAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  renderTrilhas();
});

/* SELEÇÃO DE IDIOMAS */

document.querySelectorAll('.language-options button')
.forEach(button => {

    button.addEventListener('click', () => {

        document
            .querySelectorAll('.language-options button')
            .forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');

    });

});

/* Editar os Campos de Preenchimento ( Informações ) */

document.querySelectorAll('.input-readonly')
.forEach(field => {

    const icon = field.querySelector('.fa-pen');

    if(!icon) return;

    icon.addEventListener('click', () => {

        const currentValue = field.childNodes[0].textContent.trim();

        const newValue = prompt(
            'Editar informação:',
            currentValue
        );

        if(newValue){

            field.childNodes[0].textContent =
                newValue + ' ';

        }

    });

});

/* Botão de Salvar Alterações */

const saveBtn = document.querySelector('.save-btn');

saveBtn.addEventListener('click', () => {

    saveBtn.textContent = 'Salvando...';

    setTimeout(() => {

        saveBtn.textContent = 'Salvo ✓';

        setTimeout(() => {

            saveBtn.textContent =
                'Salvar alterações';

        }, 2000);

    }, 1000);

});

/* Gerenciar Assinaturas */

document
.querySelector('.subscription-btn')
.addEventListener('click', () => {

    alert(
        'Abrir página de gerenciamento da assinatura'
    );

});
