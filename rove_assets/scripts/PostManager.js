import SourceManager from './utils/SourceManager.js';
import SettingsManager from './utils/SettingsManager.js';
import PostRenderer from './utils/PostRenderer.js';
import UIManager from './UIManager.js';

class PostManager {
    static instance;

    constructor() {
        if (PostManager.instance) {
            return PostManager.instance;
        }
        PostManager.instance = this;

        this.posts = [];
        this.currentPostIndex = 0;
        this.settings = SettingsManager.get();
        this.contentContainer = document.querySelector('#post-container');
        this.loading = false;
        this.uiManager = UIManager;
        this.background = document.querySelector('#background');
        this.savedPostsKey = 'savedPosts';

        this.postRenderer = new PostRenderer();

    }

    async reset() {
        this.posts = [];
        this.currentPostIndex = 0;
        await this.loadPosts();
        UIManager.updateBackgroundImage(this.posts[0]);
        UIManager.applySettings(this.settings);
    }

    async loadPosts() {
        if (this.loading) return;
        this.loading = true;
        this.uiManager.showLoadingIndicator(true);

        let newPosts;

        try {
            newPosts = await SourceManager.getPostsFromSource(this.settings.currentSource);
            this.posts.push(...newPosts);
            this.hideNoPostsPopup();
        } catch {
            this.showNoPostsPopup();
            this.loading = false;
            this.uiManager.showLoadingIndicator(false);
            return;
        }

        if (this.posts.length === 0) {
            this.showNoPostsPopup();
            console.warn('No Posts Found!');
        } else {
            this.renderPosts();
            this.hideNoPostsPopup();
        }

        this.loading = false;
        this.uiManager.showLoadingIndicator(false);

        return newPosts;
    }


    showNoPostsPopup() {
        const popup = document.querySelector('.no-posts-popup');
        popup.classList.add('active');
        this.setCatBackground();
    }

    hideNoPostsPopup(){
        const popup = document.querySelector('.no-posts-popup');
        popup.classList.remove('active');
    }

    async setCatBackground() {
        try {
            const randomCatFromSource = await SourceManager.getPostsFromSource('cat');
            const catPost = randomCatFromSource[0];
            this.uiManager.updateBackgroundImage(catPost);
        } catch (error) {
            console.error('Error fetching cat image:', error);
        }
    }

    renderPosts() {
        this.contentContainer.innerHTML = '';
        this.posts.forEach(post => {
            const postElement = this.postRenderer.createPostElement(post);
            this.contentContainer.appendChild(postElement);
        });
    }

    async scrollToPost(index) {
        if (index < 0) return null;

        if (index >= this.posts.length - 1) {
            await this.loadPosts();
        }

        this.currentPostIndex = Math.min(index, this.posts.length - 1);

        this.contentContainer.scrollTo({
            top: this.currentPostIndex * window.innerHeight,
            behavior: 'smooth'
        });

        return this.posts[this.currentPostIndex];
    }
}

export default new PostManager();
