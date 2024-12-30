import PostManager from "./PostManager.js";
import UIManager from "./UIManager.js";

class InputManager {
    static instance;

    constructor() {
        if (InputManager.instance) {
            return InputManager.instance;
        }
        InputManager.instance = this;

        this.startY = 0;
        this.isTouchScrolling = false;
        this.startDragY = 0;
        this.isDragging = false;

        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.touchStartHandler = this.touchStartHandler.bind(this);
        this.touchMoveHandler = this.touchMoveHandler.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener("wheel", this.handleWheel, { passive: false });
        PostManager.contentContainer.addEventListener("touchstart", this.touchStartHandler, { passive: true });
        PostManager.contentContainer.addEventListener("touchmove", this.touchMoveHandler, { passive: false });
        PostManager.contentContainer.addEventListener("touchend", () => this.isTouchScrolling = false);

        PostManager.contentContainer.addEventListener("mousedown", this.mouseDownHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        document.addEventListener("mousemove", (event) => this.mouseMoveHandler(event));

        document.addEventListener("keydown", (event) => this.handleKeydown(event));
    }

    async handleWheel(event) {
        event.preventDefault();
        if (this.isScrolling) return;

        const direction = event.deltaY > 0 ? 1 : -1;
        await this.changePost(direction);
    }

    async handleKeydown(event) {
        if (this.isScrolling) return;

        if (event.key === 'ArrowUp') {
            await this.changePost(-1);
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            await this.changePost(1);
            event.preventDefault();
        }
    }

    touchStartHandler(event) {
        this.startY = event.touches[0].clientY;
        this.isTouchScrolling = true;
    }

    async touchMoveHandler(event) {
        if (!this.isTouchScrolling || this.isScrolling) return;

        const currentY = event.touches[0].clientY;
        const deltaY = this.startY - currentY;

        if (Math.abs(deltaY) > 50) {
            const direction = deltaY > 0 ? 1 : -1;
            await this.changePost(direction);
            this.isTouchScrolling = false;
        }
    }

    mouseDownHandler(event) {
        this.startDragY = event.clientY;
        this.isDragging = true;
        PostManager.contentContainer.style.cursor = 'grabbing';
    }

    async mouseMoveHandler(event) {
        if (!this.isDragging || this.isScrolling) return;

        const deltaY = this.startDragY - event.clientY;

        if (Math.abs(deltaY) > 50) {
            const direction = deltaY > 0 ? 1 : -1;
            await this.changePost(direction);
            this.isDragging = false;
            PostManager.contentContainer.style.cursor = 'grab';
        }
    }

    mouseUpHandler() {
        this.isDragging = false;
        PostManager.contentContainer.style.cursor = 'grab';
    }

    async changePost(direction) {
        this.isScrolling = true;
        const post = await PostManager.scrollToPost(PostManager.currentPostIndex + direction);

        if (post) {
            UIManager.updateBackgroundImage(post)
        }

        setTimeout(() => {
            this.isScrolling = false;
        }, 500);
    }
}

export default new InputManager();