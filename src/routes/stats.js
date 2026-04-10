'use strict';

const express = require('express');
const axios = require('axios');
const router = express.Router();

const { getCachedJson, setCachedJson } = require('../utils/cache');
const { normalizeKey, stripMinecraftFormatting, titleCaseWords, formatPetLabel } = require('../utils/helpers');
const { getRankInfo } = require('../utils/minecraft');
const { toDisplayPetLevel, levelFromPetExp, pickPetMappedValue, buildPetList } = require('../utils/pets');

const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;

router.get('/:username', async (req, res) => {
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

        const allPets = buildPetList(player, currentPetRaw, cleanPetType, customPetName, petLevel);

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

        const normalizeServerType = (rawType) => {
            if (!rawType) return null;
            const normalizedKey = String(rawType).trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
            const mapping = {
                skywars: 'SkyWars',
                bedwars: 'Bedwars',
                skyclash: 'SkyClash',
                murdermystery: 'Murder Mystery',
                vampirez: 'VampireZ',
                tntgames: 'TNT Games',
                arcade: 'Arcade',
                buildbattle: 'Build Battle',
                uhc: 'UHC',
                speeduhc: 'Speed UHC',
                quake: 'Quakecraft',
                walls: 'Walls',
                walls3: 'Mega Walls',
                super_smash: 'Smash Heroes',
                pit: 'The Pit',
                skyblock: 'SkyBlock'
            };
            return mapping[normalizedKey] || titleCaseWords(String(rawType).toLowerCase().replace(/[_-]+/g, ' ').trim());
        };

        const rawServerType = player.gameType || player.currentGameType || player.currentGame || player.mostRecentGameType || null;
        const serverType = isOnline ? normalizeServerType(rawServerType) : null;

        const responsePayload = {
            uuid: uuid,
            name: player.displayname,
            socialMedia: player.socialMedia?.links || {},
            rankHtml: rankInfo.html,
            rankClass: rankInfo.class,
            rankColor: rankInfo.color,
            achievements,
            online: isOnline,
            serverType,
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

        const cacheTtlMs = isOnline ? 10 * 1000 : undefined;
        setCachedJson(cacheKey, responsePayload, cacheTtlMs);
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

module.exports = router;
