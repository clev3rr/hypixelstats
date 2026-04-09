'use strict';

const express = require('express');
const axios = require('axios');
const router = express.Router();

const { getCachedJson, setCachedJson } = require('../utils/cache');
const { getRankInfo } = require('../utils/minecraft');
const { calculateGuildLevelFromExp, mapWithConcurrency } = require('../utils/guild-utils');

const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;

router.get('/:name', async (req, res) => {
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

module.exports = router;
