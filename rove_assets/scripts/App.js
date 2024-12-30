import PostManager from './PostManager.js';
import InputManager from './InputManager.js';
import SourceManager from './utils/SourceManager.js';
import UIManager from './UIManager.js';

class App {
    constructor() {
        this.loadingIndicator = document.querySelector('#loading');
        this.background = document.querySelector('#background');
        this.init();
    }

    async init() {
        await SourceManager.loadSources();
        await PostManager.loadPosts();
        InputManager.setupEventListeners();
        UIManager.updateBackgroundImage(PostManager.posts[PostManager.currentPostIndex]);

        const introCutscene = document.getElementById('intro-cutscene');
        setTimeout(() => {
            introCutscene.remove();
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});