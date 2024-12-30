class SourceManager {
    static instance;
    constructor() {
        if (SourceManager.instance) {
            return SourceManager.instance;
        }
        SourceManager.instance = this;
        
        this.sources = {};

    }

    async loadSources() {
        const sourceFiles = ['cat', 'dog', 'waifu', 'nekos', 'rule34']; // names of source files without .js extension
        await Promise.all(sourceFiles.map(async (sourceName) => {
            const module = await import(`./sources/${sourceName}.js`);
            this.sources[sourceName] = module.default;
        }));
    }

    async getPostsFromSource(sourceName) {
        if (!this.sources[sourceName]) throw new Error(`Source ${sourceName} not loaded`);

        const SourceClass = this.sources[sourceName];
        const sourceInstance = new SourceClass();
        return await sourceInstance.get();
    }
}

export default new SourceManager();