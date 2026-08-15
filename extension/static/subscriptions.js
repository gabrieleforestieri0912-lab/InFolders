(function() {
  const btn = document.getElementById('close-subscriptions');
  if (!btn) return;
  btn.addEventListener('click', () => window.close());
})();
