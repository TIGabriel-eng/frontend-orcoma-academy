/* ── SECURITY: DOMPurify-style text sanitization ── */
function sanitize(str) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str).trim()));
  return d.innerHTML;
}

/* ── LESSON SELECTION ── */
function selectLesson(el, title, videoUrl) {
  if (el.classList.contains('locked')) return;

  document.querySelectorAll('.module-item').forEach(function(i) {
    i.classList.remove('active');
    i.removeAttribute('aria-current');
  });
  el.classList.add('active');
  el.setAttribute('aria-current', 'true');

  document.getElementById('lesson-title').textContent = title;

  var iframe = document.getElementById('course-video');
  if (/^https:\/\/www\.youtube\.com\/embed\/[\w-]+(\?.*)?$/.test(videoUrl)) {
    iframe.src = videoUrl;
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

/* ── REVIEW FORM ── */
function toggleReview() {
  var form = document.getElementById('review-form');
  var btn = document.querySelector('.review-toggle');
  var open = form.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  form.setAttribute('aria-hidden', !open);
  if (open) document.getElementById('review-text').focus();
}

function postReview() {
  var txt = document.getElementById('review-text').value.trim();
  if (!txt) return;
  document.getElementById('review-text').value = '';
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
    sessionStorage.setItem('orcoma_notes', notes);
  } catch(e) {}
  var btn = document.querySelector('.notes-save');
  btn.textContent = 'Salvo ✓';
  setTimeout(function() { btn.textContent = 'Salvar anotações'; }, 1500);
}

(function() {
  try {
    var saved = sessionStorage.getItem('orcoma_notes');
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

/* ── TOGGLE CHECK CIRCLE ── */
document.querySelectorAll('.check-circle').forEach(function(circle) {
  circle.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('done');
    this.setAttribute('aria-label', this.classList.contains('done') ? 'Concluído' : 'Não concluído');
    updateModuleLocks();
  });
});

updateModuleLocks();
