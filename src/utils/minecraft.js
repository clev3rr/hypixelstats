'use strict';

const { escapeHtml } = require('./helpers');

function minecraftCodeToHex(code) {
    const normalized = String(code || '').replace(/^§/i, '').toUpperCase();
    const map = {
        0: '#000000',
        1: '#0000AA',
        2: '#00AA00',
        3: '#00AAAA',
        4: '#AA0000',
        5: '#AA00AA',
        6: '#FFAA00',
        7: '#AAAAAA',
        8: '#555555',
        9: '#5555FF',
        A: '#55FF55',
        B: '#55FFFF',
        C: '#FF5555',
        D: '#FF55FF',
        E: '#FFFF55',
        F: '#FFFFFF'
    };
    return map[normalized] || null;
}

function hypixelColorToHex(rawColor, fallback = null) {
    const clean = String(rawColor || '').replace(/^§/i, '').trim().toUpperCase();
    if (!clean) return fallback;

    const named = {
        BLACK: '#000000',
        DARK_BLUE: '#0000AA',
        DARK_GREEN: '#00AA00',
        DARK_AQUA: '#00AAAA',
        DARK_RED: '#AA0000',
        DARK_PURPLE: '#AA00AA',
        GOLD: '#FFAA00',
        GRAY: '#AAAAAA',
        GREY: '#AAAAAA',
        DARK_GRAY: '#555555',
        DARK_GREY: '#555555',
        BLUE: '#5555FF',
        GREEN: '#55FF55',
        AQUA: '#55FFFF',
        RED: '#FF5555',
        LIGHT_PURPLE: '#FF55FF',
        YELLOW: '#FFFF55',
        WHITE: '#FFFFFF'
    };

    return named[clean] || minecraftCodeToHex(clean) || fallback;
}

function renderMinecraftFormattedText(rawText) {
    const input = String(rawText || '');
    if (!input) return { html: '', lastColor: null };

    let color = null;
    let bold = false;
    let italic = false;
    let underline = false;
    let strike = false;
    let obfuscated = false;
    let lastColor = null;

    const pieces = [];
    let buffer = '';

    const flush = () => {
        if (!buffer) return;

        const styles = [];
        if (color) styles.push(`color:${color}`);
        if (bold) styles.push('font-weight:bold');
        if (italic) styles.push('font-style:italic');
        if (underline) styles.push('text-decoration:underline');
        if (strike) styles.push('text-decoration:line-through');
        if (obfuscated) styles.push('letter-spacing:1px');

        const escaped = escapeHtml(buffer);
        if (styles.length > 0) {
            pieces.push(`<span style="${styles.join(';')}">${escaped}</span>`);
        } else {
            pieces.push(escaped);
        }

        buffer = '';
    };

    for (let index = 0; index < input.length; index += 1) {
        const char = input[index];
        const next = input[index + 1];

        if (char === '§' && next) {
            flush();
            const code = next.toLowerCase();

            const nextColor = minecraftCodeToHex(code);
            if (nextColor) {
                color = nextColor;
                lastColor = nextColor;
                bold = false;
                italic = false;
                underline = false;
                strike = false;
                obfuscated = false;
                index += 1;
                continue;
            }

            switch (code) {
                case 'l':
                    bold = true;
                    break;
                case 'o':
                    italic = true;
                    break;
                case 'n':
                    underline = true;
                    break;
                case 'm':
                    strike = true;
                    break;
                case 'k':
                    obfuscated = true;
                    break;
                case 'r':
                    color = null;
                    bold = false;
                    italic = false;
                    underline = false;
                    strike = false;
                    obfuscated = false;
                    break;
                default:
                    break;
            }

            index += 1;
            continue;
        }

        buffer += char;
    }

    flush();
    return { html: pieces.join(''), lastColor };
}

function getRankInfo(player) {
    const safePrefix = String(player.prefix || '').trim();
    if (safePrefix) {
        const renderedPrefix = renderMinecraftFormattedText(safePrefix);
        return {
            class: '',
            html: renderedPrefix.html,
            color: renderedPrefix.lastColor || null
        };
    }

    const directRank = String(player.rank || player.rankType || '').toUpperCase();
    const staffIcon = {
        class: '',
        html: `<span style="color:#FF5555;">[</span><span style="color:#FFAA00;">ZO</span><span style="color:#FF5555;">]</span>`,
        color: '#FF5555'
    };
    switch (directRank) {
        case 'OWNER':
        case 'ADMIN':
        case 'STAFF':
        case 'GAME_MASTER':
        case 'GM':
        case 'MODERATOR':
        case 'MOD':
        case 'HELPER':
            return staffIcon;
        case 'YOUTUBER':
            return { class: 'rank-youtube', html: '[<span style="color: #ffffff;">YOUTUBE</span>]', color: '#FF5555' };
        default:
            break;
    }

    if (directRank && !['NONE', 'NORMAL', 'NON', 'DEFAULT'].includes(directRank)) {
        return { class: 'rank-admin', html: `[${escapeHtml(directRank)}]`, color: null };
    }

    const plusColor = hypixelColorToHex(player.rankPlusColor, '#FF5555');
    const monthlyColor = hypixelColorToHex(player.monthlyRankColor, '#FFAA00');
    const monthlyPackageRank = String(player.monthlyPackageRank || '').toUpperCase();
    const rank = String(player.newPackageRank || player.packageRank || player.monthlyRank || 'NONE').toUpperCase();
    const isSuperstar = monthlyPackageRank === 'SUPERSTAR' || rank === 'MVP_PLUS_PLUS';

    if (isSuperstar) {
        return {
            class: 'rank-mvp-plus-plus',
            html: `<span style="color: ${monthlyColor};">[MVP</span><span style="color: ${plusColor};">++</span><span style="color: ${monthlyColor};">]</span>`,
            color: monthlyColor
        };
    }

    switch (rank) {
        case 'VIP':
            return { class: 'rank-vip', html: '[VIP]', color: '#55FF55' };
        case 'VIP_PLUS':
            return { class: 'rank-vip-plus', html: '[VIP<span style="color: #FFAA00;">+</span>]', color: '#55FF55' };
        case 'MVP':
            return { class: 'rank-mvp', html: '[MVP]', color: '#55FFFF' };
        case 'MVP_PLUS':
            return {
                class: 'rank-mvp-plus',
                html: `<span style="color:#55FFFF;">[MVP</span><span style="color: ${plusColor};">+</span><span style="color:#55FFFF;">]</span>`,
                color: '#55FFFF'
            };
        default:
            return { class: '', html: '', color: null };
    }
}

module.exports = { minecraftCodeToHex, hypixelColorToHex, renderMinecraftFormattedText, getRankInfo };
