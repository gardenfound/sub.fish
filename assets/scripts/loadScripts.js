document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    const scriptsGrid = document.getElementById('scriptsGrid');
    const searchBar = document.getElementById('searchBar');
    const scriptAmount = document.getElementById('scriptAmount');
    const searchScope = document.getElementById('searchScope');
    const filterEmptyScripts = document.getElementById('filterEmptyScripts');
    const scriptLength = document.getElementById('scriptLength');
    const sortBy = document.getElementById('sortBy');

    fetch('assets/data/scripts.json')
        .then(response => response.json())
        .then(data => {
            function renderScripts(scripts) {
                scriptsGrid.innerHTML = '';
                scripts.forEach(script => {
                    const button = document.createElement('button');
                    const title = document.createElement('span');
                    const description = document.createElement('span');

                    title.textContent = script.name;
                    title.style.fontSize = '20px';
                    title.style.fontWeight = 'bold';
                    title.style.fontFamily = '"Ubuntu Mono", monospace';
                    description.textContent = script.description;
                    description.style.fontFamily = '"Ubuntu Mono", monospace';
                    description.style.fontSize = '12px';
                    description.style.color = '#aaa';

                    button.appendChild(title);
                    button.appendChild(document.createElement('br'));
                    button.appendChild(description);

                    if (script.script === "") {
                        button.style.opacity = 0.35;
                        button.style.filter = "blur(1.2px)";
                    }

                    button.addEventListener('click', () => {
                        document.getElementById('scriptName').textContent = script.name;
                        document.getElementById('scriptDescription').textContent = script.description;
                        document.getElementById('scriptCode').textContent = script.script;
                        document.getElementById('copyButton').style.display = script.script == "" ? "none" : "block";
                        modal.style.display = "flex";
                    });

                    scriptsGrid.appendChild(button);
                });

                scriptAmount.textContent = `${scripts.length} script${scripts.length !== 1 ? 's' : ''} found`;
            }

            function getWordCount(text) {
                return text.trim().split(/\s+/).length;
            }

            function filterAndSortScripts() {
                const searchValue = searchBar.value.toLowerCase();
                let filteredScripts = data.scripts.filter(script => {
                    const searchInTitle = script.name.toLowerCase().includes(searchValue);
                    const searchInDescription = script.description.toLowerCase().includes(searchValue);
                    const searchInScript = script.script.toLowerCase().includes(searchValue);
                    const searchScopeValue = searchScope.value;
                    const matchSearch = searchScopeValue === 'title' ? searchInTitle :
                        searchScopeValue === 'titleAndDescription' ? (searchInTitle || searchInDescription) :
                        (searchInTitle || searchInDescription || searchInScript);
                    const matchEmptyFilter = !filterEmptyScripts.checked || script.script !== "";
                    const wordCount = getWordCount(script.script);
                    const matchLength = scriptLength.value === 'all' ||
                        (scriptLength.value === 'short' && wordCount < 100) ||
                        (scriptLength.value === 'medium' && wordCount >= 100 && wordCount <= 250) ||
                        (scriptLength.value === 'long' && wordCount > 250);
                    return matchSearch && matchEmptyFilter && matchLength;
                });

                if (sortBy.value === 'length') {
                    filteredScripts.sort((a, b) => getWordCount(b.script) - getWordCount(a.script));
                } else if (sortBy.value === 'alphabetical') {
                    filteredScripts.sort((a, b) => a.name.localeCompare(b.name));
                }

                renderScripts(filteredScripts);
            }

            searchBar.addEventListener('keyup', filterAndSortScripts);
            searchScope.addEventListener('change', filterAndSortScripts);
            filterEmptyScripts.addEventListener('change', filterAndSortScripts);
            scriptLength.addEventListener('change', filterAndSortScripts);
            sortBy.addEventListener('change', filterAndSortScripts);

            renderScripts(data.scripts);
        });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('copyButton').addEventListener('click', () => {
        const scriptCode = document.getElementById('scriptCode');
        const range = document.createRange();
        range.selectNode(scriptCode);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        showNotification();
        window.getSelection().removeAllRanges();
    });
});
