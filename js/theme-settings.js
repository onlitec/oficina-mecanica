(function(){
  document.addEventListener('DOMContentLoaded', function() {
    const themeInput = document.getElementById('themeUrl');
    const installBtn = document.getElementById('installThemeBtn');
    if (!themeInput || !installBtn) return;

    // Prepopulate with current theme URL
    const current = window.ThemeManager.getTheme();
    if (current) {
      themeInput.value = current;
    }

    installBtn.addEventListener('click', function() {
      const url = themeInput.value.trim();
      if (!url) {
        alert('Por favor, informe uma URL de tema válida.');
        return;
      }
      window.ThemeManager.installTheme(url);
      alert('Tema instalado com sucesso! URL: ' + url);
    });
  });
})();
