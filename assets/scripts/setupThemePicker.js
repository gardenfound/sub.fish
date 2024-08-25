document.addEventListener('DOMContentLoaded', function () {
    const themeSelect = document.getElementById('theme-select');

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.documentElement.className = savedTheme;
        if(themeSelect){
            themeSelect.value = savedTheme;
        }
    }

    if(themeSelect){
        themeSelect.addEventListener('change', function () {
            const selectedTheme = themeSelect.value;
            document.documentElement.className = selectedTheme;
            localStorage.setItem('selectedTheme', selectedTheme);
        });
    }
});