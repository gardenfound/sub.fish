import Source from '../Source.js';
import SettingsManager from '../SettingsManager.js';

class WaifuSource extends Source {
    constructor() {
        super("https://api.waifu.im/search");
        this.settings = SettingsManager.get();
    }

    async get() {
        const params = new URLSearchParams({
            is_nsfw: this.settings.sources.waifu.isNsfw,
            gif: this.settings.sources.waifu.gif,
            many: true,
            limit: this.settings.batchSize
        });

        const response = await fetch(`${this.apiUrl}?${params}`);
        const data = await response.json();

        return data.images.map(image => ({
            url: image.url,
            date: this.formatDate(image.uploaded_at),
            username: image.artist?.name || "Unknown Artist",
            tags: image.tags.map(tag => tag.name)
        }));
    }
}

export default WaifuSource;
