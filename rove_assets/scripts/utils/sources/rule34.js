import Source from '../Source.js';
import SettingsManager from '../SettingsManager.js';

class Rule34Source extends Source {
    constructor() {
        super("https://api.rule34.xxx/index.php");
        this.settings = SettingsManager.get();
    }

    async get() {
        const page = Math.floor(Math.random() * 5000) + 1;
        let tags = this.settings.sources.booru.tags ? this.settings.sources.booru.tags.split(' ').join('+') : '';
        if (this.settings.sources.booru.blacklist) {
            const blacklist = this.settings.sources.booru.blacklist.split(' ')
            const mappedBlacklist = blacklist.map(tag => `-${tag}`)
            const completedBlacklist = mappedBlacklist.join('+');
            tags += `+${completedBlacklist}`;
        }
        
        console.log(this.settings.sources.booru.tags);

        const params = `page=dapi&s=post&q=index&json=1&limit=${this.settings.batchSize}&pid=${page}&tags=${tags}`;
        const url = `${this.apiUrl}?${params}`;

        const response = await fetch(url);
        const data = await response.json();
        return data.map(post => ({
            url: post.file_url || post.video_url,
            date: this.formatDate(new Date(post.change * 1000).toISOString()),
            username: post.owner || "Unknown Artist",
            tags: post.tags.split(' ')
        }));
    }
}

export default Rule34Source;
