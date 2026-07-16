// Dynamic Course Page Script
// Loads course data from API and renders modules/materials dynamically

(function() {
    const cursoSlug = document.documentElement.dataset.cursoSlug;
    
    if (!cursoSlug) {
        showError('Curso não especificado na URL.');
        return;
    }

    let cursoData = null;
    let modulosData = [];
    let currentVideoId = null;

    // Initialize
    async function init() {
        showLoading(true);
        try {
            await loadCursoData();
        } catch (error) {
            console.error('Error loading course:', error);
            showError(error.message || 'Erro ao carregar curso');
        }
    }

    async function loadCursoData() {
        try {
            const response = await API.get(`/api/cursos/${cursoSlug}/modulos/`);
            cursoData = response.curso;
            modulosData = response.modulos || [];

            if (!cursoData) {
                throw new Error('Curso não encontrado');
            }

            renderCourse();
            renderModules();
            
            // Load first video if available
            const firstModulo = modulosData[0];
            if (firstModulo && firstModulo.materiais && firstModulo.materiais.length > 0) {
                loadVideo(firstModulo.materiais[0], firstModulo, 0);
            }

        } catch (error) {
            if (error.status === 403) {
                throw new Error('Você não tem permissão para acessar este curso.');
            }
            if (error.status === 404) {
                throw new Error('Curso não encontrado.');
            }
            throw error;
        }
    }

    function renderCourse() {
        document.getElementById('courseTitle').textContent = cursoData.titulo || 'Curso';
        document.getElementById('courseDescription').textContent = cursoData.descricao || 'Nenhuma descrição disponível.';
        document.title = `Orcoma Academy | ${cursoData.titulo || 'Curso'}`;
    }

    function renderModules() {
        const nav = document.getElementById('modulesNav');
        nav.innerHTML = '';

        modulosData.forEach((modulo, moduloIndex) => {
            const moduleGroup = document.createElement('div');
            moduleGroup.className = 'module-group';

            const moduleLabel = document.createElement('div');
            moduleLabel.className = 'module-label';
            moduleLabel.textContent = modulo.titulo;
            moduleGroup.appendChild(moduleLabel);

            const ul = document.createElement('ul');

            // Add videos from the modulo's videos or from the course's videos
            const videos = modulo.materiais || [];
            
            videos.forEach((material, videoIndex) => {
                const li = document.createElement('li');
                li.className = 'module-item';
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                li.setAttribute('data-video-index', videoIndex);
                li.setAttribute('data-modulo-index', moduloIndex);
                
                li.innerHTML = `
                    <svg class="icon" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2" fill="none"/>
                        <path d="M6.5 5.5l4 2.5-4 2.5V5.5z"/>
                    </svg>
                    ${material.titulo}
                    <div class="check-circle" aria-label="Não concluído"></div>
                `;
                
                li.addEventListener('click', () => {
                    selectLesson(material, modulo, moduloIndex, videoIndex);
                });
                
                ul.appendChild(li);
            });

            moduleGroup.appendChild(ul);
            nav.appendChild(moduleGroup);
        });
    }

    function selectLesson(material, modulo, moduloIndex, videoIndex) {
        // Update active state
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-modulo-index="${moduloIndex}"][data-video-index="${videoIndex}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        loadVideo(material, modulo, videoIndex);
    }

    function loadVideo(material, modulo, videoIndex) {
        let videoUrl = '';
        
        if (material.url_externa) {
            // Handle YouTube URLs
            if (material.url_externa.includes('youtube.com') || material.url_externa.includes('youtu.be')) {
                const videoId = extractYouTubeId(material.url_externa);
                if (videoId) {
                    videoUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
                }
            } else if (material.url_externa.includes('vimeo.com')) {
                const videoId = extractVimeoId(material.url_externa);
                if (videoId) {
                    videoUrl = `https://player.vimeo.com/video/${videoId}`;
                }
            } else {
                videoUrl = material.url_externa;
            }
        } else if (material.arquivo_url) {
            videoUrl = material.arquivo_url;
        }

        const iframe = document.getElementById('course-video');
        iframe.src = videoUrl;

        document.getElementById('lessonTitle').textContent = material.titulo;
        document.getElementById('lessonMeta').textContent = `${modulo.titulo} · Aula ${videoIndex + 1} ·`;

        // Load materials for this module
        renderMaterials(modulo.materiais || []);

        document.getElementById('playerSection').style.display = 'block';
    }

    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?.*v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function extractVimeoId(url) {
        const regExp = /vimeo.com\/(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }

    function renderMaterials(materiais) {
        const materialsList = document.getElementById('materialsList');
        materialsList.innerHTML = '';

        if (!materiais || materiais.length === 0) {
            materialsList.innerHTML = '<p style="color: var(--text-2);">Nenhum material disponível para este módulo.</p>';
            return;
        }

        // Filter out video items (they are shown in the player, not as downloadable materials)
        const materiaisDownload = materiais.filter(function(m) {
            return m.modalidade !== 'video';
        });

        if (materiaisDownload.length === 0) {
            materialsList.innerHTML = '<p style="color: var(--text-2);">Nenhum material de apoio disponível para este módulo.</p>';
            return;
        }

        materiaisDownload.forEach(material => {
            const item = document.createElement('div');
            item.className = 'resource-item';

            const iconClass = material.modalidade === 'pdf' ? 'pdf' : 
                            material.modalidade === 'xls' || material.modalidade === 'xlsx' ? 'xls' : 'zip';
            
            const iconText = material.modalidade === 'pdf' ? 'PDF' : 
                           material.modalidade === 'xls' ? 'XLS' :
                           material.modalidade === 'xlsx' ? 'XLSX' : 'ZIP';

            item.innerHTML = `
                <div class="resource-icon ${iconClass}">${iconText}</div>
                <div class="resource-info">
                    <strong>${material.titulo}</strong>
                    <span>${getFileSize(material.arquivo_url) || ''} · ${iconText}</span>
                </div>
                ${material.arquivo_url ? `<a href="${material.arquivo_url}" class="dl-btn" target="_blank" rel="noopener" aria-label="Baixar ${material.titulo}">Baixar</a>` : 
                   material.url_externa ? `<a href="${material.url_externa}" class="dl-btn" target="_blank" rel="noopener" aria-label="Acessar ${material.titulo}">Acessar</a>` : ''}
            `;

            materialsList.appendChild(item);
        });
    }

    function getFileSize(url) {
        // Could be enhanced to get actual file size from API
        return '';
    }

    function switchTab(button, panelId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        document.getElementById(panelId).classList.add('active');
    }

    function saveNotes() {
        const notes = document.getElementById('notes-area').value;
        localStorage.setItem(`curso_notes_${cursoSlug}`, notes);
        showToast('Anotações salvas com sucesso!');
    }

    function showLoading(show) {
        document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'flex';
    }

    function showToast(message) {
        const toast = document.getElementById('lessonToast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Load saved notes on init
    function loadSavedNotes() {
        const savedNotes = localStorage.getItem(`curso_notes_${cursoSlug}`);
        if (savedNotes) {
            document.getElementById('notes-area').value = savedNotes;
        }
    }

    // Event Listeners
    document.getElementById('courseCompleteClose').addEventListener('click', () => {
        document.getElementById('courseCompleteOverlay').style.display = 'none';
    });

    document.getElementById('courseCompleteBack').addEventListener('click', () => {
        window.location.href = '../orcoma-business/index.html';
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            loadSavedNotes();
        });
    } else {
        init();
        loadSavedNotes();
    }
})();
