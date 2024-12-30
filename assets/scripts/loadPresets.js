document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modal.style.display = 'none';
    const scriptsGrid = document.getElementById('presetsGrid');
    const searchBar = document.getElementById('searchBar');
    const scriptAmount = document.getElementById('presetAmount');
    const searchScope = document.getElementById('searchScope');
    const showEmptyScripts = document.getElementById('showEmptyPresets');
    const scriptLength = document.getElementById('presetLength');
    const sortBy = document.getElementById('sortBy');
    const favoriteButton = document.getElementById('favoriteButton');
    const shareButton = document.getElementById('shareButton');
    
    const settingsMenuHeight = '160px';
    const customiseMenuHeight = '40px';
    const animText = getComputedStyle(document.body).getPropertyValue('--transition-speed');
    const animSpeed = parseFloat(animText) * 1000;
    
    let favoritePresets = JSON.parse(localStorage.getItem('favoritePresets')) || [];

    document.getElementById('settingsButton').addEventListener('click', function () {
        var settingsMenu = document.getElementById('searchSettings');
        settingsMenu.style.height = (settingsMenu.style.height === settingsMenuHeight) ? '0px' : settingsMenuHeight;
        settingsMenu.style.opacity = (settingsMenu.style.height === settingsMenuHeight) ? '1' : '0';
    });

    document.getElementById('customiseButton').addEventListener('click', function () {
        var customiseMenu = document.getElementById('customiseSettings');
        customiseMenu.style.height = (customiseMenu.style.height === customiseMenuHeight) ? '0px' : customiseMenuHeight;
        customiseMenu.style.opacity = (customiseMenu.style.height === customiseMenuHeight) ? '1' : '0';
    });

    fetch('assets/data/presets.json')
        .then(response => response.json())
        .then(data => {

            // check if its a shared link, if so open it!
            const hash = window.location.hash;
            if (hash) {
                openScriptByHash(hash);
            }
            shareButton.onclick = () => copyCurrentLink();

            function renderPresets(presets) {
                scriptsGrid.innerHTML = '';
                presets.forEach(preset => {
                    const button = document.createElement('button');
                    const title = document.createElement('span');
                    const favoriteIcon = document.createElement('img');

                    title.textContent = preset.name;
                    title.classList.add('gridButtonTitle');
                    button.classList.add('preset');

                    favoriteIcon.src = 'assets/images/icons/favorite.png';
                    favoriteIcon.classList.add('favorite-icon');
                    if (favoritePresets.includes(preset.name)) {
                        favoriteIcon.classList.add('favorited');
                    }

                    button.appendChild(title);
                    button.appendChild(document.createElement('br'));
                    button.appendChild(favoriteIcon);

                    if (preset.words === "") {
                        button.style.opacity = 0.35;
                        button.style.filter = "blur(1.2px)";
                    }

                    button.addEventListener('click', () => {
                        const kebabCaseName = preset.name.toLowerCase().replace(/\s+/g, '-');
                        history.pushState(null, '', `#${kebabCaseName}`);

                        document.getElementById('presetName').textContent = preset.name;
                        document.getElementById('presetWords').textContent = preset.words;
                        document.getElementById('copyButton').style.display = preset.words == "" ? "none" : "block";
                        favoriteButton.classList.toggle('favorited', favoritePresets.includes(preset.name));
                        favoriteButton.onclick = () => toggleFavorite(preset.name);

                        modal.style.display = "flex";
                        setTimeout(() => {
                            modal.classList.add('open');
                            modalContent.classList.add('open');
                        }, 5); // small delay otherwise the modal snaps in view for some reason???
                    });

                    scriptsGrid.appendChild(button);
                });

                scriptAmount.textContent = `${presets.length} preset${presets.length !== 1 ? 's' : ''} found`;
            }

            function getWordCount(text) {
                return text.trim().split(',').length;
            }

            document.getElementById('randomButton').addEventListener('click', function() {
                const filteredPresets = data.presets.filter(preset => {
                    const searchValue = searchBar.value.toLowerCase();
                    const searchInTitle = preset.name.toLowerCase().includes(searchValue);
                    const searchInWords = preset.words.toLowerCase().includes(searchValue);
                    const searchScopeValue = searchScope.value;
                    const matchSearch = searchScopeValue === 'title' ? searchInTitle : searchInWords;
                    const matchEmptyFilter = showEmptyScripts.checked || preset.words !== "";
                    const wordCount = getWordCount(preset.words);
                    const matchLength = presetLength.value === 'all' ||
                        (presetLength.value === 'short' && wordCount < 20) ||
                        (presetLength.value === 'medium' && wordCount >= 20 && wordCount <= 40) ||
                        (presetLength.value === 'long' && wordCount > 40);
                    return matchSearch && matchEmptyFilter && matchLength;
                });
            
                if (filteredPresets.length > 0) {
                    const randomPreset = filteredPresets[Math.floor(Math.random() * filteredPresets.length)];
            
                    document.getElementById('presetName').textContent = randomPreset.name;
                    document.getElementById('presetWords').textContent = randomPreset.words;
                    document.getElementById('copyButton').style.display = randomPreset.words == "" ? "none" : "block";
                    favoriteButton.classList.toggle('favorited', favoritePresets.includes(randomPreset.name));
                    favoriteButton.onclick = () => toggleFavorite(randomPreset.name);
            
                    modal.style.display = "flex";
                    setTimeout(() => {
                        modal.classList.add('open');
                        modalContent.classList.add('open');
                    }, 5);
                }
            });
            

            function filterAndSortScripts() {
                const searchValue = searchBar.value.toLowerCase();
                let filteredScripts = data.presets.filter(preset => {
                    const searchInTitle = preset.name.toLowerCase().includes(searchValue);
                    const searchInWords = preset.words.toLowerCase().includes(searchValue);
                    const searchScopeValue = searchScope.value;
                    const matchSearch = searchScopeValue === 'title' ? searchInTitle : searchInWords;
                    const matchEmptyFilter = showEmptyScripts.checked || preset.words !== "";
                    const wordCount = getWordCount(preset.words);
                    const matchLength = scriptLength.value === 'all' ||
                        (scriptLength.value === 'short' && wordCount < 20) ||
                        (scriptLength.value === 'medium' && wordCount >= 20 && wordCount <= 40) ||
                        (scriptLength.value === 'long' && wordCount > 40);
                    return matchSearch && matchEmptyFilter && matchLength;
                });

                if (sortBy.value === 'length') {
                    filteredScripts.sort((a, b) => getWordCount(b.words) - getWordCount(a.words));
                } else if (sortBy.value === 'alphabetical') {
                    filteredScripts.sort((a, b) => a.name.localeCompare(b.name));
                }

                // fav scripts on top
                filteredScripts.sort((a, b) => {
                    const aFavorited = favoritePresets.includes(a.name);
                    const bFavorited = favoritePresets.includes(b.name);
                    return bFavorited - aFavorited;
                });

                renderPresets(filteredScripts);
            }

            function toggleFavorite(scriptName) {
                if (favoritePresets.includes(scriptName)) {
                    favoritePresets = favoritePresets.filter(name => name !== scriptName);
                } else {
                    favoritePresets.push(scriptName);
                }
                localStorage.setItem('favoritePresets', JSON.stringify(favoritePresets));
                favoriteButton.classList.toggle('favorited', favoritePresets.includes(scriptName));
                filterAndSortScripts();
            }

            function openScriptByHash(hash) {
                const presetName = hash.slice(1).replace(/-/g, ' ');
                const preset = data.presets.find(s => s.name.toLowerCase() === presetName);

                if (preset) {
                    document.getElementById('presetName').textContent = preset.name;
                    document.getElementById('presetWords').textContent = preset.words;
                    document.getElementById('copyButton').style.display = preset.words == "" ? "none" : "block";
                    favoriteButton.classList.toggle('favorited', favoritePresets.includes(preset.name));
                    favoriteButton.onclick = () => toggleFavorite(preset.name);
            
                    modal.style.display = "flex";
                    setTimeout(() => {
                        modal.classList.add('open');
                        modalContent.classList.add('open');
                    }, 5);
                }
            }

            searchBar.addEventListener('keyup', filterAndSortScripts);
            searchScope.addEventListener('change', filterAndSortScripts);
            showEmptyScripts.addEventListener('change', filterAndSortScripts);
            scriptLength.addEventListener('change', filterAndSortScripts);
            sortBy.addEventListener('change', filterAndSortScripts);

            renderPresets(data.presets);
            filterAndSortScripts();
        });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            history.pushState(null, '', ` `);
            setTimeout(() => {
                modal.style.display = 'none';
            }, animSpeed);
            modal.classList.remove('open');
            modalContent.classList.remove('open'); 
        }
    });

    function copyCurrentLink() {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                showNotification('Link copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
            });
    }

    document.getElementById('copyButton').addEventListener('click', () => {
        const presetWords = document.getElementById('presetWords');
        const range = document.createRange();
        range.selectNode(presetWords);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        showNotification('Copied to clipboard');
        window.getSelection().removeAllRanges();
    });
});
