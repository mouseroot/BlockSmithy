(function () {
  var saved = localStorage.getItem('blocksmithy-theme');
  if (saved) {
    document.documentElement.className = 'theme-' + saved;
  }
})();
