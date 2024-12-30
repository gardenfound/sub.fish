import Source from '../Source.js';
import SettingsManager from '../SettingsManager.js'; 

class CatSource extends Source {
    constructor() {
        super("https://api.thecatapi.com/v1/images/search");
        this.settings = SettingsManager.get(); 
    }

    async get() {
        const params = new URLSearchParams({
            limit: this.settings.batchSize
        });

        const response = await fetch(`${this.apiUrl}?${params}`);
        const data = await response.json();
        const mappedData =  data.map(cat => ({
            url: cat.url,
            date: this.formatDate(new Date().toISOString()),
            username: "Cats",
            tags: ["cat"]
        }));

        return mappedData.slice(0, Math.min(this.settings.batchSize, 10));
    }
}

export default CatSource;
