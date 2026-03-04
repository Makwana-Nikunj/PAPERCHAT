// In-memory cache with TTL — free Redis alternative
// Usage: cache.get(key), cache.set(key, value, ttlMs), cache.del(key)

const store = new Map();

const cache = {
    get(key) {
        const entry = store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            store.delete(key);
            return null;
        }
        return entry.value;
    },

    set(key, value, ttlMs = 5 * 60 * 1000) {
        store.set(key, {
            value,
            expiry: Date.now() + ttlMs
        });
    },

    del(key) {
        store.delete(key);
    },

    // Delete all keys matching a prefix
    invalidate(prefix) {
        for (const key of store.keys()) {
            if (key.startsWith(prefix)) store.delete(key);
        }
    },

    clear() {
        store.clear();
    },

    size() {
        return store.size;
    }
};

// Cleanup expired entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.expiry) store.delete(key);
    }
}, 10 * 60 * 1000);

export default cache;
