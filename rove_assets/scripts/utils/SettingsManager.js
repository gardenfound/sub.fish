import LocalStorageManager from './LocalStorageManager.js';
import PostManager from '../PostManager.js';

class SettingsManager {
    static instance;

    constructor() {
        if (SettingsManager.instance) {
            return SettingsManager.instance;
        }
        SettingsManager.instance = this;

        this.defaultSettings = {
            sources: {
                waifu: { isNsfw: false, gif: false },
                booru: { tags: "", blacklist: "" },
            },
            batchSize: 4,
            autoscrollDelay: 3,
            showPostInfo: true,
            showBackground: true,
            theme: 'dark',
            currentSource: 'cat'
        };

        this.settingsKey = 'appSettings';
        this.settings = this.load();
        this.hooks = this.initializeHooks();

    }

    load() {
        const storedSettings = LocalStorageManager.get(this.settingsKey);
        try {
            return storedSettings ? storedSettings : { ...this.defaultSettings };
        } catch (error) {
            console.error("Failed to parse settings from localStorage. Using default settings.", error);
            return { ...this.defaultSettings };
        }
    }

    save() {
        LocalStorageManager.set(this.settingsKey, this.settings);
    }

    get(key = null) {
        if (key) { return this.settings[key]; }
        return this.settings;
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();

        if (this.hooks[key]) {
            this.hooks[key](value);
        }
    }

    reset() {
        this.settings = { ...this.defaultSettings };
        this.save();
    }

    initializeHooks() {
        return {
            showPostInfo: (value) => this.togglePostInfo(value),
            currentSource: (value) => this.changeSource(value),
            showBackground: (value) => this.toggleBackground(value),
            theme: (value) => this.changeTheme(value)
        };
    }

    togglePostInfo(value) {
        document.querySelectorAll('.post-info').forEach(element => {
            element.style.display = value ? 'flex' : 'none';
        });
    }

    changeSource(value) {
        this.settings.currentSource = value;
        this.save();
        PostManager.reset();
        document.getElementById('post-container').innerHTML = '';
        window.scrollTo(0, 1);
        this.updateSourceSettings(value);
    }

    updateSourceSettings(source) {
        const currentSourceSpan = document.getElementById('current-source');
        if (currentSourceSpan) {
            currentSourceSpan.textContent = source;
        }

        const booruSettings = document.getElementById('source-settings-booru');
        const waifuSettings = document.getElementById('source-settings-waifu');
        const noneSettings = document.getElementById('source-settings-none');

        if (source === 'rule34') {
            booruSettings.style.display = 'block';
            waifuSettings.style.display = 'none';
            noneSettings.style.display = 'none';
        } else if (source === 'waifu') {
            booruSettings.style.display = 'none';
            waifuSettings.style.display = 'block';
            noneSettings.style.display = 'none';
        } else {
            booruSettings.style.display = 'none';
            waifuSettings.style.display = 'none';
            noneSettings.style.display = 'block';
        }
    }

    setWaifuMediaType(isGif) {
        this.settings.sources.waifu.gif = isGif;
        this.save();

        const options = document.querySelectorAll('#waifu-media-type .source-option');
        options.forEach(option => option.classList.remove('active'));
        const activeOption = document.querySelector(`#waifu-media-type .source-option[data-value="${isGif}"]`);
        if (activeOption) activeOption.classList.add('active');

        this.changeSource('waifu');
    }

    setWaifuContentType(isNsfw) {
        this.settings.sources.waifu.isNsfw = isNsfw;
        this.save();

        const options = document.querySelectorAll('#waifu-content-type .source-option');
        options.forEach(option => option.classList.remove('active'));
        const activeOption = document.querySelector(`#waifu-content-type .source-option[data-value="${isNsfw}"]`);
        if (activeOption) activeOption.classList.add('active');

        this.changeSource('waifu');
    }

    finishEditingBooru(key, value) {
        if (value === this.settings.sources.booru[key]) return;

        this.settings.sources.booru[key] = value;
        this.save();

        this.changeSource('rule34');
    }

    toggleBackground(value) {
        document.getElementById('background').style.display = value ? 'flex' : 'none';
    }

    changeTheme(value) {
        document.documentElement.setAttribute('data-theme', value);
    }
}

export default new SettingsManager();
