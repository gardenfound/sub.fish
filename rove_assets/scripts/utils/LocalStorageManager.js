class LocalStorageManager {
    static export(key) {
        const data = localStorage.getItem(key);
        if (!data) {
            console.error(`No data found for key: ${key}`);
            return;
        }

        const isJson = LocalStorageManager.isJson(data);
        const blob = new Blob([data], { type: isJson ? 'application/json' : 'text/plain' });
        const filename = `${key}.${isJson ? 'json' : 'txt'}`;

        LocalStorageManager.downloadBlob(blob, filename);
    }

    static import(key, file) {
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result;
            const isJson = LocalStorageManager.isJson(data);
            localStorage.setItem(key, isJson ? JSON.stringify(JSON.parse(data)) : data);
            console.log(`Data imported to key "${key}"`);
        };
        reader.readAsText(file);
    }
    
    static merge(key, value) {
        const existingData = localStorage.getItem(key);
        if (!existingData) {
            LocalStorageManager.set(key, value);
            return;
        }
        
        const parsedData = JSON.parse(existingData);
        const newData = Array.isArray(parsedData) && Array.isArray(value)
        ? [...parsedData, ...value]
        : { ...parsedData, ...value };
        
        localStorage.setItem(key, JSON.stringify(newData));
    }
    
    static get(key) {
        const data = localStorage.getItem(key);
        if (!data) {
            console.warn(`No data found for key: ${key}, using default values`);
            return null;
        }
        return LocalStorageManager.isJson(data) ? JSON.parse(data) : data;
    }
    
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    static isJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    static downloadBlob(blob, filename) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

export default LocalStorageManager;