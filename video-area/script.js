/* ── SECURITY: DOMPurify-style text sanitization ── */
function sanitize(str) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str).trim()));
  return d.innerHTML;
}

/* ── LOAD COURSE FROM API ── */
function getParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ── PROGRESS STATE ── */
var cursoAtualId = null;
var cursoJaConcluido = false;
var ytPlayer = null;
var vimeoPlayer = null;
var cursoAtualTitulo = '';
var watchInterval = null;
var advanceTimeout = null;
var toastTimeout = null;
var tempoAssistido = 0;
var ultimoTempoRegistrado = 0;

function slugify(str) {
  return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── LOCALSTORAGE PROGRESS ── */
function getCurrentUserKey() {
  var email = auth.getEmail() || auth.getName() || 'guest';
  return 'user_' + slugify(email);
}

function getProgressStorage() {
  try {
    return JSON.parse(localStorage.getItem('orcoma_progresso') || '{}');
  } catch (e) {
    return {};
  }
}

function getCurrentUserProgressState() {
  var data = getProgressStorage();
  if (!data.users) data.users = {};

  var userKey = getCurrentUserKey();
  if (!data.users[userKey]) {
    data.users[userKey] = { cursos: {}, ultima_atualizacao: null };
  }

  var userData = data.users[userKey];
  if (!userData.cursos) userData.cursos = {};

  return {
    rootData: data,
    userData: userData,
    userKey: userKey
  };
}

function obterProgresso(cursoId) {
  try {
    var state = getCurrentUserProgressState();
    return state.userData.cursos[cursoId] || state.userData.cursos['slug_' + cursoId] || null;
  } catch (e) { return null; }
}

function salvarProgressoLocalStorage(cursoId, dados) {
  try {
    var state = getCurrentUserProgressState();
    state.userData.cursos[cursoId] = dados;
    if (!cursoId.startsWith('slug_')) {
      state.userData.cursos['slug_' + cursoId] = dados;
    }
    state.userData.ultima_atualizacao = new Date().toISOString();
    state.rootData.users[state.userKey] = state.userData;
    state.rootData.cursos = state.userData.cursos;
    state.rootData.ultima_atualizacao = state.userData.ultima_atualizacao;
    localStorage.setItem('orcoma_progresso', JSON.stringify(state.rootData));
  } catch (e) {}
}

function salvarProgressoParcial(cursoId, progresso) {
  if (!cursoId || progresso <= 0 || progresso >= 100) return;
  var atual = obterProgresso(cursoId) || {};
  if (atual.concluido || (typeof atual.progresso === 'number' && progresso <= atual.progresso)) return;

  var dados = {
    concluido: false,
    progresso: progresso,
    ultima_atualizacao: new Date().toISOString()
  };
  if (atual.concluido_em) {
    dados.concluido_em = atual.concluido_em;
  }
  if (ultimoTempoRegistrado > 0) {
    dados.ultimo_segundo_assistido = Math.floor(ultimoTempoRegistrado);
  }

  salvarProgressoLocalStorage(cursoId, dados);
}

function obterTodosProgressos() {
  try {
    var state = getCurrentUserProgressState();
    return state.userData.cursos || {};
  } catch (e) { return {}; }
}

function resetVideoSession() {
  cursoJaConcluido = false;
  tempoAssistido = 0;
  ultimoTempoRegistrado = 0;
  if (watchInterval) { clearInterval(watchInterval); watchInterval = null; }
  if (advanceTimeout) { clearTimeout(advanceTimeout); advanceTimeout = null; }
}

function showLessonToast(message, duration) {
  var toast = document.getElementById('lessonToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  if (toastTimeout) { clearTimeout(toastTimeout); }
  toastTimeout = setTimeout(function() {
    toast.classList.remove('visible');
  }, duration || 3500);
}

function registrarTempoAssistido(current) {
  if (current < 0) return;
  if (ultimoTempoRegistrado <= 0) {
    ultimoTempoRegistrado = current;
    return;
  }

  var delta = current - ultimoTempoRegistrado;
  if (delta > 0) {
    tempoAssistido += Math.min(delta, 3);
  }
  ultimoTempoRegistrado = current;
}

/* ── SALVAR POSIÇÃO DO VÍDEO NA API ── */
var ultimaPosicaoSalva = 0;
var POSICAO_SAVE_INTERVAL = 15;

function salvarPosicaoVideo(currentTime) {
  if (!cursoAtualId || !cursoJaPodeSalvar) return;
  if (Math.abs(currentTime - ultimaPosicaoSalva) < POSICAO_SAVE_INTERVAL) return;
  ultimaPosicaoSalva = currentTime;

  var videoId = null;
  try {
    var params = new URLSearchParams(window.location.search);
    videoId = params.get('video_id') || params.get('id');
  } catch (e) {}

  if (typeof API !== 'undefined' && typeof auth !== 'undefined' && auth.getAccessToken()) {
    API.post('/api/matriculas/salvar-posicao/', {
      curso: parseInt(cursoAtualId, 10),
      video_id: videoId ? parseInt(videoId, 10) : null,
      segundo: Math.floor(currentTime)
    }).catch(function() {});
  }
}

function retomarPosicaoVideo(player, tipo) {
  if (!cursoAtualId) return;

  if (typeof API !== 'undefined' && typeof auth !== 'undefined' && auth.getAccessToken()) {
    API.get('/api/matriculas/posicao/?curso=' + parseInt(cursoAtualId, 10)).then(function(data) {
      if (data && data.segundo > 0 && !data.concluido) {
        showResumeToast(data.segundo, player, tipo);
      }
    }).catch(function() {});
  }
}

function showResumeToast(segundos, player, tipo) {
  var toast = document.getElementById('lessonToast');
  if (!toast) return;

  var min = Math.floor(segundos / 60);
  var seg = Math.floor(segundos % 60);
  var texto = 'Retomar de ' + min + ':' + (seg < 10 ? '0' : '') + seg + '?';

  toast.innerHTML = '<span>' + texto + '</span> <button id="resumeBtn" style="margin-left:12px;padding:4px 12px;border-radius:6px;border:1px solid #fff;background:rgba(255,255,255,0.2);color:#fff;cursor:pointer;font-weight:600;">Sim</button> <button id="dismissResumeBtn" style="margin-left:6px;padding:4px 10px;border-radius:6px;border:none;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;">Não</button>';
  toast.classList.add('visible');

  var resumeBtn = document.getElementById('resumeBtn');
  var dismissBtn = document.getElementById('dismissResumeBtn');

  function doSeek() {
    toast.classList.remove('visible');
    if (tipo === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(segundos, true);
      ytPlayer.playVideo();
    } else if (tipo === 'vimeo' && vimeoPlayer && typeof vimeoPlayer.setCurrentTime === 'function') {
      vimeoPlayer.setCurrentTime(segundos).then(function() { vimeoPlayer.play(); });
    } else if (tipo === 'nativo' && player && player.tagName === 'VIDEO') {
      player.currentTime = segundos;
      player.play();
    }
  }

  if (resumeBtn) resumeBtn.addEventListener('click', doSeek);
  if (dismissBtn) dismissBtn.addEventListener('click', function() {
    toast.classList.remove('visible');
  });

  setTimeout(function() { toast.classList.remove('visible'); }, 10000);
}

var cursoJaPodeSalvar = false;

function initStaticCourse() {
  var player = document.getElementById('course-video');
  var titleEl = document.getElementById('lesson-title');
  var title = titleEl ? titleEl.textContent.trim() : 'Aula';

  cursoAtualTitulo = title;
  if (!cursoAtualId) {
    cursoAtualId = slugify(title);
  }

  if (!player) return;
  var src = player.getAttribute('src') || '';
  var isYouTube = src.indexOf('youtube.com/embed/') !== -1 || src.indexOf('youtu.be/') !== -1;
  var isVimeo = src.indexOf('player.vimeo.com/video/') !== -1 || src.indexOf('vimeo.com/') !== -1;

  if (isYouTube) {
    if (src.indexOf('enablejsapi=1') === -1) {
      src += (src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1';
      player.setAttribute('src', src);
    }
    setVideoSource(src, title);
  } else if (isVimeo) {
    setVideoSource(src, title);
  } else if (player.tagName === 'VIDEO') {
    inicializarVideoNativo();
  }
}

function carregarCurso() {
  var cursoSlug = getParam('curso');
  var cursoId = getParam('id');

  if (!cursoSlug && !cursoId) {
    initStaticCourse();
    return;
  }

  var player = document.getElementById('course-video');
  var titleEl = document.getElementById('lesson-title');
  var metaEl = document.getElementById('lesson-meta');
  var aboutEl = document.getElementById('aboutContent');
  var materialsEl = document.getElementById('materialsList');
  var modulesNav = document.getElementById('modulesNav');

  var cursoData = null;
  var modulosData = [];

  function startLoading(slug) {
    API.get('/api/cursos/' + slug + '/modulos/').then(function (response) {
    cursoData = response.curso;
    modulosData = response.modulos || [];

    if (!cursoData) {
      titleEl.textContent = 'Curso n\u00e3o encontrado';
      return;
    }

    cursoAtualId = String(cursoData.id);
    cursoAtualTitulo = cursoData.titulo;

    document.title = cursoData.titulo + ' | Orcoma Academy';
    document.getElementById('sidebarCourseTitle').textContent = cursoData.titulo;

    if (aboutEl) {
      var html =
        '<p style="color:var(--text-2);font-size:.84rem;line-height:1.7;max-width:600px;">' +
          (cursoData.descricao || 'Nenhuma descri\u00e7\u00e3o dispon\u00edvel.') +
        '</p>';

      modulosData.forEach(function(m) {
        if (m.descricao) {
          html += '<h4 style="color:var(--text-1);font-size:.82rem;margin:16px 0 4px;">' + m.titulo + '</h4>' +
              '<p style="color:var(--text-2);font-size:.82rem;line-height:1.6;margin:0;">' + m.descricao + '</p>';
        }
      });

      html += '<p style="color:var(--text-3);font-size:.76rem;margin-top:12px;">' +
          'Tipo: ' + (cursoData.tipo === 'video' ? 'V\u00eddeo' : 'Curso') +
          ' \u00b7 Status: ' + cursoData.status +
        '</p>';

      aboutEl.innerHTML = html;
    }

    renderizarModulos();

    var primeiraAula = null;
    for (var m = 0; m < modulosData.length; m++) {
      var aulas = modulosData[m].materiais || [];
      for (var a = 0; a < aulas.length; a++) {
        if (aulas[a].url_externa || aulas[a].arquivo_url) {
          primeiraAula = { material: aulas[a], moduloIdx: m, aulaIdx: a };
          break;
        }
      }
      if (primeiraAula) break;
    }

    if (primeiraAula) {
      carregarVideo(primeiraAula.material, modulosData[primeiraAula.moduloIdx], primeiraAula.moduloIdx, primeiraAula.aulaIdx);
    }

    updateModuleLocks();
    verificarConclusaoAnterior();
   }).catch(function (err) {
     titleEl.textContent = 'Erro ao carregar curso';
     var errorMsg = 'Curso não encontrado ou você não tem permissão para acessá-lo.';
     if (err && err.message) {
       errorMsg = err.message;
     }
     if (metaEl) metaEl.textContent = errorMsg;
     
     // Remove loading state to prevent infinite loading
     var sidebar = document.getElementById('sidebar');
     if (sidebar) {
       sidebar.classList.remove('loading');
     }
   });
  }

  if (cursoSlug) {
    startLoading(cursoSlug);
  } else {
    API.get('/api/cursos/' + cursoId + '/').then(function (c) {
      startLoading(c.slug);
    }).catch(function () {
      titleEl.textContent = 'Erro ao carregar curso';
    });
  }

  function renderizarModulos() {
    if (!modulesNav) return;
    modulesNav.innerHTML = '';

    modulosData.forEach(function (modulo, moduloIdx) {
      var group = document.createElement('div');
      group.className = 'module-group';

      var label = document.createElement('div');
      label.className = 'module-label';
      label.textContent = modulo.titulo;
      group.appendChild(label);

      var ul = document.createElement('ul');
      var aulas = modulo.materiais || [];

      aulas.forEach(function (material, aulaIdx) {
        var li = document.createElement('li');
        li.className = 'module-item' + (moduloIdx === 0 && aulaIdx === 0 ? ' active' : '');
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        if (moduloIdx === 0 && aulaIdx === 0) {
          li.setAttribute('aria-current', 'true');
        }

        li.innerHTML =
          '<svg class="icon" viewBox="0 0 16 16" fill="currentColor">' +
            '<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2" fill="none"/>' +
            '<path d="M6.5 5.5l4 2.5-4 2.5V5.5z"/>' +
          '</svg>' +
          '<span>' + sanitize(material.titulo) + '</span>' +
          '<div class="check-circle" aria-label="N\u00e3o conclu\u00eddo"></div>';

        li.setAttribute('data-video-url', material.url_externa || material.arquivo_url || '');
        li.setAttribute('data-modulo-idx', moduloIdx);
        li.setAttribute('data-aula-idx', aulaIdx);

        li.addEventListener('click', (function (mat, mod, mi, ai) {
          return function () {
            selectLesson(this, mat.titulo, mat.url_externa || mat.arquivo_url || '');
            renderizarMateriais(mod.materiais || []);
            document.getElementById('lesson-meta').textContent = mod.titulo + ' \u00b7 Aula ' + (ai + 1);
          };
        })(material, modulo, moduloIdx, aulaIdx));

        ul.appendChild(li);
      });

      group.appendChild(ul);
      modulesNav.appendChild(group);
    });
  }

  function renderizarMateriais(aulas) {
    if (!materialsEl) return;
    materialsEl.innerHTML = '';

    var downloadables = (aulas || []).filter(function (m) {
      return m.modalidade !== 'video' && m.modalidade !== 'link';
    });

    if (downloadables.length === 0) {
      materialsEl.innerHTML = '<p style="color:var(--text-2);">Nenhum material de apoio para este m\u00f3dulo.</p>';
      return;
    }

    downloadables.forEach(function (mat) {
      var item = document.createElement('div');
      item.className = 'resource-item';

      var ext = (mat.modalidade || 'pdf').toUpperCase();
      var iconClass = ext === 'XLS' || ext === 'XLSX' ? 'xls' : ext === 'ZIP' ? 'zip' : 'pdf';

      item.innerHTML =
        '<div class="resource-icon ' + iconClass + '">' + ext + '</div>' +
        '<div class="resource-info">' +
          '<strong>' + sanitize(mat.titulo) + '</strong>' +
          '<span>' + ext + '</span>' +
        '</div>' +
        (mat.arquivo_url
          ? '<a href="' + mat.arquivo_url + '" class="dl-btn" target="_blank" rel="noopener" aria-label="Baixar ' + sanitize(mat.titulo) + '">Baixar</a>'
          : '');

      materialsEl.appendChild(item);
    });
  }

  function carregarVideo(material, modulo, moduloIdx, aulaIdx) {
    titleEl.textContent = material.titulo;
    cursoAtualTitulo = material.titulo;
    if (metaEl) {
      metaEl.textContent = modulo.titulo + ' \u00b7 Aula ' + (aulaIdx + 1);
    }

    document.querySelectorAll('.module-item').forEach(function (i) {
      i.classList.remove('active');
      i.removeAttribute('aria-current');
    });

    var allItems = modulesNav.querySelectorAll('.module-item');
    allItems.forEach(function (item) {
      if (parseInt(item.getAttribute('data-modulo-idx')) === moduloIdx &&
          parseInt(item.getAttribute('data-aula-idx')) === aulaIdx) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'true');
      }
    });

    var videoUrl = material.url_externa || material.arquivo_url || '';
    if (videoUrl) {
      setVideoSource(videoUrl, material.titulo);
    } else {
      player.outerHTML =
        '<div id="course-video" style="display:flex;align-items:center;justify-content:center;height:400px;background:#111;color:#666;font-size:1.1rem;">' +
          'Nenhum v\u00eddeo dispon\u00edvel para esta aula.' +
        '</div>';
    }

    renderizarMateriais(modulo.materiais || []);
  }
}

/* ── VIDEO INITIALIZATION: YouTube IFrame API ── */
function inicializarVideoYouTube() {
  resetVideoSession();

  var iframe = document.getElementById('course-video');
  if (!iframe) return;

  function criarYTPlayer() {
    if (!iframe || typeof YT === 'undefined' || !YT.Player) {
      setTimeout(criarYTPlayer, 300);
      return;
    }
    ytPlayer = new YT.Player('course-video', {
      events: {
        onReady: function() {
          cursoJaPodeSalvar = true;
          retomarPosicaoVideo(null, 'youtube');
        },
        onStateChange: function(event) {
          if (event.data === YT.PlayerState.ENDED) {
            marcarCursoComoConcluido();
          }
        }
      }
    });
  }

  if (typeof YT !== 'undefined' && YT.Player) {
    criarYTPlayer();
  } else {
    if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
      window.onYouTubeIframeAPIReady = criarYTPlayer;
    }
    var fallbackCheck = setInterval(function() {
      if (typeof YT !== 'undefined' && YT.Player) {
        clearInterval(fallbackCheck);
        criarYTPlayer();
      }
    }, 300);
    setTimeout(function() { clearInterval(fallbackCheck); }, 30000);
  }

  watchInterval = setInterval(function() {
    if (cursoJaConcluido) { clearInterval(watchInterval); watchInterval = null; return; }
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    try {
      var current = ytPlayer.getCurrentTime();
      var duration = ytPlayer.getDuration();
      registrarTempoAssistido(current);
      salvarPosicaoVideo(current);
      if (duration > 0) {
        var progresso = Math.min(100, Math.round((tempoAssistido / duration) * 100));
        salvarProgressoParcial(cursoAtualId, progresso);
        if (tempoAssistido / duration >= 0.95) {
          clearInterval(watchInterval);
          watchInterval = null;
          marcarCursoComoConcluido();
        }
      }
    } catch (e) {}
  }, 3000);
}

/* ── VIDEO INITIALIZATION: Vimeo ── */
function inicializarVideoVimeo() {
  resetVideoSession();

  var iframe = document.getElementById('course-video');
  if (!iframe || typeof Vimeo === 'undefined' || !Vimeo.Player) {
    setTimeout(inicializarVideoVimeo, 300);
    return;
  }

  vimeoPlayer = new Vimeo.Player(iframe);

  vimeoPlayer.on('ended', function() {
    marcarCursoComoConcluido();
  });

  vimeoPlayer.ready().then(function() {
    cursoJaPodeSalvar = true;
    retomarPosicaoVideo(null, 'vimeo');
  });

  watchInterval = setInterval(function() {
    if (cursoJaConcluido) { clearInterval(watchInterval); watchInterval = null; return; }
    if (!vimeoPlayer) return;
    vimeoPlayer.getCurrentTime().then(function(current) {
      return vimeoPlayer.getDuration().then(function(duration) {
        registrarTempoAssistido(current);
        salvarPosicaoVideo(current);
        if (duration > 0) {
          var progresso = Math.min(100, Math.round((tempoAssistido / duration) * 100));
          salvarProgressoParcial(cursoAtualId, progresso);
          if (tempoAssistido / duration >= 0.95) {
            clearInterval(watchInterval);
            watchInterval = null;
            marcarCursoComoConcluido();
          }
        }
      });
    }).catch(function() {});
  }, 3000);
}

/* ── VIDEO INITIALIZATION: HTML5 Nativo ── */
function inicializarVideoNativo() {
  resetVideoSession();

  var video = document.getElementById('course-video');
  if (!video || video.tagName !== 'VIDEO') {
    setTimeout(inicializarVideoNativo, 300);
    return;
  }

  video.addEventListener('ended', function() {
    marcarCursoComoConcluido();
  });

  video.addEventListener('loadedmetadata', function() {
    cursoJaPodeSalvar = true;
    retomarPosicaoVideo(video, 'nativo');
  });

  video.addEventListener('timeupdate', function() {
    if (cursoJaConcluido) return;
    registrarTempoAssistido(video.currentTime);
    salvarPosicaoVideo(video.currentTime);
    if (video.duration > 0) {
      var progresso = Math.min(100, Math.round((tempoAssistido / video.duration) * 100));
      salvarProgressoParcial(cursoAtualId, progresso);
      if (tempoAssistido / video.duration >= 0.95) {
        marcarCursoComoConcluido();
      }
    }
  });
}

/* ── MARCAR CURSO COMO CONCLUÍDO ── */
function marcarCursoComoConcluido() {
  if (cursoJaConcluido) return;
  if (!cursoAtualId) {
    cursoAtualId = slugify(cursoAtualTitulo || (document.getElementById('lesson-title') && document.getElementById('lesson-title').textContent) || 'video');
  }

  cursoJaConcluido = true;

  var agora = new Date().toISOString();
  var dados = {
    concluido: true,
    concluido_em: agora,
    progresso: 100
  };

  salvarProgressoLocalStorage(cursoAtualId, dados);

  atualizarInterface();
  atualizarProgresso();
  salvarConclusao();
  showLessonToast('Etapa Concluída!', 5000);
  if (advanceTimeout) { clearTimeout(advanceTimeout); }
  advanceTimeout = setTimeout(function() {
    avancarParaProximaAula();
  }, 5000);
}

function abrirCourseCompleteModal() {
  var overlay = document.getElementById('courseCompleteOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function fecharCourseCompleteModal() {
  var overlay = document.getElementById('courseCompleteOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function avancarParaProximaAula() {
  var activeItem = document.querySelector('.module-item.active');
  if (!activeItem) return;

  var items = Array.from(document.querySelectorAll('.module-item'));
  var currentIndex = items.indexOf(activeItem);
  for (var i = currentIndex + 1; i < items.length; i++) {
    if (!items[i].classList.contains('locked')) {
      items[i].click();
      return;
    }
  }

  abrirCourseCompleteModal();
}

/* ── ATUALIZAR INTERFACE ── */
function atualizarInterface() {
  var overlay = document.getElementById('cursoConcluidoOverlay');
  if (overlay) {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(function() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
    }, 3500);
    overlay.addEventListener('click', function handler() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.removeEventListener('click', handler);
    });
  }

  var activeItem = document.querySelector('.module-item.active');
  if (activeItem) {
    activeItem.classList.add('concluido-aula');
    var circle = activeItem.querySelector('.check-circle');
    if (circle) {
      circle.classList.add('done');
      circle.setAttribute('aria-label', 'Conclu\u00eddo');
    }
  }

  updateModuleLocks();
}

/* ── ATUALIZAR PROGRESSO ── */
function atualizarProgresso() {
  var progressos = obterTodosProgressos();
  var totalCursos = 0;
  var concluidos = 0;

  for (var id in progressos) {
    if (progressos.hasOwnProperty(id)) {
      totalCursos++;
      if (progressos[id].concluido) concluidos++;
    }
  }

  var percentGeral = totalCursos > 0 ? Math.round((concluidos / totalCursos) * 100) : 0;

  try {
    localStorage.setItem('orcoma_progresso_geral', String(percentGeral));
  } catch (e) {}
}

/* ── SALVAR CONCLUSÃO (preparação para API) ── */
function salvarConclusao() {
  if (!cursoAtualId) return;

  var token = null;
  try { token = auth.getAccessToken(); } catch (e) {}

  if (!token || typeof API === 'undefined') return;

  API.post('/api/matriculas/concluir/', { curso: parseInt(cursoAtualId, 10) }).catch(function() {});
}

/* ── VERIFICAR CONCLUSÃO ANTERIOR ── */
function verificarConclusaoAnterior() {
  if (!cursoAtualId) return;

  var progresso = obterProgresso(cursoAtualId);
  if (progresso && progresso.concluido) {
    cursoJaConcluido = true;
    var activeItem = document.querySelector('.module-item.active');
    if (activeItem) {
      activeItem.classList.add('concluido-aula');
      var circle = activeItem.querySelector('.check-circle');
      if (circle) {
        circle.classList.add('done');
        circle.setAttribute('aria-label', 'Conclu\u00eddo');
      }
    }
  }
}

/* ── LESSON SELECTION ── */
function setVideoSource(videoUrl, title) {
  var player = document.getElementById('course-video');
  if (!player) return;

  resetVideoSession();
  ytPlayer = null;
  vimeoPlayer = null;

  var isYouTube = videoUrl.indexOf('youtube.com') !== -1 || videoUrl.indexOf('youtu.be') !== -1;
  var isVimeo = videoUrl.indexOf('vimeo.com') !== -1;

  if (isYouTube) {
    var embedUrl = videoUrl.replace('watch?v=', 'embed/').split('&')[0];
    if (embedUrl.indexOf('youtu.be/') !== -1) {
      embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (embedUrl.indexOf('youtube.com/embed/') === -1 && embedUrl.indexOf('youtu.be/') === -1) {
      embedUrl = 'https://www.youtube.com/embed/' + embedUrl.split('/').pop().split('?')[0];
    }
    var originParam = encodeURIComponent(window.location.origin || window.location.href);
    var separator = embedUrl.indexOf('?') === -1 ? '?' : '&';
    player.outerHTML =
      '<iframe id="course-video" class="video-player-iframe" src="' + embedUrl + separator + 'rel=0&modestbranding=1&enablejsapi=1&origin=' + originParam + '" ' +
      'title="' + sanitize(title) + '" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'allowfullscreen loading="lazy"></iframe>';
    setTimeout(function() { inicializarVideoYouTube(); }, 500);
  } else if (isVimeo) {
    var vimeoId = videoUrl.split('/').pop().split('?')[0];
    player.outerHTML =
      '<iframe id="course-video" class="video-player-iframe" src="https://player.vimeo.com/video/' + vimeoId + '" ' +
      'title="' + sanitize(title) + '" ' +
      'allow="autoplay; fullscreen; picture-in-picture" ' +
      'allowfullscreen loading="lazy"></iframe>';
    setTimeout(function() { inicializarVideoVimeo(); }, 500);
  } else {
    player.outerHTML =
      '<video id="course-video" class="video-player-html5" controls preload="metadata">' +
        '<source src="' + videoUrl + '" type="video/mp4">' +
        'Seu navegador não suporta vídeo HTML5.' +
      '</video>';
    setTimeout(function() { inicializarVideoNativo(); }, 100);
  }
}

function selectLesson(el, title, videoUrl) {
  if (el.classList.contains('locked')) return;

  document.querySelectorAll('.module-item').forEach(function(i) {
    i.classList.remove('active');
    i.removeAttribute('aria-current');
  });
  el.classList.add('active');
  el.setAttribute('aria-current', 'true');

  document.getElementById('lesson-title').textContent = title;
  cursoAtualTitulo = title;
  if (!cursoAtualId) {
    cursoAtualId = slugify(title);
  }

  videoUrl = videoUrl || el.getAttribute('data-video-url') || '';
  if (videoUrl) {
    setVideoSource(videoUrl, title);
  }
}

/* ── STAR RATING ── */
var currentRating = 4;
function rate(val) {
  currentRating = val;
  var stars = document.querySelectorAll('.star');
  stars.forEach(function(s, i) {
    s.classList.toggle('lit', i < val);
  });
  document.querySelector('.rating-label').innerHTML =
    '<strong>' + val + '/5</strong>';
}

/* ── RATING DISPLAY (based on reviews) ── */
function updateRatingDisplay() {
  var cards = document.querySelectorAll('.review-card');
  var label = document.getElementById('ratingLabel');
  var displayStars = document.querySelectorAll('#starsDisplay .star');
  if (cards.length === 0) {
    displayStars.forEach(function(s) { s.classList.remove('lit'); });
    if (label) label.innerHTML = '<strong>—/5</strong>';
    return;
  }
  var total = 0;
  cards.forEach(function(card) {
    var litStars = card.querySelectorAll('.review-card__stars .star.lit');
    total += litStars.length;
  });
  var avg = total / cards.length;
  var rounded = Math.round(avg * 10) / 10;
  displayStars.forEach(function(s, i) {
    if (i < Math.round(avg)) s.classList.add('lit');
    else s.classList.remove('lit');
  });
  if (label) label.innerHTML = '<strong>' + rounded.toFixed(1) + '/5</strong>';
}

/* ── LOAD REVIEWS FROM API ── */
function carregarReviews() {
  var moduloId = getParam('modulo');
  var list = document.getElementById('reviewsList');
  if (!list) return;

  if (!moduloId) {
    list.innerHTML = '<div class="reviews-empty"><img src="../assets/images/sem-comentários.png" alt="Sem comentários" class="reviews-empty__icon" /><p>Ninguém comentou ainda!</p></div>';
    updateRatingDisplay();
    return;
  }

  API.get('/api/modulos/' + moduloId + '/avaliacoes/')
    .then(function(data) {
      var reviews = data.results || data;
      if (!reviews || reviews.length === 0) {
        list.innerHTML = '<div class="reviews-empty"><img src="../assets/images/sem-comentários.png" alt="Sem comentários" class="reviews-empty__icon" /><p>Ninguém comentou ainda!</p></div>';
        updateRatingDisplay();
        return;
      }
      list.innerHTML = '';
      reviews.forEach(function(r) {
        var starsHtml = '';
        for (var i = 1; i <= 5; i++) {
          starsHtml += '<span class="star ' + (i <= r.nota ? 'lit' : '') + '">★</span>';
        }
        var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '';
        var avatarSrc = r.usuario_avatar || '';
        var avatarHtml = avatarSrc
          ? '<img src="' + sanitize(avatarSrc) + '" alt="Avatar" class="review-card__avatar" />'
          : '<div class="review-card__avatar review-card__avatar--initial" style="background:' + corDoNome(r.usuario_nome || '?') + '">' + sanitize((r.usuario_nome || '?').charAt(0).toUpperCase()) + '</div>';
        var card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML =
          '<div class="review-card__header">' +
            avatarHtml +
            '<div class="review-card__info">' +
              '<span class="review-card__name">' + sanitize(r.usuario_nome || 'Usuário') + '</span>' +
              '<span class="review-card__date">' + dateStr + '</span>' +
            '</div>' +
            '<div class="review-card__stars">' + starsHtml + '</div>' +
          '</div>' +
          '<p class="review-card__comment">' + sanitize(r.comentario || '') + '</p>';
        list.appendChild(card);
      });
      updateRatingDisplay();
    })
    .catch(function() {
      list.innerHTML = '<div class="reviews-empty"><img src="../assets/images/sem-comentários.png" alt="Sem comentários" class="reviews-empty__icon" /><p>Ninguém comentou ainda!</p></div>';
      updateRatingDisplay();
    });
}

function corDoNome(nome) {
  var hash = 0;
  for (var i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colors = ['#f59e0b','#3b82f6','#ef4444','#10b981','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
  return colors[Math.abs(hash) % colors.length];
}

/* ── REVIEW FORM ── */
function toggleReview() {
  var reviewsTab = null;
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    if (b.getAttribute('aria-controls') === 'panel-reviews') reviewsTab = b;
  });
  if (reviewsTab) switchTab(reviewsTab, 'panel-reviews');
  setTimeout(function() {
    var textarea = document.getElementById('composer-text');
    if (textarea) textarea.focus();
  }, 100);
}

var composerRating = 0;
function setComposerRating(n) {
  composerRating = n;
  var stars = document.querySelectorAll('.review-composer__stars .star');
  stars.forEach(function(s, i) {
    if (i < n) s.classList.add('lit');
    else s.classList.remove('lit');
  });
}

function postComposerReview() {
  var txt = document.getElementById('composer-text').value.trim();
  if (!txt || composerRating === 0) return;
  var list = document.getElementById('reviewsList');
  var moduloId = getParam('modulo');
  var userName = auth.getName() || 'Usuário';
  var userAvatar = auth.getAvatar() || '';

  var reviewData = {
    modulo: moduloId ? parseInt(moduloId) : null,
    nota: composerRating,
    comentario: txt
  };

  function renderReview(r) {
    var now = new Date();
    var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : String(now.getDate()).padStart(2,'0') + '/' + String(now.getMonth()+1).padStart(2,'0') + '/' + now.getFullYear();
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      starsHtml += '<span class="star ' + (i <= (r.nota || composerRating) ? 'lit' : '') + '">★</span>';
    }
    var avatarSrc = r.usuario_avatar || userAvatar;
    var nombre = r.usuario_nome || userName;
    var avatarHtml = avatarSrc
      ? '<img src="' + sanitize(avatarSrc) + '" alt="Avatar" class="review-card__avatar" />'
      : '<div class="review-card__avatar review-card__avatar--initial" style="background:' + corDoNome(nombre) + '">' + sanitize(nombre.charAt(0).toUpperCase()) + '</div>';
    var card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML =
      '<div class="review-card__header">' +
        avatarHtml +
        '<div class="review-card__info">' +
          '<span class="review-card__name">' + sanitize(nombre) + '</span>' +
          '<span class="review-card__date">' + dateStr + '</span>' +
        '</div>' +
        '<div class="review-card__stars">' + starsHtml + '</div>' +
      '</div>' +
      '<p class="review-card__comment">' + sanitize(txt) + '</p>';
    if (list.querySelector('.reviews-empty')) list.innerHTML = '';
    list.insertBefore(card, list.firstChild);
  }

  if (moduloId) {
    API.post('/api/modulos/' + moduloId + '/avaliacoes/', reviewData)
      .then(function(data) { renderReview(data); })
      .catch(function() { renderReview({}); });
  } else {
    renderReview({});
  }

  document.getElementById('composer-text').value = '';
  composerRating = 0;
  document.querySelectorAll('.review-composer__stars .star').forEach(function(s) { s.classList.remove('lit'); });
  updateRatingDisplay();
}

function postReview() {
  toggleReview();
}

/* ── TABS ── */
function switchTab(btn, panelId) {
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  document.getElementById(panelId).classList.add('active');
}

/* ── NOTES ── */
function saveNotes() {
  var notes = document.getElementById('notes-area').value;
  try {
    localStorage.setItem('orcoma_notes', notes);
  } catch(e) {}
  var btn = document.querySelector('.notes-save');
  btn.textContent = 'Salvo \u2713';
  setTimeout(function() { btn.textContent = 'Salvar anota\u00e7\u00f5es'; }, 1500);
}

(function() {
  try {
    var saved = localStorage.getItem('orcoma_notes');
    if (saved) document.getElementById('notes-area').value = saved;
  } catch(e) {}
})();

/* ── KEYBOARD NAV for module items ── */
document.querySelectorAll('.module-item').forEach(function(item) {
  item.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!item.classList.contains('locked')) item.click();
    }
  });
});

/* ── SEQUENTIAL MODULE UNLOCK ── */
function updateModuleLocks() {
  var groups = document.querySelectorAll('.module-group');
  groups.forEach(function(group, index) {
    if (index === 0) return;
    var prevGroup = groups[index - 1];
    var prevDone = prevGroup.querySelector('.check-circle.done');
    var items = group.querySelectorAll('.module-item');
    items.forEach(function(item) {
      if (prevDone) {
        item.classList.remove('locked');
        item.removeAttribute('aria-disabled');
      } else {
        item.classList.add('locked');
        item.setAttribute('aria-disabled', 'true');
      }
    });
  });
}


updateModuleLocks();

/* ── SIDEBAR MOBILE ── */
function initSidebarMobile() {
  var sidebar = document.getElementById('sidebar');
  var menuToggleBtn = document.getElementById('menuToggle');
  var overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !menuToggleBtn || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    menuToggleBtn.classList.add('is-active');
    var icon = menuToggleBtn.querySelector('i');
    if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    menuToggleBtn.classList.remove('is-active');
    var icon = menuToggleBtn.querySelector('i');
    if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
    document.body.style.overflow = '';
  }

  menuToggleBtn.addEventListener('click', function () {
    if (sidebar.classList.contains('is-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);
}

/* ── DOM READY ── */
document.addEventListener('DOMContentLoaded', function () {
  carregarCurso();
  initSidebarMobile();
  carregarReviews();
  updateRatingDisplay();

  /* AntibCopy */
document.addEventListener('cut', function (e) { e.preventDefault(); });
var courseClose = document.getElementById('courseCompleteClose');
  var courseReview = document.getElementById('courseCompleteReview');
  var courseBack = document.getElementById('courseCompleteBack');
  var courseNext = document.getElementById('courseCompleteNext');

  if (courseClose) courseClose.addEventListener('click', fecharCourseCompleteModal);
  if (courseReview) courseReview.addEventListener('click', function () {
    fecharCourseCompleteModal();
    // mantém no mesmo vídeo para revisar
  });
  if (courseBack) courseBack.addEventListener('click', function () {
    fecharCourseCompleteModal();
    window.location.href = '../orcoma-business/index.html';
  });
  if (courseNext) courseNext.addEventListener('click', function () {
    fecharCourseCompleteModal();
    window.location.href = '../orcoma-business/index.html';
  });
});

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