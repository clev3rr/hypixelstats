const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Hypixel API key
const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;

if (!HYPIXEL_API_KEY) {
    console.error('Error: HYPIXEL_API_KEY is not set in environment variables.');
    process.exit(1);
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

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

function toDisplayPetLevel(rawLevel) {
    const parsed = Number(rawLevel);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.max(1, Math.floor(parsed) + 1);
}

function levelFromPetExp(rawExp) {
    const exp = Number(rawExp);
    if (!Number.isFinite(exp) || exp <= 0) return 0;
    // Modern pets formula
    return Math.max(1, Math.floor(Math.sqrt(exp / 100)) + 1);
}

function levelFromLegacyPetExp(rawExp) {
    const exp = Number(rawExp);
    if (!Number.isFinite(exp) || exp <= 0) return 0;
    // Try: level = 1 + floor(sqrt(exp / 100))
    return Math.max(1, Math.floor(1 + Math.sqrt(exp / 100)));
}

function pickPetMappedValue(sourceObj, variantKeys, expectedType = 'number') {
    if (!sourceObj || typeof sourceObj !== 'object') return undefined;

    const normalizedVariants = variantKeys.map(normalizeKey).filter(Boolean);
    const entries = Object.entries(sourceObj);

    const cast = (value) => {
        if (expectedType === 'number') {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        }
        if (expectedType === 'string') {
            return typeof value === 'string' && value.trim() ? value.trim() : undefined;
        }
        return undefined;
    };

    for (const candidate of variantKeys) {
        const lookup = String(candidate).toLowerCase();
        for (const [key, value] of entries) {
            if (String(key).toLowerCase() === lookup) {
                const parsed = cast(value);
                if (parsed !== undefined) return parsed;
            }
        }
    }

    for (const [key, value] of entries) {
        const normalizedKey = normalizeKey(key);
        const keyMatches = normalizedVariants.some(v => v && (normalizedKey.includes(v) || v.includes(normalizedKey)));
        if (!keyMatches) continue;
        const parsed = cast(value);
        if (parsed !== undefined) return parsed;
    }

    return undefined;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

// === ФУНКЦИЯ ОПРЕДЕЛЕНИЯ РАНГА И ЦВЕТОВ ===
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
            return staffIcon;
        case 'ADMIN':
            return staffIcon;
        case 'STAFF':
            return staffIcon;
        case 'GAME_MASTER':
        case 'GM':
            return staffIcon;
        case 'MODERATOR':
        case 'MOD':
            return staffIcon;
        case 'HELPER':
            return staffIcon;
        case 'YOUTUBER':
            return { class: 'rank-youtube', html: '[<span style="color: #ffffff;">YOUTUBE</span>]', color: null };
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

function calculateGuildLevelFromExp(rawExp) {
    const exp = Number(rawExp);
    if (!Number.isFinite(exp) || exp <= 0) return 0;

    const expPerLevel = [
        100000,
        150000,
        250000,
        500000,
        750000,
        1000000,
        1250000,
        1500000,
        2000000,
        2500000,
        2500000,
        2500000,
        2500000,
        2500000,
        3000000
    ];

    let remainingExp = exp;
    let level = 0;

    while (remainingExp > 0) {
        const neededExp = expPerLevel[Math.min(level, expPerLevel.length - 1)];

        if (remainingExp < neededExp) {
            return level + (remainingExp / neededExp);
        }

        remainingExp -= neededExp;
        level += 1;
    }

    return level;
}

async function mapWithConcurrency(items, limit, mapper) {
    const safeLimit = Math.max(1, Number(limit) || 1);
    const results = new Array(items.length);
    let cursor = 0;

    const worker = async () => {
        while (true) {
            const index = cursor;
            cursor += 1;
            if (index >= items.length) break;

            try {
                results[index] = await mapper(items[index], index);
            } catch (error) {
                results[index] = null;
            }
        }
    };

    const workers = Array.from({ length: Math.min(safeLimit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

app.get('/api/stats/:username', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `stats:${String(username || '').trim().toLowerCase()}`;
    const cachedPayload = getCachedJson(cacheKey);
    if (cachedPayload) {
        return res.json(cachedPayload);
    }

    try {
        // 1. Get UUID from Mojang
        const mojangResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (!mojangResponse.data || !mojangResponse.data.id) {
            return res.status(404).json({ error: 'Player not found in Mojang.' });
        }

        const uuid = mojangResponse.data.id;

        // 2. Parallel Hypixel requests (player + guild)
        const [hypixelPlayerResponse, hypixelGuildResponse] = await Promise.all([
            axios.get(`https://api.hypixel.net/v2/player?uuid=${uuid}`, {
                headers: { 'API-Key': HYPIXEL_API_KEY }
            }),
            axios.get(`https://api.hypixel.net/v2/guild?player=${uuid}`, {
                headers: { 'API-Key': HYPIXEL_API_KEY }
            })
        ]);

        if (!hypixelPlayerResponse.data.player) {
            return res.status(404).json({ error: 'Player has never joined Hypixel.' });
        }

        const player = hypixelPlayerResponse.data.player;
        const guildData = hypixelGuildResponse.data.guild;
        const rankInfo = getRankInfo(player);

        // === ДАННЫЕ АКТИВНОГО ПИТОМЦА ===
        let customPetName = null;
        let petExp = 0;
        let petLevel = 0;
        const currentPetRaw = String(player.currentPet || '');
        const cleanPetType = currentPetRaw.replace(/^PET_/i, '');

        const variantKeys = Array.from(new Set([
            currentPetRaw,
            cleanPetType,
            cleanPetType ? `PET_${cleanPetType}` : ''
        ].filter(Boolean)));

        if (player.petStats && typeof player.petStats === 'object') {
            const foundName = pickPetMappedValue(player.petStats.petNames, variantKeys, 'string');
            if (foundName) {
                customPetName = stripMinecraftFormatting(foundName);
            }

            const foundExp = pickPetMappedValue(player.petStats.petExperience, variantKeys, 'number');
            if (Number.isFinite(foundExp) && foundExp > 0) {
                petExp = foundExp;
            }

            const foundLevel = pickPetMappedValue(player.petStats.petLevels, variantKeys, 'number');
            if (Number.isFinite(foundLevel) && foundLevel >= 0) {
                petLevel = toDisplayPetLevel(foundLevel);
            }
        }

        // Fallback: ищем pet exp/level по всему объекту игрока, если в petStats пусто.
        if ((petExp <= 0 || petLevel <= 0 || !customPetName) && cleanPetType) {
            const normalizedPet = normalizeKey(cleanPetType);
            const visited = new Set();

            const foundNameCandidates = [];
            const foundLevelCandidates = [];
            const foundExpCandidates = [];

            const walk = (node, depth = 0, pathParts = []) => {
                if (!node || typeof node !== 'object' || depth > 5 || visited.has(node)) return;
                visited.add(node);

                for (const [key, value] of Object.entries(node)) {
                    const keyLower = String(key).toLowerCase();
                    const keyNormalized = normalizeKey(keyLower);
                    const nextPathParts = [...pathParts, keyLower];
                    const pathLower = nextPathParts.join('.');
                    const pathNormalized = normalizeKey(pathLower);
                    const isPetRelated =
                        pathLower.includes('pet') ||
                        keyNormalized.includes(normalizedPet) ||
                        pathNormalized.includes(normalizedPet);

                    if (typeof value === 'number' && Number.isFinite(value) && isPetRelated) {
                        if (/(exp|experience|xp)/.test(keyLower) && value > petExp) {
                            petExp = value;
                            foundExpCandidates.push(value);
                        }
                        if (/(level|lvl)/.test(keyLower) && value >= 0) {
                            const displayLevel = toDisplayPetLevel(value);
                            if (displayLevel > petLevel) {
                                petLevel = displayLevel;
                            }
                            foundLevelCandidates.push(displayLevel);
                        }
                    } else if (typeof value === 'string' && isPetRelated) {
                        const trimmed = value.trim();
                        const normalizedValue = normalizeKey(trimmed);
                        if (
                            trimmed &&
                            /(name|nickname|display)/.test(keyLower) &&
                            normalizedValue &&
                            normalizedValue !== normalizedPet
                        ) {
                            foundNameCandidates.push(stripMinecraftFormatting(trimmed));
                        }
                    } else if (value && typeof value === 'object') {
                        walk(value, depth + 1, nextPathParts);
                    }
                }
            };

            walk(player);

            if (!customPetName && foundNameCandidates.length > 0) {
                foundNameCandidates.sort((a, b) => a.length - b.length);
                customPetName = stripMinecraftFormatting(foundNameCandidates[0]);
            }
            if (petLevel <= 0 && foundLevelCandidates.length > 0) {
                petLevel = Math.max(...foundLevelCandidates);
            }
            if (petExp <= 0 && foundExpCandidates.length > 0) {
                petExp = Math.max(...foundExpCandidates);
            }
        }

        if (petExp > 0) {
            petLevel = Math.max(petLevel, levelFromPetExp(petExp));
        }

        const directPetNameCandidates = [
            player.currentPetName,
            player.activePetName,
            player.petName,
            player.vanityMeta?.petName
        ];
        for (const candidate of directPetNameCandidates) {
            if (!customPetName && typeof candidate === 'string' && candidate.trim()) {
                customPetName = stripMinecraftFormatting(candidate);
            }
        }

        if (customPetName) {
            const normalizedName = customPetName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedType = cleanPetType.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedName === normalizedType) {
                customPetName = titleCaseWords(formatPetLabel(cleanPetType));
            }
        }

        if (!customPetName && cleanPetType) {
            customPetName = titleCaseWords(formatPetLabel(cleanPetType));
        }

        const buildPetList = () => {
            const mergeMaps = (maps) => {
                const merged = {};
                for (const mapObj of maps) {
                    if (!mapObj || typeof mapObj !== 'object') continue;
                    for (const [k, v] of Object.entries(mapObj)) {
                        merged[String(k)] = v;
                    }
                }
                return merged;
            };

            const collectNestedPetMaps = (rootObj, targetNormalizedKey) => {
                const found = [];
                const seen = new Set();

                const walk = (node, depth = 0) => {
                    if (!node || typeof node !== 'object' || depth > 7 || seen.has(node)) return;
                    seen.add(node);

                    for (const [k, v] of Object.entries(node)) {
                        const normalized = normalizeKey(k);
                        if (normalized === targetNormalizedKey && v && typeof v === 'object') {
                            found.push(v);
                        }

                        if (v && typeof v === 'object') {
                            walk(v, depth + 1);
                        }
                    }
                };

                walk(rootObj);
                return found;
            };

            const petStats = (player.petStats && typeof player.petStats === 'object') ? player.petStats : {};
            const petNames = mergeMaps([
                petStats.petNames,
                ...collectNestedPetMaps(player, 'petnames')
            ]);
            const petLevels = mergeMaps([
                petStats.petLevels,
                ...collectNestedPetMaps(player, 'petlevels')
            ]);
            const petExperience = mergeMaps([
                petStats.petExperience,
                ...collectNestedPetMaps(player, 'petexperience')
            ]);

            const legacyPetEntries = Object.entries(petStats)
                .filter(([legacyKey, legacyValue]) => {
                    if (!legacyValue || typeof legacyValue !== 'object') return false;
                    const normalized = normalizeKey(legacyKey);
                    if (!normalized) return false;
                    if (['petnames', 'petlevels', 'petexperience'].includes(normalized)) return false;
                    return true;
                })
                .map(([legacyKey, legacyValue]) => {
                    const experience = Number(legacyValue.experience);
                    const rawLevel = Number(legacyValue.level);
                    const mappedName = typeof legacyValue.name === 'string' && legacyValue.name.trim()
                        ? stripMinecraftFormatting(legacyValue.name)
                        : null;

                    // Try using stored level first if available
                    // Formula adjustments:
                    // - HEROBRINE/CLONE need +1
                    // - GREEN_HELPER (testyclefer) calculation is already +1 too high, so -1
                    const needsPlusOne = ['clone', 'herobrine'].includes(normalizeKey(legacyKey));
                    const needsMinusOne = ['greenhelper'].includes(normalizeKey(legacyKey));
                    const derivedLevel = Number.isFinite(rawLevel) && rawLevel > 0
                        ? Math.max(1, rawLevel)
                        : (Number.isFinite(experience) && experience > 0
                            ? Math.max(1, Math.floor(0.69 * Math.pow(experience, 0.36)) + (needsPlusOne ? 1 : 0) - (needsMinusOne ? 1 : 0))
                            : 0);

                    return {
                        key: String(legacyKey),
                        experience: Number.isFinite(experience) ? experience : 0,
                        mappedName,
                        derivedLevel
                    };
                });

            const keySet = new Set([
                ...Object.keys(petNames),
                ...Object.keys(petLevels),
                ...Object.keys(petExperience),
                ...legacyPetEntries.map(p => p.key)
            ].filter(Boolean));

            if (keySet.size === 0) {
                [
                    currentPetRaw,
                    cleanPetType ? `PET_${cleanPetType}` : '',
                    cleanPetType
                ].filter(Boolean).forEach(k => keySet.add(k));
            }

            const normalizedActiveKeys = new Set(
                [currentPetRaw, cleanPetType, cleanPetType ? `PET_${cleanPetType}` : '']
                    .filter(Boolean)
                    .map(normalizeKey)
            );

            const getMappedValue = (obj, key) => {
                if (!obj || typeof obj !== 'object') return undefined;
                if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];

                const lookup = String(key).toLowerCase();
                for (const [k, v] of Object.entries(obj)) {
                    if (String(k).toLowerCase() === lookup) return v;
                }
                return undefined;
            };

            const petList = [];
            for (const rawKey of keySet) {
                const key = String(rawKey);
                const cleanedType = key.replace(/^PET_/i, '').trim();
                if (!cleanedType) continue;

                const legacyMatch = legacyPetEntries.find(p => normalizeKey(p.key) === normalizeKey(key));

                // Prioritize legacy name if available, as it's already cleaned
                const rawName = legacyMatch?.mappedName || getMappedValue(petNames, key);
                const normalizedType = normalizeKey(cleanedType);
                const typeLabel = titleCaseWords(formatPetLabel(cleanedType));
                const mappedName = (typeof rawName === 'string' && rawName.trim())
                    ? stripMinecraftFormatting(rawName)
                    : null;
                const normalizedMappedName = normalizeKey(mappedName || '');
                let customName = mappedName && normalizedMappedName !== normalizedType
                    ? mappedName
                    : null;
                let computedName = customName || typeLabel;

                const levelRaw = Number(getMappedValue(petLevels, key));
                const expRaw = Number(getMappedValue(petExperience, key));
                const legacyExpRaw = Number(legacyMatch?.experience);

                let computedLevel = 0;
                if (legacyMatch?.derivedLevel && legacyMatch.derivedLevel > 0) {
                    computedLevel = legacyMatch.derivedLevel;
                } else if (Number.isFinite(expRaw) && expRaw > 0) {
                    computedLevel = levelFromPetExp(expRaw);
                } else if (Number.isFinite(levelRaw) && levelRaw >= 0) {
                    computedLevel = toDisplayPetLevel(levelRaw);
                }

                if (computedLevel <= 0 && Number.isFinite(legacyExpRaw) && legacyExpRaw > 0) {
                    computedLevel = levelFromPetExp(legacyExpRaw);
                }

                const hasPetData = Boolean(
                    mappedName ||
                    legacyMatch ||
                    (Number.isFinite(levelRaw) && levelRaw >= 0) ||
                    (Number.isFinite(expRaw) && expRaw > 0)
                );

                const isActive = normalizedActiveKeys.has(normalizeKey(key)) || normalizedActiveKeys.has(normalizedType);
                if (isActive && customPetName) {
                    const normalizedActiveName = normalizeKey(customPetName);
                    if (normalizedActiveName && normalizedActiveName !== normalizedType) {
                        customName = customPetName;
                        computedName = customPetName;
                    }
                }
                if (isActive && petLevel > 0 && petLevel > computedLevel) {
                    computedLevel = petLevel;
                }
                if (hasPetData && computedLevel <= 0) {
                    computedLevel = 1;
                }

                petList.push({
                    key,
                    name: computedName,
                    type: typeLabel,
                    customName,
                    level: computedLevel,
                    active: isActive
                });
            }

            const dedup = new Map();
            for (const pet of petList) {
                // Use key instead of name to keep different pet types separate (e.g., CLONE vs TOTEM with same name)
                const dedupKey = pet.key || normalizeKey(pet.name);
                const prev = dedup.get(dedupKey);
                if (
                    !prev ||
                    pet.level > prev.level ||
                    (pet.level === prev.level && !prev.active && pet.active)
                ) {
                    dedup.set(dedupKey, pet);
                }
            }

            let prepared = Array.from(dedup.values());

            if (prepared.length > 0 && normalizedActiveKeys.size > 0) {
                const activeIndex = prepared.findIndex(p => p.active);

                if (activeIndex === -1) {
                    const fallbackIndex = prepared.findIndex(p => {
                        const nk = normalizeKey(p.key);
                        const nt = normalizeKey(p.type);
                        const nn = normalizeKey(p.name);
                        return normalizedActiveKeys.has(nk) || normalizedActiveKeys.has(nt) || normalizedActiveKeys.has(nn);
                    });

                    if (fallbackIndex !== -1) {
                        prepared[fallbackIndex].active = true;

                        if (customPetName) {
                            const normalizedActiveName = normalizeKey(customPetName);
                            const normalizedType = normalizeKey(prepared[fallbackIndex].type);
                            if (normalizedActiveName && normalizedActiveName !== normalizedType) {
                                prepared[fallbackIndex].customName = customPetName;
                                prepared[fallbackIndex].name = customPetName;
                            }
                        }

                        if ((Number(prepared[fallbackIndex].level) || 0) <= 0 && petLevel > 0) {
                            prepared[fallbackIndex].level = Math.floor(petLevel);
                        }
                    }
                }
            }

            if (prepared.length === 0 && (customPetName || cleanPetType)) {
                prepared.push({
                    key: currentPetRaw || cleanPetType || 'PET_UNKNOWN',
                    name: customPetName || titleCaseWords(formatPetLabel(cleanPetType)) || 'Unknown',
                    level: Math.floor(petLevel || 0),
                    active: true
                });
            }

            return prepared
                .sort((a, b) => {
                    if (b.level !== a.level) return b.level - a.level;
                    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
                });
        };

        const allPets = buildPetList();

        // Формируем финальный объект ответа
        const isOnline = Boolean(player.lastLogin) && (player.lastLogin > (player.lastLogout || 0));
        const achievements = player.achievements || {};

        const toNumber = (value) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        const questTotalsFromObject = (() => {
            const quests = player.quests;
            if (!quests || typeof quests !== 'object') return 0;

            let total = 0;
            for (const value of Object.values(quests)) {
                if (Number.isFinite(Number(value))) {
                    total += Number(value);
                    continue;
                }
                if (value && typeof value === 'object') {
                    total += toNumber(value.completions);
                    total += toNumber(value.completed);
                    total += toNumber(value.total);
                }
            }
            return total;
        })();

        const questMasterTotalFromAchievements = Object.entries(achievements)
            .filter(([key, value]) => /_quest_master$/i.test(String(key)) && Number.isFinite(Number(value)))
            .reduce((sum, [, value]) => sum + Number(value), 0);

        const recursiveQuestCandidate = (() => {
            const seen = new Set();
            let best = 0;

            const walk = (node, depth = 0) => {
                if (!node || typeof node !== 'object' || depth > 6 || seen.has(node)) return;
                seen.add(node);

                for (const [key, value] of Object.entries(node)) {
                    const normalized = normalizeKey(key);
                    const numeric = Number(value);

                    if (Number.isFinite(numeric)) {
                        const questLike = /quest/.test(normalized);
                        const completedLike = /(master|complete|completed|completions|questscompleted)/.test(normalized);
                        const badLike = /(streak|reward|daily|weekly|monthly)/.test(normalized);
                        if (questLike && completedLike && !badLike) {
                            best = Math.max(best, numeric);
                        }
                    }

                    if (value && typeof value === 'object') {
                        walk(value, depth + 1);
                    }
                }
            };

            walk(player);
            return best;
        })();

        const questsCompleted = Math.max(
            questMasterTotalFromAchievements,
            toNumber(achievements.general_quest_master),
            toNumber(achievements.general_quest),
            toNumber(achievements.quests_completed),
            toNumber(player.questsCompleted),
            questTotalsFromObject,
            recursiveQuestCandidate
        );

        const rewardStreakHigh = Math.max(
            toNumber(player.rewardHighStreak),
            toNumber(player.rewardHighstreak),
            toNumber(player.rewardHighScore)
        );

        const rewardCurrentStreak = Math.max(
            toNumber(player.rewardStreak),
            toNumber(player.currentRewardStreak)
        );

        const dailyRewardCandidates = [
            player.totalDailyRewards,
            player.totalDailyRewardsClaimed,
            player.dailyRewardsClaimed,
            player.rewardScore,
            player.rewardTotal,
            player.rewardCount
        ].map(toNumber);

        // Дополнительно ищем любые числовые ключи похожие на daily reward счетчики.
        for (const [key, value] of Object.entries(player)) {
            const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!/daily.*reward|reward.*daily/.test(normalized)) continue;
            dailyRewardCandidates.push(toNumber(value));
        }

        const dailyRewardsClaimed = Math.max(...dailyRewardCandidates, 0);

        const achievementPoints = Math.max(
            toNumber(player.achievementPoints),
            toNumber(player.achievement_points),
            toNumber(achievements.achievement_points),
            toNumber(achievements.achievementpoints),
            toNumber(achievements.total_achievement_points)
        );

        const responsePayload = {
            uuid: uuid,
            name: player.displayname,
            socialMedia: player.socialMedia?.links || {},
            rankHtml: rankInfo.html,
            rankClass: rankInfo.class,
            rankColor: rankInfo.color,
            achievements,
            online: isOnline,
            networkLevel: (Math.sqrt((2 * (player.networkExp || 0)) + 30625) / 50) - 2.5,
            karma: player.karma || 0,
            achievementPoints,
            questsCompleted,
            networkWins: toNumber(achievements.general_wins),

            // === GENERAL STATS ===
            giftsGiven: player.giftingMeta?.realBundlesGiven || 0,
            giftsReceived: player.giftingMeta?.realBundlesReceived || 0,
            mostRecentGame: player.mostRecentGameType || 'None',
            rewardsClaimed: player.totalRewards || 0,
            dailyRewards: dailyRewardsClaimed,
            rewardStreak: rewardStreakHigh,
            rewardCurrentStreak,
            votes: player.voting?.total || 0,

            // === ОБРАБОТАННЫЕ ДАННЫЕ ПИТОМЦА ===
            pet: {
                name: customPetName || null,
                type: cleanPetType ? formatPetLabel(cleanPetType) : 'None',
                exp: petExp || 0,
                level: petLevel || 0,
                list: allPets
            },

            firstLogin: player.firstLogin || null,
            latestLogin: player.lastLogin || player.lastLogout || null,
            stats: player.stats || {},
            guild: guildData ? {
                name: guildData.name,
                tag: guildData.tag,
                tagColor: guildData.tagColor || null,
                members: guildData.members.length,
                playerRank: (guildData.members.find(m => m.uuid === uuid) || {}).rank
            } : null
        };

        setCachedJson(cacheKey, responsePayload);
        res.json(responsePayload);

    } catch (error) {
        console.error("Server error:", error?.message, error?.response?.status);
        if (error.response) {
            const status = Number(error.response.status);
            if ([400, 404].includes(status)) {
                return res.status(404).json({ error: 'Player not found.' });
            }
        }
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.get('/api/guild/:name', async (req, res) => {
    try {
        const query = String(req.params.name || '').trim();
        const cacheKey = `guild:${query.toLowerCase()}`;
        const cachedPayload = getCachedJson(cacheKey);
        if (cachedPayload) {
            return res.json(cachedPayload);
        }

        if (!query) {
            return res.status(400).json({ error: 'Guild name or player name is required' });
        }

        const hypixelHeaders = { headers: { 'API-Key': HYPIXEL_API_KEY } };

        let guildData = null;
        let resolvedBy = 'guild_name';

        const byNameResponse = await axios.get(
            `https://api.hypixel.net/v2/guild?name=${encodeURIComponent(query)}`,
            hypixelHeaders
        );

        if (byNameResponse.data?.success && byNameResponse.data?.guild) {
            guildData = byNameResponse.data.guild;
        } else {
            resolvedBy = 'player_name';
            let playerUuid = null;

            try {
                const mojangResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(query)}`);
                playerUuid = mojangResponse.data?.id || null;
            } catch (error) {
                playerUuid = null;
            }

            if (playerUuid) {
                const byPlayerResponse = await axios.get(
                    `https://api.hypixel.net/v2/guild?player=${encodeURIComponent(playerUuid)}`,
                    hypixelHeaders
                );

                if (byPlayerResponse.data?.success && byPlayerResponse.data?.guild) {
                    guildData = byPlayerResponse.data.guild;
                }
            }
        }

        if (!guildData) {
            return res.status(404).json({ error: 'Guild not found' });
        }

        const members = Array.isArray(guildData.members) ? guildData.members : [];
        const membersForDetails = members.slice(0, 80);

        const enrichedMembersRaw = await mapWithConcurrency(membersForDetails, 8, async (member) => {
            const uuid = String(member?.uuid || '').trim();
            const joined = Number(member?.joined || 0) || 0;
            const guildRank = String(member?.rank || 'Member').trim() || 'Member';

            let username = 'Unknown';
            let lastLogin = 0;
            let networkRankClass = '';
            let networkRankHtml = '';
            let networkRankColor = null;

            if (uuid) {
                try {
                    const playerResponse = await axios.get(
                        `https://api.hypixel.net/v2/player?uuid=${encodeURIComponent(uuid)}`,
                        hypixelHeaders
                    );
                    const playerData = playerResponse.data?.player;
                    if (playerData) {
                        username = playerData.displayname || username;
                        lastLogin = Number(playerData.lastLogin || playerData.lastLogout || 0) || 0;

                        const rankInfo = getRankInfo(playerData);
                        networkRankClass = rankInfo?.class || '';
                        networkRankHtml = rankInfo?.html || '';
                        networkRankColor = rankInfo?.color || null;
                    }
                } catch (error) {
                    // Silent fallback to defaults
                }
            }

            return {
                uuid,
                username,
                rank: guildRank,
                joined,
                lastLogin,
                rankClass: networkRankClass,
                rankHtml: networkRankHtml,
                rankColor: networkRankColor,
                avatar: uuid ? `https://mc-heads.net/head/${uuid}/36` : null
            };
        });

        const enrichedMembers = enrichedMembersRaw.filter(Boolean);

        const publiclyJoinable = typeof guildData.publiclyListed === 'boolean'
            ? guildData.publiclyListed
            : (typeof guildData.joinable === 'boolean' ? guildData.joinable : null);

        const rankBreakdown = members.reduce((acc, member) => {
            const role = String(member?.rank || 'Member').trim() || 'Member';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        const guildAchievements = (guildData && typeof guildData.achievements === 'object')
            ? guildData.achievements
            : {};

        const guildWins = Number(guildAchievements.WINNERS ?? guildAchievements.winners ?? guildData.wins ?? 0);

        const guildExp = Number(guildData.exp || 0);
        const guildLevel = Number(guildData.level || 0) > 0
            ? Number(guildData.level)
            : calculateGuildLevelFromExp(guildExp);

        const responsePayload = {
            success: true,
            guild: {
                id: guildData._id,
                name: guildData.name,
                tag: guildData.tag,
                tagColor: guildData.tagColor || null,
                level: guildLevel,
                exp: guildExp,
                description: guildData.description || '',
                created: Number(guildData.created || 0) || null,
                members: members.length,
                coins: Number(guildData.coins || 0),
                wins: Number.isFinite(guildWins) ? guildWins : 0,
                legacyRanking: Number(guildData.legacyRanking || 0),
                publiclyJoinable,
                rankBreakdown,
                resolvedBy,
                membersList: enrichedMembers
            }
        };

        setCachedJson(cacheKey, responsePayload);
        res.json(responsePayload);
    } catch (error) {
        console.error("Guild fetch error:", error?.message, error?.response?.status);
        if (res.headersSent) return;
        if (error.response) {
            const status = Number(error.response.status);
            if ([400, 404].includes(status)) {
                return res.status(404).json({ error: 'Guild not found' });
            }
        }
        res.status(500).json({ error: 'An error occurred while fetching guild data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен! link: http://localhost:${PORT}`);
});