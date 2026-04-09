'use strict';

const { normalizeKey, stripMinecraftFormatting, titleCaseWords, formatPetLabel } = require('./helpers');

function toDisplayPetLevel(rawLevel) {
    const parsed = Number(rawLevel);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.max(1, Math.floor(parsed) + 1);
}

function levelFromPetExp(rawExp) {
    const exp = Number(rawExp);
    if (!Number.isFinite(exp) || exp <= 0) return 0;
    return Math.max(1, Math.floor(Math.sqrt(exp / 100)) + 1);
}

function levelFromLegacyPetExp(rawExp) {
    const exp = Number(rawExp);
    if (!Number.isFinite(exp) || exp <= 0) return 0;
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

function buildPetList(player, currentPetRaw, cleanPetType, customPetName, petLevel) {
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

    return prepared.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
}

module.exports = {
    toDisplayPetLevel,
    levelFromPetExp,
    levelFromLegacyPetExp,
    pickPetMappedValue,
    buildPetList
};
