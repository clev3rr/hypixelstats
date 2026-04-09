'use strict';

const API_RESPONSE_CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 5 * 60 * 1000);
const apiResponseCache = new Map();

function getCachedJson(cacheKey) {
    const cached = apiResponseCache.get(cacheKey);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        apiResponseCache.delete(cacheKey);
        return null;
    }
    return cached.payload;
}

function setCachedJson(cacheKey, payload, ttlMs = API_RESPONSE_CACHE_TTL_MS) {
    apiResponseCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + Math.max(1000, Number(ttlMs) || API_RESPONSE_CACHE_TTL_MS)
    });
}

module.exports = { getCachedJson, setCachedJson };
