import PostManager from "./PostManager.js";
import SettingsManager from "./utils/SettingsManager.js";

class UIManager {
    static instance;

    constructor() {
        if (UIManager.instance) {
            return UIManager.instance;
        }
        UIManager.instance = this;

        this.loadingIndicator = document.querySelector('#loading');
        this.background = document.querySelector('#background');
        this.autoScrollInterval = null;
        this.settings = SettingsManager.get();
        this.lastZoomLevel = window.devicePixelRatio;
        this.zoomThrottle = null;
        this.checkForZoom = this.checkForZoom.bind(this);

        this.setupEventListeners();
        this.initializeSettings();
        this.bindInputs();
        this.bindWaifuButtons();
        this.initSourceSettings();
    }

    bindInputs() {
        const booruTagsInput = document.getElementById('booru-tags');
        const booruBlacklistInput = document.getElementById('booru-blacklist');

        if (booruTagsInput) {
            booruTagsInput.addEventListener('blur', (e) => {
                SettingsManager.finishEditingBooru('tags', e.target.value);
            });
        }

        if (booruBlacklistInput) {
            booruBlacklistInput.addEventListener('blur', (e) => {
                SettingsManager.finishEditingBooru('blacklist', e.target.value);
            });
        }
    }

    bindWaifuButtons() {
        const waifuMediaTypeOptions = document.querySelectorAll('#waifu-media-type .source-option');
        waifuMediaTypeOptions.forEach((option) => {
            option.addEventListener('click', () => {
                const isGif = option.getAttribute('data-value') === 'true';
                SettingsManager.setWaifuMediaType(isGif);
            });
        });

        const waifuContentTypeOptions = document.querySelectorAll('#waifu-content-type .source-option');
        waifuContentTypeOptions.forEach((option) => {
            option.addEventListener('click', () => {
                const isNsfw = option.getAttribute('data-value') === 'true';
                SettingsManager.setWaifuContentType(isNsfw);
            });
        });
    }

    initSourceSettings() {
        const booruTagsInput = document.getElementById('booru-tags');
        const booruBlacklistInput = document.getElementById('booru-blacklist');
        const booruSettings = SettingsManager.get('sources').booru;

        if (booruTagsInput) {
            booruTagsInput.value = booruSettings.tags || '';
        }

        if (booruBlacklistInput) {
            booruBlacklistInput.value = booruSettings.blacklist || '';
        }

        const waifuMediaTypeOptions = document.querySelectorAll('#waifu-media-type .source-option');
        const waifuSettings = SettingsManager.get('sources').waifu;

        waifuMediaTypeOptions.forEach((option) => {
            const isGif = option.getAttribute('data-value') === 'true';
            if (isGif === waifuSettings.gif) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        const waifuContentTypeOptions = document.querySelectorAll('#waifu-content-type .source-option');
        waifuContentTypeOptions.forEach((option) => {
            const isNsfw = option.getAttribute('data-value') === 'true';
            if (isNsfw === waifuSettings.isNsfw) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.setting-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.classList.contains('open');
                document.querySelectorAll('.setting-content').forEach(item => item.classList.remove('open'));
                document.querySelectorAll('.setting-toggle').forEach(toggle => toggle.textContent = '+');

                if (!isOpen) {
                    content.classList.add('open');
                    header.querySelector('.setting-toggle').textContent = '−';
                }
            });
        });

        document.getElementById('action-button-settings').addEventListener('click', () => {
            this.toggleMenu('settings-menu');
        });
        
        document.getElementById('switchToCatsBtn').addEventListener('click', () => {
            SettingsManager.changeSource('cat');
        });

        document.getElementById('action-button-autoscroll').addEventListener('click', () => {
            this.toggleAutoscroll();
        });

        document.addEventListener('click', this.onClickOutsideMenu.bind(this));

        document.getElementById('autoscroll-delay').addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            SettingsManager.set('autoscrollDelay', value);
        });

        document.getElementById('batch-size').addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            SettingsManager.set('batchSize', value);
        });

        window.addEventListener('resize', () => {
            if (this.zoomThrottle) clearTimeout(this.zoomThrottle);
            this.zoomThrottle = setTimeout(this.checkForZoom, 2);
        });

        document.querySelectorAll('.setting-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const parent = e.target.closest('.setting-options');
                const key = parent.id.replace('-options', '');
                const value = e.target.getAttribute('data-value');

                document.querySelectorAll(`#${parent.id} .setting-option`).forEach(el => {
                    el.classList.remove('active');
                });
                e.target.classList.add('active');

                SettingsManager.set(key, value === 'true' || value === 'false' ? value === 'true' : value);
            });
        });
    }

    initializeSettings() {
        this.applySettings(SettingsManager.get());
    }

    applySettings(settings) {
        document.getElementById('autoscroll-delay').value = settings.autoscrollDelay;
        document.getElementById('batch-size').value = settings.batchSize;

        Object.keys(settings).forEach(key => {
            const optionGroup = document.getElementById(`${key}-options`);
            if (optionGroup) {
                optionGroup.querySelectorAll('.setting-option').forEach(option => {
                    const isActive = option.getAttribute('data-value') === String(settings[key]);
                    option.classList.toggle('active', isActive);
                });
            }
        });

        this.loadTheme();
        SettingsManager.updateSourceSettings(settings.currentSource);
        document.getElementById('background').style.display = settings.showBackground ? 'flex' : 'none';
    }

    onClickOutsideMenu(event) {
        document.querySelectorAll('.bottom-sheet.active').forEach(menu => {
            if (!menu.contains(event.target) && !event.target.closest('.action-button')) {
                menu.classList.remove('active');
            }
        });
    }

    showLoadingIndicator(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    loadTheme() {
        const theme = this.settings.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleAutoscroll() {
        if (this.autoScrollInterval) {
            this.stopAutoscroll();
        } else {
            this.startAutoscroll();
        }

        const autoscrollButton = document.getElementById('action-button-autoscroll');

        if (this.autoScrollInterval) {
            autoscrollButton.innerHTML = `<svg viewBox="0 0 24 24">
                <path d="M 19 3 H 5 C 4 3 3 4 3 5 V 19 C 3 20.1 3.9 21 5 21 H 19 C 20.1 21 21 20.1 21 19 V 5 C 21 3.9 20.1 3 19 3 M 12 17 L 8 13 H 11 V 7 H 13 V 13 H 16 L 12 17 Z"/>
            </svg>`;
        } else {
            autoscrollButton.innerHTML = `<svg viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2l4-4h-3V7h-2v6H8l4 4z"/>
            </svg>`;
        }
    }

    startAutoscroll() {
        if (this.autoScrollInterval) return;

        this.autoScrollInterval = setInterval(() => {
            const currentIndex = PostManager.currentPostIndex;
            const nextIndex = currentIndex + 1;

            if (this.settings.source === 'saved' && nextIndex >= PostManager.posts.length) {
                this.stopAutoscroll();
                return;
            }

            PostManager.scrollToPost(nextIndex);
            this.updateBackgroundImage(PostManager.posts[nextIndex]);
        }, this.settings.autoscrollDelay * 1000);
    }

    stopAutoscroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }

    toggleMenu(id) {
        const menu = document.getElementById(id);

        const isActive = menu.classList.contains('active');
        menu.classList.toggle('active', !isActive);

        if (!isActive) {
            document.querySelectorAll('.bottom-sheet').forEach(otherMenu => {
                if (otherMenu !== menu) {
                    otherMenu.classList.remove('active');
                }
            });
        }
    }

    updateBackgroundImage(post) {
        if (!post) return;
        const img = new Image();
        img.src = post.url;
        this.background.style.backgroundImage = `url(${post.url})`;

        img.onload = () => {
            const aspectRatio = img.height / img.width;
            this.background.style.height = `${aspectRatio * window.innerWidth}px`;
        };
    }

    onZoomChange() {
        PostManager.scrollToPost(PostManager.currentPostIndex);
    }

    checkForZoom() {
        if (window.devicePixelRatio !== this.lastZoomLevel) {
            this.lastZoomLevel = window.devicePixelRatio;
            this.onZoomChange();
        }
    }
}

export default new UIManager();
