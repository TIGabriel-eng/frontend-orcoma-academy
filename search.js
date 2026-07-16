"use strict";

/* ============================================================
   ORCOMA ACADEMY — Search Engine
   Busca via API com fallback para dados estáticos
   ============================================================ */

/* ---------- DADOS FALLBACK (offline) ---------- */

const SEARCH_DATA_FALLBACK = {
  cursos: [
    { id: "reforma-tributaria",          titulo: "Reforma Tributária",          descricao: "Módulos sobre a nova reforma tributária, impactos e adequações.",                        url: "../cursos/reforma-tributaria.html",          academy: "contabil" },
    { id: "atualizacoes-contabeis",      titulo: "Atualizações Contábeis",      descricao: "Mudanças nas normas contábeis, IFRS, CPC e legislação.",                                   url: "../cursos/atualizacoes-contabeis.html",      academy: "contabil" },
    { id: "gestao-financeira",           titulo: "Gestão Financeira",           descricao: "Fluxo de caixa, DRE, indicadores financeiros e planejamento.",                             url: "../cursos/gestao-financeira.html",           academy: "empresarial" },
    { id: "gestao-de-pessoas",           titulo: "Gestão de Pessoas",           descricao: "Liderança, recrutamento, avaliação de desempenho e clima organizacional.",                 url: "../cursos/gestao-de-pessoas.html",           academy: "empresarial" },
    { id: "planejamento-estrategico",    titulo: "Planejamento Estratégico",    descricao: "Missão, visão, valores, análise SWOT, BSC e execução estratégica.",                        url: "../cursos/planejamento-estrategico.html",    academy: "empresarial" },
    { id: "atendimento-ao-cliente",      titulo: "Atendimento ao Cliente",      descricao: "Técnicas de comunicação, CRM, pós-venda e experiência do cliente.",                       url: "../cursos/atendimento-ao-cliente.html",      academy: "orcoma" },
    { id: "processos-internos",          titulo: "Processos Internos",          descricao: "Mapeamento, BPMN, automatização e melhoria contínua de processos.",                       url: "../cursos/processos-internos.html",          academy: "orcoma" },
    { id: "introducao-contabilidade",    titulo: "Introdução à Contabilidade",  descricao: "Princípios contábeis, escrituração, balanço patrimonial e DRE.",                           url: "../cursos/introducao-contabilidade.html",    academy: "contabil" },
    { id: "lgpd-contadores",             titulo: "LGPD para Contadores",        descricao: "Adequação de escritórios à Lei Geral de Proteção de Dados.",                              url: "../cursos/lgpd-contadores.html",             academy: "contabil" },
    { id: "sped-fiscal",                 titulo: "SPED Fiscal",                 descricao: "SPED Fiscal, EFD-Reinf, DCTFWeb e demais obrigações acessórias.",                          url: "../cursos/sped-fiscal.html",                 academy: "contabil" },
    { id: "treinamentos-internos",       titulo: "Treinamentos Internos",       descricao: "Capacitação interna da equipe Orcoma: processos, ferramentas e cultura.",                  url: "../cursos/treinamentos-internos.html",       academy: "orcomakers" },
    { id: "processos-orcoma",            titulo: "Processos da Orcoma",         descricao: "Entenda o funcionamento interno, fluxos e sistemas utilizados na Orcoma.",                 url: "../cursos/processos-orcoma.html",            academy: "orcomakers" },
  ],
  trilhas: [
    { id: "contabilidade-completa",     titulo: "Contabilidade Completa",       descricao: "Do básico ao avançado: balanços, DRE, tributos e muito mais.",                             url: "../trilhasdeaprendizagem/index.html",        cursos: 8 },
    { id: "sped-obrigacoes",            titulo: "SPED & Obrigações Acessórias", descricao: "Domine SPED Fiscal, SPED Contábil, EFD-Reinf e DCTFWeb.",                                 url: "../trilhasdeaprendizagem/index.html",        cursos: 7 },
    { id: "gestao-empresarial",         titulo: "Gestão Empresarial",           descricao: "Planejamento estratégico, liderança, gestão de pessoas e processos.",                      url: "../trilhasdeaprendizagem/index.html",        cursos: 6 },
    { id: "lgpd-compliance",            titulo: "LGPD & Compliance",            descricao: "Entenda a Lei Geral de Proteção de Dados e adequação de escritórios.",                     url: "../trilhasdeaprendizagem/index.html",        cursos: 5 },
  ],
};

let SEARCH_DATA = SEARCH_DATA_FALLBACK;

/* ---------- UI ---------- */

let searchDropdown = null;

function createSearchDropdown() {
  if (searchDropdown) return searchDropdown;

  searchDropdown = document.createElement("div");
  searchDropdown.className = "search-dropdown";
  searchDropdown.style.display = "none";
  document.body.appendChild(searchDropdown);

  return searchDropdown;
}

function renderSearchResults(results, query) {
  const dropdown = createSearchDropdown();
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  if (results.length === 0) {
    dropdown.innerHTML = `<div class="search-dropdown__empty">Nenhum resultado para "<strong>${escapeHtml(query)}</strong>"</div>`;
    dropdown.style.display = "block";
    positionDropdown(searchInput, dropdown);
    return;
  }

  let html = "";

  const cursos = results.filter(r => r.tipo === "curso");
  if (cursos.length > 0) {
    html += `<div class="search-dropdown__group-label">Cursos</div>`;
    cursos.forEach(curso => {
      html += `
        <a href="${curso.url}" class="search-dropdown__item">
          <i class="fa-solid fa-graduation-cap"></i>
          <div class="search-dropdown__item-content">
            <span class="search-dropdown__item-title">${highlightMatch(curso.titulo, query)}</span>
            <span class="search-dropdown__item-desc">${curso.descricao || ''}</span>
          </div>
        </a>`;
    });
  }

  const modulos = results.filter(r => r.tipo === "modulo");
  if (modulos.length > 0) {
    html += `<div class="search-dropdown__group-label">Módulos</div>`;
    modulos.forEach(mod => {
      html += `
        <a href="${mod.url}" class="search-dropdown__item">
          <i class="fa-solid fa-layer-group"></i>
          <div class="search-dropdown__item-content">
            <span class="search-dropdown__item-title">${highlightMatch(mod.titulo, query)}</span>
            <span class="search-dropdown__item-desc">${mod.descricao || ''}</span>
          </div>
        </a>`;
    });
  }

  const materiais = results.filter(r => r.tipo === "material");
  if (materiais.length > 0) {
    html += `<div class="search-dropdown__group-label">Materiais</div>`;
    materiais.forEach(mat => {
      html += `
        <a href="${mat.url}" class="search-dropdown__item">
          <i class="fa-solid fa-file-lines"></i>
          <div class="search-dropdown__item-content">
            <span class="search-dropdown__item-title">${highlightMatch(mat.titulo, query)}</span>
            <span class="search-dropdown__item-desc">${mat.descricao || ''}</span>
          </div>
        </a>`;
    });
  }

  const trilhas = results.filter(r => r.tipo === "trilha");
  if (trilhas.length > 0) {
    html += `<div class="search-dropdown__group-label">Trilhas de Aprendizagem</div>`;
    trilhas.forEach(trilha => {
      html += `
        <a href="${trilha.url}" class="search-dropdown__item">
          <i class="fa-solid fa-route"></i>
          <div class="search-dropdown__item-content">
            <span class="search-dropdown__item-title">${highlightMatch(trilha.titulo, query)}</span>
            <span class="search-dropdown__item-desc">${trilha.descricao || ''} &middot; ${trilha.cursos || ''} cursos</span>
          </div>
        </a>`;
    });
  }

  dropdown.innerHTML = html;
  dropdown.style.display = "block";
  positionDropdown(searchInput, dropdown);
}

function positionDropdown(input, dropdown) {
  const rect = input.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + 6) + "px";
  dropdown.style.left = rect.left + "px";
  dropdown.style.width = Math.max(rect.width, 300) + "px";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const words = query.trim().split(/\s+/).filter(Boolean);
  let result = escaped;
  words.forEach(word => {
    const regex = new RegExp("(" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    result = result.replace(regex, "<strong class='search-highlight'>$1</strong>");
  });
  return result;
}

/* ---------- ENGINE ---------- */

let searchCache = null;
let searchCacheQuery = '';
let searchCacheTimeout = null;

function searchPlatformLocal(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  function match(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    return words.every(w => t.includes(w));
  }

  const results = [];

  SEARCH_DATA.cursos.forEach(curso => {
    if (match(curso.titulo) || match(curso.descricao) || match(curso.academy)) {
      results.push({ ...curso, tipo: "curso" });
    }
  });

  SEARCH_DATA.trilhas.forEach(trilha => {
    if (match(trilha.titulo) || match(trilha.descricao)) {
      results.push({ ...trilha, tipo: "trilha" });
    }
  });

  return results;
}

function searchPlatformAPI(query) {
  return new Promise(function(resolve) {
    if (!query || query.trim().length < 2) {
      resolve([]);
      return;
    }

    if (typeof API === 'undefined' || typeof auth === 'undefined' || !auth.getAccessToken()) {
      resolve(searchPlatformLocal(query));
      return;
    }

    if (searchCacheQuery === query && searchCache) {
      resolve(searchCache);
      return;
    }

    if (searchCacheTimeout) {
      clearTimeout(searchCacheTimeout);
    }

    searchCacheTimeout = setTimeout(function() {
      API.get('/api/busca/?q=' + encodeURIComponent(query)).then(function(data) {
        var results = [];

        if (data.cursos) {
          data.cursos.forEach(function(c) {
            results.push({
              id: c.slug || c.id,
              titulo: c.titulo,
              descricao: c.descricao,
              url: c.url,
              tipo: 'curso'
            });
          });
        }

        if (data.modulos) {
          data.modulos.forEach(function(m) {
            results.push({
              id: 'modulo-' + m.id,
              titulo: m.titulo,
              descricao: m.curso_titulo,
              url: m.url,
              tipo: 'modulo'
            });
          });
        }

        if (data.materiais) {
          data.materiais.forEach(function(mat) {
            results.push({
              id: 'material-' + mat.id,
              titulo: mat.titulo,
              descricao: mat.curso_titulo + ' · ' + mat.modalidade.toUpperCase(),
              url: mat.url,
              tipo: 'material'
            });
          });
        }

        searchCache = results;
        searchCacheQuery = query;
        resolve(results);
      }).catch(function() {
        resolve(searchPlatformLocal(query));
      });
    }, 250);
  });
}

function searchPlatform(query) {
  return searchPlatformLocal(query);
}

/* ---------- INIT ---------- */

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const dropdown = createSearchDropdown();

  searchInput.addEventListener("input", function () {
    const query = this.value;
    if (query.trim().length < 2) {
      dropdown.style.display = "none";
      return;
    }
    searchPlatformAPI(query).then(function(results) {
      renderSearchResults(results, query);
    });
  });

  searchInput.addEventListener("focus", function () {
    if (this.value.trim().length >= 2) {
      searchPlatformAPI(this.value).then(function(results) {
        renderSearchResults(results, searchInput.value);
      });
    }
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdown.style.display = "none";
      this.blur();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const first = dropdown.querySelector(".search-dropdown__item");
      if (first) first.focus();
    }
  });

  dropdown.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const items = this.querySelectorAll(".search-dropdown__item");
      const active = document.activeElement;
      const idx = Array.from(items).indexOf(active);
      if (idx < items.length - 1) items[idx + 1].focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const items = this.querySelectorAll(".search-dropdown__item");
      const active = document.activeElement;
      const idx = Array.from(items).indexOf(active);
      if (idx > 0) items[idx - 1].focus();
      else searchInput.focus();
    }
    if (e.key === "Escape") {
      dropdown.style.display = "none";
      searchInput.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  dropdown.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
}

document.addEventListener("DOMContentLoaded", initSearch);
