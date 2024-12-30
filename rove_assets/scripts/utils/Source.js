class Source {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async get() {
        throw new Error("get() must be implemented by each source");
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

export default Source;