const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const zlib = require('zlib');

// NodeCache configuration
const cache = new NodeCache({
    stdTTL: 3600, // Default time-to-live (1 hour)
    checkperiod: 120 // Time interval in seconds to check for expired keys
});

const CACHE_PREFIX = 'mongoose-cache:';

// Compress data before caching
async function setToCache(key, value, ttl) {
    const compressedData = zlib.gzipSync(JSON.stringify(value));  // Compressing the data
    cache.set(CACHE_PREFIX + key, compressedData, ttl);
}

// Decompress data after retrieving from cache
async function getFromCache(key) {
    const compressedData = cache.get(CACHE_PREFIX + key);
    if (!compressedData) return null;
    const data = zlib.gunzipSync(compressedData).toString();  // Decompressing the data
    return JSON.parse(data);
}

async function clearCache(key) {
    cache.del(CACHE_PREFIX + key);
}

// Middleware to apply caching to queries
function applyCacheToQueries(schema) {
    // Pre-find middleware
    schema.pre(/^find/, async function (next) {
        const cacheKey = JSON.stringify(this.getQuery());
        const cachedData = await getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Returning cached (compressed) data');
            this._cachedResult = cachedData;
            return next();
        }
        next();
    });

    // Post-find middleware to save the result in NodeCache with compression
    schema.post(/^find/, async function (docs) {
        if (!this._cachedResult) {
            if (docs && docs.length > 0) { // Skip caching if result is empty
                const cacheKey = JSON.stringify(this.getQuery());
                await setToCache(cacheKey, docs);
                console.log('Query result cached with compression');
            } else {
                console.log('Empty query result, skipping cache');
            }
        }
    });

    // Cache clearing on save, create, delete, and update actions
    schema.post('save', function () {
        const cacheKey = JSON.stringify(this._id);
        clearCache(cacheKey);
        console.log('Cache cleared for key:', cacheKey);
    });

    schema.post('create', function () {
        const cacheKey = JSON.stringify(this._id);
        clearCache(cacheKey);
        console.log('Cache cleared for key:', cacheKey);
    });

    schema.post(/^delete/, function () {
        const cacheKey = JSON.stringify(this.getQuery());
        clearCache(cacheKey);
        console.log('Cache cleared for key:', cacheKey);
    });

    schema.post(/^update/, function () {
        const cacheKey = JSON.stringify(this.getQuery());
        clearCache(cacheKey);
        console.log('Cache cleared for key:', cacheKey);
    });
    
    // Aggregate caching with compression
    schema.pre('aggregate', async function (next) {
        const cacheKey = JSON.stringify(this.pipeline());
        const cachedData = await getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Returning cached (compressed) aggregate data');
            this._cachedResult = cachedData;
            return next();
        }
        next();
    });

    schema.post('aggregate', async function (docs) {
        if (!this._cachedResult) {
            if (docs && docs.length > 0) { // Skip caching if result is empty
                const cacheKey = JSON.stringify(this.pipeline());
                await setToCache(cacheKey, docs);
                console.log('Aggregate result cached with compression');
            } else {
                console.log('Empty aggregate result, skipping cache');
            }
        }
    });
}

// Log cached data for debugging
async function logCachedData() {
    const keys = cache.keys();
    keys.forEach(key => {
        const value = cache.get(key);
        console.log(`Key: ${key}, Value: ${value}`);
    });
}

module.exports = {
    applyCacheToQueries,
    logCachedData,
    clearCache
};
