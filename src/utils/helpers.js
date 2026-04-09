'use strict';

function formatPetLabel(rawPetType) {
    if (!rawPetType) return 'None';
    return String(rawPetType)
        .replace(/^PET_/i, '')
        .replace(/_/g, ' ')
        .trim();
}

function titleCaseWords(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}

function normalizeKey(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function stripMinecraftFormatting(text) {
    return String(text || '')
        .replace(/§[0-9A-FK-OR]/gi, '')
        .trim();
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = {
    formatPetLabel,
    titleCaseWords,
    normalizeKey,
    stripMinecraftFormatting,
    escapeHtml
};
