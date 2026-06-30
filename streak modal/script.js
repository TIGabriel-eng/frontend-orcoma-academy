document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('streakOverlay');
  var openBtn = document.getElementById('openBtn');
  var closeBtn = document.querySelector('.close-x');
  var continueBtn = document.querySelector('.continue-btn');

  function show() { overlay.classList.add('show'); }
  function hide() { overlay.classList.remove('show'); }

  if (openBtn) openBtn.addEventListener('click', show);
  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (continueBtn) continueBtn.addEventListener('click', hide);
});