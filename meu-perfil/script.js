const insigniaData = {};

const insigniaPermitidas = {};

function renderizarInsignias(role) {
  const grid = document.getElementById("insigniasGrid");
  if (!grid) return;
  const permitidas = insigniaPermitidas[role] || [];
  if (permitidas.length === 0) {
    grid.innerHTML = '<p style="color:#64748b;font-size:13px;margin:0;">Nenhuma insígnia</p>';
    return;
  }
  grid.innerHTML = permitidas.map(function (key) {
    const d = insigniaData[key];
    if (!d) return "";
    return '<div class="insignia-card" data-insignia="' + key + '" data-icon="' + d.icon + '" onclick="abrirInsignia(this)">' +
      '<div class="insignia-card__icon"><i class="fa-solid ' + d.icon + '"></i></div>' +
      '<span class="insignia-card__name pill-' + key + '">' + d.name + '</span>' +
    '</div>';
  }).join("");
}

function abrirInsignia(el) {
  const key = el.getAttribute("data-insignia");
  const data = insigniaData[key];
  const modal = document.getElementById("insigniaModal");
  if (!modal || !data) return;

  document.getElementById("insigniaModalIcon").innerHTML = '<i class="fa-solid ' + data.icon + '"></i>';
  const modalName = document.getElementById("insigniaModalName");
  modalName.textContent = data.name;
  modalName.classList.toggle("pill-admin", key === "admin");
  document.getElementById("insigniaModalDesc").textContent = data.desc;

  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

/* ============================================================
   SIDEBAR MOBILE
============================================================ */

function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggle");
  const overlay = document.getElementById("sidebarOverlay");

  if (!sidebar || !menuToggleBtn || !overlay) return;

  menuToggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("is-open");
    overlay.classList.toggle("is-visible");
    document.body.style.overflow = sidebar.classList.contains("is-open") ? "hidden" : "";
  });

  overlay.addEventListener("click", function () {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  });
}

/* ============================================================
   NAVEGAÇÃO DA SIDEBAR
============================================================ */

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var page = item.getAttribute("data-page");
      if (page === "sair") {
        auth.logout();
        window.location.href = "../Login/index.html";
        return;
      }

      var url = null;
      if (page === "inicio") url = Router.getHomeUrl();
      else if (page === "meu-perfil") return; // already on this page
      else if (page === "cursos") url = "../meuscursos/index.html";
      else if (page === "continuar") url = "../continuarassistindo/index.html";
      else if (page === "concluidos") url = "../cursos-concluidos/index.html";
      else if (page === "certificados") url = "/Certificados/index.html";
      else if (page === "trilhas") url = "../trilhasdeaprendizagem/index.html";
      else if (page === "suporte") url = "../suporte/index.html";
      else if (page === "config") url = "../configuracoes/index.html";

      if (!url) {
        navItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");
        return;
      }

      item.classList.add("clicked");

      setTimeout(function () {
        Router.navigate(url);
      }, 200);
    });
  });
}

/* ============================================================
   MAPA DE PLANOS
============================================================ */

const planoMap = {
  admin: "Administrador",
  cliente_orcoma: "Cliente Orcoma",
  colaborador_orcoma: "Orcoma Team",
  gestor_orcoma: "Orcoma Business",
  empresario: "Empresário",
  visitor: "Visitante"
};

/* ============================================================
   COR DO AVATAR BASEADA NO NOME
============================================================ */

function corDoNome(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#f59e0b", "#3b82f6", "#ef4444", "#10b981",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];
  return colors[Math.abs(hash) % colors.length];
}

/* ============================================================
   ESTADO DO PERFIL
============================================================ */

let profileOriginal = {};

/* ============================================================
   CARREGAR PERFIL
============================================================ */

async function carregarPerfil() {
  var token = auth.getAccessToken();
  if (!token) {
    return {
      nome: "Visitante",
      email: "",
      role: "visitor",
      empresa: "",
      plano_nome: "Visitante",
      sobre: ""
    };
  }
  try {
    var data = await API.get('/api/me/');
    var avatarUrl = data.avatar_url || data.perfil && data.perfil.avatar || '';
    if (avatarUrl) {
      auth.setUser({ avatar: avatarUrl });
    }
    return {
      id: data.id,
      nome: data.nome || data.first_name || data.username,
      email: data.email || "",
      role: data.role || "visitor",
      empresa: data.perfil ? (data.perfil.empresa || "") : "",
      telefone: data.perfil ? (data.perfil.telefone || "") : "",
      plano_nome: data.plano_nome || "Visitante",
      sobre: data.perfil ? (data.perfil.bio || "") : "",
      avatar_url: avatarUrl,
      created_at: data.date_joined || null
    };
  } catch (err) {
    return {
      nome: "Usuário",
      email: auth.getEmail(),
      role: auth.getRole(),
      empresa: "",
      plano_nome: "Visitante",
      sobre: localStorage.getItem("perfil_sobre") || "",
      created_at: localStorage.getItem("perfil_created_at") || null
    };
  }
}

/* ============================================================
   PREENCHER CARD DO PERFIL
============================================================ */

function preencherPerfil(profile) {
  const role = profile.role || auth.getRole();
  const nome = profile.nome || profile.email?.split("@")[0] || "Usuário";
  const email = profile.email || auth.getEmail();
  const empresa = profile.empresa || "—";
  const created = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "—";

  const planoNome = profile.plano_nome || auth.getPlanoNome();
  const roleLabel = planoMap[role] || role;
  const planoLabel = planoNome || roleLabel;
  const isAdmin = role === "admin";

  const avatarEl = document.querySelector(".profile-card__avatar");
  if (avatarEl) {
    if (profile.avatar_url) {
      avatarEl.innerHTML = '<img src="' + profile.avatar_url + '" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
    } else {
      avatarEl.textContent = nome.charAt(0).toUpperCase();
      avatarEl.style.background = corDoNome(nome);
      avatarEl.style.color = "#fff";
    }
  }

  const nameEl = document.querySelector(".profile-card__name");
  if (nameEl) nameEl.textContent = nome;

  const badgeEl = document.querySelector(".profile-card__badge");
  if (badgeEl) {
    badgeEl.textContent = roleLabel;
    if (isAdmin) {
      badgeEl.style.borderColor = "#ff4444";
      badgeEl.style.color = "#ff4444";
    } else {
      badgeEl.style.borderColor = "#64748b";
      badgeEl.style.color = "#64748b";
    }
  }

  /* Formação acadêmica no card */
  const formacaoEl = document.getElementById("profileFormacao");
  if (formacaoEl) {
    carregarFormacoesApi().then(function (formacoes) {
      if (formacoes.length > 0) {
        formacaoEl.textContent = formacoes[0].nivel + " em " + formacoes[0].area;
      } else {
        formacaoEl.textContent = "";
      }
    });
  }

  /* Insígnias baseadas na role do Django */
  renderizarInsignias(role);

  const infoSpans = document.querySelectorAll(".profile-card__info span");
  if (infoSpans.length >= 3) {
    infoSpans[0].innerHTML = `<i class="fa-regular fa-envelope"></i> ${email}`;
    infoSpans[1].innerHTML = `<i class="fa-solid fa-building"></i> ${empresa}`;
    infoSpans[2].innerHTML = `<i class="fa-regular fa-calendar"></i> Membro desde ${created}`;
  }

  /* Sobre (aceita sobre ou descricao pra compatibilidade) */
  const sobre = profile.sobre || profile.descricao || "";
  const sobreTexto = document.getElementById("sobreTexto");
  const sobrePill = document.getElementById("sobrePill");
  if (sobreTexto) sobreTexto.textContent = sobre || "Nenhuma descrição";
  if (sobrePill) sobrePill.textContent = sobre ? "Editar descrição" : "+ Adicionar descrição";

  /* Preencher formulário de configurações */
  const inputNome = document.getElementById("inputNome");
  const inputEmail = document.getElementById("inputEmail");
  const inputTelefone = document.getElementById("inputTelefone");
  const displayEmpresa = document.getElementById("displayEmpresa");
  const displayPlano = document.getElementById("displayPlano");
  const planName = document.getElementById("planName");
  const planStatus = document.getElementById("planStatus");
  const planBadge = document.getElementById("planBadge");

  if (inputNome) inputNome.value = nome;
  if (inputEmail) inputEmail.value = email;
  if (inputTelefone) inputTelefone.value = profile.telefone || "";
  if (displayEmpresa) displayEmpresa.textContent = profile.empresa || "Orcoma";
  if (displayPlano) displayPlano.textContent = planoLabel;
  if (planName) {
    planName.textContent = planoLabel;
    planName.className = "";
    planName.classList.add("pill-" + role);
  }
  if (planStatus) planStatus.textContent = planoNome ? "Plano ativo" : "Plano ativo";
  if (planBadge) {
    planBadge.textContent = "Ativo";
    planBadge.className = "plan-badge plan-badge--active";
  }

  profileOriginal = {
    nome: nome,
    email: email,
    telefone: profile.telefone || ""
  };
}

/* ============================================================
   MODAL INSÍGNIA
============================================================ */

function initInsigniaModal() {
  const modal = document.getElementById("insigniaModal");
  const overlay = document.getElementById("insigniaModalOverlay");
  const closeBtn = document.getElementById("insigniaModalClose");

  function fechar() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", fechar);
  if (overlay) overlay.addEventListener("click", fechar);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });
}

/* ============================================================
   COMPOSER DESCRIÇÃO
============================================================ */

function initSobreComposer() {
  const pill = document.getElementById("sobrePill");
  const composer = document.getElementById("sobreComposer");
  const textarea = document.getElementById("sobreTextarea");
  const counter = document.getElementById("sobreCounter");
  const cancelBtn = document.getElementById("sobreCancel");
  const saveBtn = document.getElementById("sobreSave");
  const textEl = document.getElementById("sobreTexto");

  if (!composer || !textarea || !counter || !cancelBtn || !saveBtn || !textEl) return;

  window.composerSobreAtual = localStorage.getItem("perfil_sobre") || (textEl.textContent === "Nenhuma descrição" ? "" : textEl.textContent);

  function atualizarEstadoBtn() {
    saveBtn.disabled = !textarea.value.trim();
  }

  textarea.addEventListener("input", function () {
    counter.textContent = this.value.length + "/6000";
    atualizarEstadoBtn();
  });

  window.abrirComposer = function () {
    textarea.value = window.composerSobreAtual || "";
    counter.textContent = (window.composerSobreAtual || "").length + "/6000";
    textEl.style.display = "none";
    if (pill) pill.style.display = "none";
    composer.classList.add("is-active");
    atualizarEstadoBtn();
    textarea.focus();
  };

  function fecharComposer() {
    composer.classList.remove("is-active");
    textEl.style.display = "";
    pill.style.display = "";
  }

  cancelBtn.addEventListener("click", fecharComposer);

  saveBtn.addEventListener("click", function () {
    const texto = textarea.value.trim();
    if (!texto) return;

    window.composerSobreAtual = texto;
    textEl.textContent = texto;
    pill.textContent = "Editar descrição";
    localStorage.setItem("perfil_sobre", texto);
    API.patch('/api/me/', { perfil: { bio: texto } }).catch(function () {});
    fecharComposer();
  });
}

/* ============================================================
   FORMAÇÃO ACADÊMICA
============================================================ */

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showConfirmModal(message) {
  return new Promise(resolve => {
    const modal = document.getElementById("confirmModal");
    const msgEl = document.getElementById("confirmModalMessage");
    const overlay = document.getElementById("confirmModalOverlay");
    const btnCancel = document.getElementById("confirmModalCancel");
    const btnConfirm = document.getElementById("confirmModalConfirm");

    msgEl.textContent = message;
    modal.classList.add("is-open");

    function cleanup(result) {
      modal.classList.remove("is-open");
      btnCancel.removeEventListener("click", onCancel);
      btnConfirm.removeEventListener("click", onConfirm);
      overlay.removeEventListener("click", onCancel);
      resolve(result);
    }

    function onCancel() { cleanup(false); }
    function onConfirm() { cleanup(true); }

    btnCancel.addEventListener("click", onCancel);
    btnConfirm.addEventListener("click", onConfirm);
    overlay.addEventListener("click", onCancel);
  });
}

function abrirModalFormacao() {
  const modal = document.getElementById("formacaoModal");
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function fecharModalFormacao() {
  const modal = document.getElementById("formacaoModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

async function carregarFormacoesApi() {
  try {
    return await API.get('/api/formacoes/');
  } catch (e) {
    return [];
  }
}

async function salvarFormacaoApi(dados) {
  return await API.post('/api/formacoes/', dados);
}

async function editarFormacaoApi(id, dados) {
  return await API.patch('/api/formacoes/' + id + '/', dados);
}

async function excluirFormacaoApi(id) {
  return await API.del('/api/formacoes/' + id + '/');
}

async function initFormacao() {
  const modal = document.getElementById("formacaoModal");
  const form = document.getElementById("formacaoForm");
  const lista = document.getElementById("formacaoLista");
  const saveBtn = form.querySelector('button[type="submit"]');
  if (!modal || !form || !lista || !saveBtn) return;

  saveBtn.disabled = false;

  /* Popula selects de ano */
  function popularAnos() {
    const anoAtual = new Date().getFullYear();
    const selects = ["formacaoInicioAno", "formacaoTerminoAno"];
    selects.forEach(function (id) {
      const sel = document.getElementById(id);
      if (!sel) return;
      for (let a = anoAtual; a >= 1950; a--) {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        sel.appendChild(opt);
      }
    });
  }
  popularAnos();

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModalFormacao();
  });

  function normalizarNivel(nivel) {
    const mapa = {
      "tecnico": "tecnico",
      "tecnologo": "tecnologo",
      "bacharel": "bacharel",
      "pos-graduado": "posgraduado",
      "posgraduado": "posgraduado",
      "mestre": "mestre",
      "doutor": "doutor"
    };
    const chave = nivel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return mapa[chave] || "";
  }

  async function renderizarFormacoes() {
    var items = await carregarFormacoesApi();
    if (items.length === 0) {
      lista.innerHTML = '<p class="formacao-empty">Nenhuma formação adicionada</p>';
      return;
    }
    lista.innerHTML = items.map(function (f) {
      const cor = normalizarNivel(f.nivel);
      return '<div class="formacao-item" data-id="' + f.id + '">' +
        '<div class="formacao-item__icon formacao-item__icon--' + cor + '"><i class="fa-solid fa-graduation-cap"></i></div>' +
        '<div class="formacao-item__info">' +
          '<span class="formacao-item__curso">' + escapeHtml(f.area) + '</span>' +
          '<span class="formacao-item__instituicao">' + escapeHtml(f.instituicao) + '</span>' +
          '<span style="display:flex;align-items:center;gap:8px;margin-top:4px;">' +
            '<span class="formacao-item__badge formacao-item__badge--' + cor + '">' + escapeHtml(f.nivel) + '</span>' +
            '<span class="formacao-item__periodo">' + f.inicio_mes + ' ' + f.inicio_ano + ' a ' + (f.termino_mes ? f.termino_mes + ' ' + f.termino_ano : 'Atual') + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="formacao-item__actions">' +
          '<button class="formacao-item__btn formacao-item__btn--edit" data-acao="editar" title="Editar">' +
            '<i class="fa-solid fa-pencil"></i>' +
          '</button>' +
          '<button class="formacao-item__btn formacao-item__btn--delete" data-acao="excluir" title="Excluir">' +
            '<i class="fa-solid fa-trash-can"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  let editandoId = null;

  async function deletarFormacao(id) {
    showConfirmModal("Tem certeza que deseja excluir esta formação?").then(async function (confirmed) {
      if (!confirmed) return;
      await excluirFormacaoApi(id);
      renderizarFormacoes();
    });
  }

  async function editarFormacao(id) {
    var items = await carregarFormacoesApi();
    var data = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id == id) { data = items[i]; break; }
    }
    if (!data) return;

    editandoId = id;
    document.getElementById("formacaoInstituicao").value = data.instituicao || "";
    document.getElementById("formacaoNivel").value = data.nivel || "";
    document.getElementById("formacaoArea").value = data.area || "";
    document.getElementById("formacaoInicioMes").value = data.inicio_mes || "";
    document.getElementById("formacaoInicioAno").value = data.inicio_ano || "";
    document.getElementById("formacaoTerminoMes").value = data.termino_mes || "";
    document.getElementById("formacaoTerminoAno").value = data.termino_ano || "";

    document.querySelector("#formacaoModal h2").textContent = "Editar Formação";
    abrirModalFormacao();
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const instituicao = document.getElementById("formacaoInstituicao");
    const nivel = document.getElementById("formacaoNivel");
    const area = document.getElementById("formacaoArea");
    const inicioMes = document.getElementById("formacaoInicioMes");
    const inicioAno = document.getElementById("formacaoInicioAno");
    const terminoMes = document.getElementById("formacaoTerminoMes");
    const terminoAno = document.getElementById("formacaoTerminoAno");

    if (!instituicao.value.trim() || !nivel.value || !area.value.trim()) return;
    if (!inicioMes.value || !inicioAno.value) return;

    const dados = {
      instituicao: instituicao.value.trim(),
      nivel: nivel.value.trim(),
      area: area.value.trim(),
      inicio_mes: inicioMes.value,
      inicio_ano: inicioAno.value,
      termino_mes: terminoMes.value || "",
      termino_ano: terminoAno.value || ""
    };

    if (editandoId) {
      await editarFormacaoApi(editandoId, dados);
      editandoId = null;
    } else {
      await salvarFormacaoApi(dados);
    }

    document.querySelector("#formacaoModal h2").textContent = "Adicionar Formação";
    renderizarFormacoes();
    fecharModalFormacao();
    form.reset();
  });

  renderizarFormacoes();

  lista.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-acao]");
    if (!btn) return;
    const item = btn.closest("[data-id]");
    if (!item) return;
    const id = item.getAttribute("data-id");
    const acao = btn.getAttribute("data-acao");
    if (acao === "editar") editarFormacao(id);
    if (acao === "excluir") deletarFormacao(id);
  });

  window.abrirFormacaoModal = function () {
    editandoId = null;
    document.querySelector("#formacaoModal h2").textContent = "Adicionar Formação";
    document.getElementById("formacaoForm").reset();
    abrirModalFormacao();
  };
  window.fecharFormacaoModal = fecharModalFormacao;
}

/* ============================================================
   HABILIDADES
============================================================ */

async function carregarHabilidadesApi() {
  try {
    return await API.get('/api/habilidades/');
  } catch (e) {
    return [];
  }
}

async function salvarHabilidadeApi(dados) {
  return await API.post('/api/habilidades/', dados);
}

async function excluirHabilidadeApi(id) {
  return await API.del('/api/habilidades/' + id + '/');
}

async function initHabilidades() {
  const lista = document.getElementById("habilidadesLista");
  const form = document.getElementById("habilidadeForm");
  const input = document.getElementById("habilidadeInput");
  const modal = document.getElementById("habilidadeModal");
  if (!lista || !form || !input || !modal) return;

  function abrirModal() {
    input.value = "";
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    input.focus();
  }

  function fecharModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  async function renderizar() {
    var items = await carregarHabilidadesApi();
    if (items.length === 0) {
      lista.innerHTML = '<p class="formacao-empty">Nenhuma habilidade adicionada</p>';
      return;
    }
    lista.innerHTML = items.map(function (h) {
      return '<span class="habilidade-tag">' +
        escapeHtml(h.nome) +
        '<button class="habilidade-tag__remove" data-id="' + h.id + '" title="Remover">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</span>';
    }).join("");
  }

  lista.addEventListener("click", async function (e) {
    const btn = e.target.closest(".habilidade-tag__remove");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    await excluirHabilidadeApi(id);
    renderizar();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const nome = input.value.trim();
    if (!nome) return;

    await salvarHabilidadeApi({ nome: nome });
    renderizar();
    fecharModal();
  });

  window.abrirHabilidadeModal = function () {
    document.querySelector("#habilidadeModal h2").textContent = "Adicionar Habilidade";
    abrirModal();
  };
  window.fecharHabilidadeModal = fecharModal;

  renderizar();
}

/* ============================================================
   CERTIFICADOS
============================================================ */

function initCertificados() {
  const certEl = document.getElementById("certCount");
  if (certEl) certEl.textContent = "0";
}

function abrirCatalogoModal() {
  const modal = document.getElementById("catalogoModal");
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function fecharCatalogoModal() {
  const modal = document.getElementById("catalogoModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

window.consultarCatalogos = function () {
  abrirCatalogoModal();
};

/* ============================================================
   AVATAR UPLOAD
============================================================ */

function initAvatarUpload() {
  var input = document.getElementById('avatarInput');
  var overlay = document.querySelector('.profile-card__avatar-overlay');
  if (!input || !overlay) return;

  overlay.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    input.click();
  });

  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file) return;

    var allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.indexOf(file.type) === -1) {
      alert('Formato não suportado. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      input.value = '';
      return;
    }

    var formData = new FormData();
    formData.append('avatar', file);

    var token = auth.getAccessToken();
    var base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000'
      : 'https://orcoma-academy-backend.onrender.com';

    overlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    fetch(base + '/api/avatar/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData,
      credentials: 'include'
    })
    .then(function (res) {
      return res.text().then(function (text) {
        var data;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (!res.ok) {
          throw data || { error: 'Erro ao enviar avatar. Tente novamente.' };
        }
        return data;
      });
    })
    .then(function (data) {
      if (data && data.avatar_url) {
        var avatarEl = document.querySelector('.profile-card__avatar');
        if (avatarEl) {
          avatarEl.innerHTML = '<img src="' + data.avatar_url + '" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
        }
        auth.setUser({ avatar: data.avatar_url });
      }
      overlay.innerHTML = '<i class="fa-solid fa-camera"></i>';
      input.value = '';
    })
    .catch(function (err) {
      var msg = (err && (err.error || err.detail)) ? (err.error || err.detail) : 'Erro ao enviar avatar. Tente novamente.';
      alert(msg);
      overlay.innerHTML = '<i class="fa-solid fa-camera"></i>';
      input.value = '';
    });
  });
}

/* ============================================================
   INICIALIZAÇÃO
=========================================================== */

/* Dropdown de seleção de ambiente (Academy Business / Academy Team) */
function initEnvSelector() {
  const envToggle = document.getElementById('envSelectorToggle');
  const envDropdown = document.getElementById('envDropdown');
  const envChevron = document.getElementById('envChevron');
  const currentEnvName = document.getElementById('currentEnvName');
  if (envToggle && envDropdown) {
    envToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      envDropdown.classList.toggle('is-visible');
      if (envChevron) envChevron.classList.toggle('is-open');
    });
    document.addEventListener('click', function () {
      envDropdown.classList.remove('is-visible');
      if (envChevron) envChevron.classList.remove('is-open');
    });
    envDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    const currentPath = window.location.pathname;
    const envItems = envDropdown.querySelectorAll('.env-dropdown__item');
    envItems.forEach(function (item) {
      item.classList.remove('active');
      if (currentPath.includes(item.getAttribute('href'))) {
        item.classList.add('active');
        if (currentEnvName) {
          currentEnvName.textContent = item.textContent.trim();
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  initEnvSelector();
  initSidebarNav();
  initSidebarMobile();
  initInsigniaModal();
  initSobreComposer();
  initFormacao();
  initHabilidades();
  initCertificados();
  initAvatarUpload();
  const profile = await carregarPerfil();
  preencherPerfil(profile);
  initAssinaturaStatus();
});

/* ============================================================
   STATUS DA ASSINATURA
============================================================ */

function initAssinaturaStatus() {
  var statusEl = document.getElementById("assinaturaStatus");
  var dataExpiracaoEl = document.getElementById("assinaturaDataExpiracao");
  var dataContratacaoEl = document.getElementById("assinaturaDataContratacao");
  var diasLabelEl = document.getElementById("assinaturaDiasLabel");
  var diasPctEl = document.getElementById("assinaturaDiasPct");
  var progressFillEl = document.getElementById("assinaturaProgressFill");
  var planNameEl = document.getElementById("planName");
  var planStatusEl = document.getElementById("planStatus");
  var planBadgeEl = document.getElementById("planBadge");

  if (!statusEl) return;

  API.get('/api/assinaturas/').then(function (items) {
    if (!items || items.length === 0) return;

    var a = items[0];

    if (dataContratacaoEl) dataContratacaoEl.textContent = formatarDataBR(a.data_contratacao);
    if (dataExpiracaoEl) dataExpiracaoEl.textContent = formatarDataBR(a.data_expiracao);
    if (diasPctEl) diasPctEl.textContent = a.percentual_usado + "%";
    if (progressFillEl) progressFillEl.style.width = a.percentual_usado + "%";

    var diasRestantes = a.dias_restantes;
    var statusAtual = a.status;

    var expirado = statusAtual === "expirada" || statusAtual === "cancelada" || statusAtual === "inativo" || diasRestantes <= 0;

    if (expirado) {
      statusEl.textContent = statusAtual === "cancelada" ? "Cancelado" : "Vencido";
      statusEl.className = "assinatura-card__status assinatura-card__status--expirada";
      if (diasLabelEl) { diasLabelEl.textContent = "Plano vencido"; diasLabelEl.style.color = "#ef4444"; }
      if (diasPctEl) diasPctEl.style.color = "#ef4444";
      if (progressFillEl) {
        progressFillEl.classList.add("assinatura-progress-inline__fill--expirada");
        progressFillEl.style.width = "100%";
      }
      if (diasPctEl) diasPctEl.textContent = "100%";
      if (planNameEl) { planNameEl.textContent = a.plano_nome; planNameEl.style.color = "#64748b"; }
      if (planStatusEl) { planStatusEl.textContent = "Plano inativo"; planStatusEl.style.color = "#64748b"; }
      if (planBadgeEl) { planBadgeEl.textContent = "Inativo"; planBadgeEl.className = "plan-badge plan-badge--inactive"; }
    } else if (diasRestantes <= 7) {
      statusEl.textContent = "Atenção";
      statusEl.className = "assinatura-card__status assinatura-card__status--atencao";
      if (diasLabelEl) { diasLabelEl.textContent = "Restam " + diasRestantes + " dias"; diasLabelEl.style.color = "#f59e0b"; }
      if (diasPctEl) diasPctEl.style.color = "#f59e0b";
      if (planNameEl) planNameEl.textContent = a.plano_nome;
      if (planStatusEl) planStatusEl.textContent = "Plano ativo";
      if (planBadgeEl) { planBadgeEl.textContent = "Ativo"; planBadgeEl.className = "plan-badge plan-badge--active"; }
    } else {
      statusEl.textContent = "Ativa";
      statusEl.className = "assinatura-card__status assinatura-card__status--ativa";
      if (diasLabelEl) diasLabelEl.textContent = "Restam " + diasRestantes + " dias";
      if (planNameEl) planNameEl.textContent = a.plano_nome;
      if (planStatusEl) planStatusEl.textContent = "Plano ativo";
      if (planBadgeEl) { planBadgeEl.textContent = "Ativo"; planBadgeEl.className = "plan-badge plan-badge--active"; }
    }
  });
}

function formatarDataBR(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  var meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  var mesIdx = parseInt(parts[1], 10) - 1;
  return parts[2] + "/" + (meses[mesIdx] || parts[1]) + "/" + parts[0];
}

/* Anti Copy */
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

