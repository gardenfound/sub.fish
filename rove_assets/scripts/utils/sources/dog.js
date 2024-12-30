import Source from '../Source.js';
import SettingsManager from '../SettingsManager.js';

class DogSource extends Source {
    constructor() {
        super("https://dog.ceo/api/breeds/image/random");
        this.settings = SettingsManager.get();
    }

    async get() {
        const promises = Array.from({ length: this.settings.batchSize }, () =>
            fetch(this.apiUrl).then(res => res.json())
        );

        const responses = await Promise.all(promises);
        const mappedData = responses.map(response => ({
            url: response.message,
            date: this.formatDate(new Date().toISOString()),
            username: "Dogs",
            tags: ["dog"]
        }));

        return mappedData.slice(0, Math.min(this.settings.batchSize, 10));
    }
}

export default DogSource;
