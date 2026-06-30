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

/* Anti Copy */
document.addEventListener('copy', function (e) { e.preventDefault(); });
document.addEventListener('cut', function (e) { e.preventDefault(); });
document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
});

updateModuleLocks();

/* Streak Modal */
(function initStreakModal() {
  var overlay = document.getElementById('streakOverlay');
  if (!overlay) return;

  var closeBtn = overlay.querySelector('.close-x');
  var continueBtn = overlay.querySelector('.continue-btn');
  var streakNumEl = overlay.querySelector('.streak-number');

  function getToday() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function isYesterday(dateStr) {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return dateStr === y + '-' + m + '-' + day;
  }

  function isToday(dateStr) {
    return dateStr === getToday();
  }

  var today = getToday();
  var lastVisit = localStorage.getItem('orcoma_streak_last_visit') || '';
  var streakDay = parseInt(localStorage.getItem('orcoma_streak_day') || '0', 10);
  var day = 1;
  var newDay = false;

  if (!lastVisit) {
    day = 1;
    newDay = true;
  } else if (isYesterday(lastVisit)) {
    day = streakDay + 1;
    newDay = true;
  } else if (!isToday(lastVisit)) {
    day = 1;
    newDay = true;
  }

  if (newDay) {
    streakNumEl.textContent = day;
    localStorage.setItem('orcoma_streak_day', String(day));
    localStorage.setItem('orcoma_streak_last_visit', today);
    overlay.classList.add('show');
  }

  function hideStreak() {
    overlay.classList.remove('show');
  }

  if (closeBtn) closeBtn.addEventListener('click', hideStreak);
  if (continueBtn) continueBtn.addEventListener('click', hideStreak);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hideStreak();
  });
})();

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
