import SettingsManager from './SettingsManager.js';

export default class PostRenderer {
    constructor() {
        this.settings = SettingsManager.get();
    }

    createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const mediaElement = this.createMediaElement(post);
        postElement.appendChild(mediaElement);

        const actionButtonsContainer = this.createActionButtonsContainer(post);
        postElement.appendChild(actionButtonsContainer);

        const postInfo = this.createPostInfo(post);
        actionButtonsContainer.appendChild(postInfo);

        return postElement;
    }

    createActionButtonsContainer(post) {
        const container = document.createElement('div');
        container.className = 'post-actions-container';

        const downloadBtn = this.createCopyButton(post);
        container.appendChild(downloadBtn);

        return container;
    }

    createCopyButton(post) {
        const copyBtn = document.createElement('div');
        copyBtn.className = 'action-button';
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="m20.6892 3.3123-.0406-.0419c-1.8609-1.8606-4.9086-1.8606-6.7695 0l-4.3152 4.3143c-1.8609 1.8606-1.8609 4.9077 0 6.7681l.0807.0809c.1534.1533.3189.2946.4884.4237l1.5785-1.5781c-.1857-.1089-.3593-.2381-.5167-.3954l-.0807-.0808c-1.0092-1.0089-1.0092-2.6555 0-3.6645l4.3152-4.3143c1.0092-1.0091 2.6562-1.0091 3.6653 0l.0808.0807c1.0092 1.0089 1.0092 2.6556 0 3.6645l-1.9498 1.9494c.3392.8353.5007 1.7274.4845 2.6193l3.0194-3.0189c1.8609-1.8604 1.8609-4.9075 0-6.7681zm-6.3379 6.2541c-.1533-.1534-.3188-.2946-.4884-.4237l-1.5783 1.578c.1857.1089.3592.2381.5168.3954l.0807.0808c1.0092 1.0089 1.0092 2.6556 0 3.6645l-4.3152 4.3143c-1.0092 1.009-2.6561 1.009-3.6653 0l-.0808-.0807c-1.0091-1.0089-1.0091-2.6554 0-3.6645l1.9539-1.9494c-.3392-.8353-.5007-1.7272-.4845-2.6191l-3.0194 3.0188c-1.8609 1.8606-1.8609 4.9077 0 6.7681l.0807.0807c1.8609 1.8606 4.9086 1.8606 6.7695 0l4.3152-4.3143c1.8609-1.8606 1.8609-4.9077 0-6.7682l-.0847-.0807z"/></svg>`;
        copyBtn.onclick = () => this.copyImage(post.url);

        return copyBtn;
    }

    createMediaElement(post) {
        const isVideo = post.url.match(/\.(mp4|webm)$/i);
        let mediaElement;

        if (isVideo) {
            mediaElement = document.createElement('video');
            mediaElement.src = post.url;
            mediaElement.controls = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
        } else {
            mediaElement = document.createElement('img');
            mediaElement.draggable = false;
            mediaElement.src = post.url;
            mediaElement.alt = 'Post image';
        }

        mediaElement.style.maxHeight = 'calc(100% - 80px)';
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.objectFit = 'contain';

        return mediaElement;
    }

    createPostInfo(post) {
        const postInfo = document.createElement('div');
        postInfo.className = 'post-info';
        postInfo.style.display = this.settings.showPostInfo ? 'flex' : 'none';

        const userInfo = this.createUserInfo(post);
        postInfo.appendChild(userInfo);

        if (post.tags && post.tags.length > 0) {
            const tagsContainer = this.createTags(post.tags);
            postInfo.appendChild(tagsContainer);
        }

        return postInfo;
    }

    createUserInfo(post) {
        const userInfo = document.createElement('div');
        userInfo.className = 'post-user';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.innerHTML = `<svg viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"/>
        </svg>`;

        const userTextInfo = document.createElement('div');
        userTextInfo.className = 'user-info';

        const userName = document.createElement('div');
        userName.className = 'user-name';
        userName.textContent = post.username || 'Unknown Artist';

        const uploadDate = document.createElement('div');
        uploadDate.className = 'upload-date';
        uploadDate.textContent = this.formatDate(post.date);

        userTextInfo.appendChild(userName);
        userTextInfo.appendChild(uploadDate);
        userInfo.appendChild(avatar);
        userInfo.appendChild(userTextInfo);

        return userInfo;
    }

    createTags(tags) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'post-tags';

        const visibleTags = tags.slice(0, 3);
        visibleTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'post-tag';
            tagElement.textContent = `#${tag}`;
            tagsContainer.appendChild(tagElement);
        });

        if (tags.length > 3) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'show-more-tags';
            showMoreBtn.textContent = 'Show More';
            showMoreBtn.onclick = () => this.toggleTags(tagsContainer, tags, showMoreBtn);
            tagsContainer.appendChild(showMoreBtn);
        }

        return tagsContainer;
    }

    toggleTags(tagsContainer, allTags, button) {
        if (button.textContent === 'Show More') {
            tagsContainer.innerHTML = '';

            allTags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'post-tag';
                tagElement.textContent = `#${tag}`;
                tagsContainer.appendChild(tagElement);
            });

            const showLessBtn = document.createElement('button');
            showLessBtn.className = 'show-more-tags';
            showLessBtn.textContent = 'Show Less';
            showLessBtn.onclick = () => this.toggleTags(tagsContainer, allTags, showLessBtn);
            tagsContainer.appendChild(showLessBtn);
        } else {
            tagsContainer.innerHTML = '';

            allTags.slice(0, 3).forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'post-tag';
                tagElement.textContent = `#${tag}`;
                tagsContainer.appendChild(tagElement);
            });

            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'show-more-tags';
            showMoreBtn.textContent = 'Show More';
            showMoreBtn.onclick = () => this.toggleTags(tagsContainer, allTags, showMoreBtn);
            tagsContainer.appendChild(showMoreBtn);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    async copyImage(url) {
        navigator.clipboard.writeText(url);
    }
}
