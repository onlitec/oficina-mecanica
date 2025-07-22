(function(){
  const defaultTheme = '/menu-final.css';
  const themeStorageKey = 'themeUrl';

  function applyTheme(url) {
    let link = document.getElementById('theme-stylesheet');
    if (!link) {
      link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  function getStoredTheme() {
    return localStorage.getItem(themeStorageKey);
  }

  function setTheme(url) {
    localStorage.setItem(themeStorageKey, url);
    applyTheme(url);
  }

  function installTheme(url) {
    setTheme(url);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const stored = getStoredTheme();
    applyTheme(stored || defaultTheme);
  });

  window.ThemeManager = {
    setTheme,
    getTheme: getStoredTheme,
    installTheme
  };
})();
