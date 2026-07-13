export const DB = {
    // Generic save function
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Generic get function
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    // Find a specific item
    findOne: (key, id) => {
        const items = DB.get(key);
        return items.find(i => i.id === id || i.policyId === id || i.invoiceId === id);
    }
};

// Helper for currency formatting
export const formatMoney = (val) => `$${val.toFixed(2)}`;
