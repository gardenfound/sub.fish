import Source from '../Source.js';
import SettingsManager from '../SettingsManager.js'; 

class NekosSource extends Source {
    constructor() {
        super("https://nekos.best/api/v2/neko");
        this.settings = SettingsManager.get(); 
    }

    async get() {
        const batchSize = this.settings.batchSize || 1;
        const requests = Array.from({ length: batchSize }, () => fetch(this.apiUrl).then(res => res.json()));
        const responses = await Promise.all(requests);

        const mappedData = responses.map(json => {
            const item = json.results[0];
            return {
                url: item.url,
                date: this.formatDate(new Date().toISOString()),
                username: item.artist_name || "Unknown Artist",
                tags: ["neko"]
            };
        });

        return mappedData;
    }
}

export default NekosSource;
