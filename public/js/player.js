async function getStats() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return;

    const searchPage = document.getElementById('searchPage');
    const resultsPage = document.getElementById('resultsPage');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const accordion = document.getElementById('gamesAccordion');

    resultsPage.classList.add('hidden');
    searchPage.classList.add('hidden');
    errorDiv.classList.add('hidden');
    loading.classList.remove('hidden');
    accordion.innerHTML = '';

    try {
        const data = await fetchApiJson(`/api/stats/${encodeURIComponent(username)}`, 'Server error');

        const playerNameEl = document.getElementById('playerName');
        const playerAvatarEl = document.getElementById('playerAvatar');
        playerAvatarEl.src = `https://mc-heads.net/head/${data.name}/100`;
        playerAvatarEl.classList.remove('hidden');
        playerAvatarEl.style.boxShadow = `0 0 20px ${data.rankColor || '#AAAAAA'}`;
        playerAvatarEl.style.borderColor = data.rankColor || '#AAAAAA';

        let nameString = data.rankHtml ? 
            `<span class="player-rank-name ${data.rankClass}"${data.rankColor ? ` style="color: ${data.rankColor};"` : ''}>${data.rankHtml} ${data.name}</span>` :
            `<span class="player-rank-name" style="color: #AAAAAA;">${data.name}</span>`;

        const mapGuildTagColor = (rawColor) => {
            const value = String(rawColor || '').trim();
            if (!value) return null;

            const clean = value.replace(/^§/i, '').toUpperCase();
            const colorMap = {
                BLACK: '#000000',
                DARK_BLUE: '#0000AA',
                DARK_GREEN: '#00AA00',
                DARK_AQUA: '#00AAAA',
                DARK_RED: '#AA0000',
                DARK_PURPLE: '#AA00AA',
                GOLD: '#FFAA00',
                GRAY: '#AAAAAA',
                DARK_GRAY: '#555555',
                BLUE: '#5555FF',
                GREEN: '#55FF55',
                AQUA: '#55FFFF',
                RED: '#FF5555',
                LIGHT_PURPLE: '#FF55FF',
                YELLOW: '#FFFF55',
                WHITE: '#FFFFFF',
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

            return colorMap[clean] || colorMap[clean.replace(/^&/, '')] || null;
        };

        if (data.guild && data.guild.tag) {
            const tagHex = mapGuildTagColor(data.guild.tagColor);
            const guildTagStyle = tagHex ? ` style="color: ${tagHex};"` : '';
            nameString += `<span class="player-guild-tag"${guildTagStyle}>[${data.guild.tag}]</span>`;
        }
        playerNameEl.innerHTML = nameString;

        let totalCoins = 0;
        let totalKillsFromStats = 0;
        let totalWinsFromStats = 0;
        const statsData = data.stats || {};

        const toNumber = (value) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        const sumExistingKeys = (source, keys) => keys.reduce((sum, key) => sum + toNumber(source[key]), 0);
        const pickBestAggregate = (source, primaryKeys, fallbackKeys) => {
            const primary = sumExistingKeys(source, primaryKeys);
            if (primary > 0) return primary;
            return sumExistingKeys(source, fallbackKeys);
        };

        const winPrimaryKeys = ['wins'];
        const winFallbackKeys = [
            'wins_bedwars', 'game_wins', 'wins_capture', 'wins_tntwizard', 'human_wins', 'vampire_wins',
            'wins_tntrun', 'wins_tnttag', 'wins_pvprun', 'wins_bowspleef'
        ];
        const killPrimaryKeys = ['kills'];
        const killFallbackKeys = ['kills_bedwars', 'human_kills', 'zombie_kills', 'vampire_kills', 'cop_kills', 'criminal_kills'];

        for (const [gameKey, game] of Object.entries(statsData)) {
            if (!game || typeof game !== 'object') continue;

            totalCoins += toNumber(game.coins);
            totalKillsFromStats += pickBestAggregate(game, killPrimaryKeys, killFallbackKeys);
            totalWinsFromStats += pickBestAggregate(game, winPrimaryKeys, winFallbackKeys);

            if (gameKey === 'Pit' && game.pit_stats_pt && typeof game.pit_stats_pt === 'object') {
                totalKillsFromStats += toNumber(game.pit_stats_pt.kills);
                totalWinsFromStats += toNumber(game.pit_stats_pt.wins);
            }
        }

        const achievements = data.achievements || {};
        const achievementPoints = Math.max(
            toNumber(data.achievementPoints),
            toNumber(data.achievement_points),
            toNumber(achievements.achievement_points),
            toNumber(achievements.achievementpoints),
            toNumber(achievements.total_achievement_points)
        );

        const questsFromAchievements = Object.entries(achievements)
            .filter(([key, value]) => /quest/i.test(String(key)) && Number.isFinite(Number(value)))
            .filter(([key]) => !/weekly|monthly|daily_streak|streak/i.test(String(key)))
            .reduce((sum, [, value]) => sum + Number(value), 0);

        const questsCompleted = Math.max(toNumber(data.questsCompleted), questsFromAchievements);
        const totalKills = toNumber(achievements.general_kills) > 0
            ? toNumber(achievements.general_kills)
            : Math.floor(totalKillsFromStats);

        const totalWins = Math.max(toNumber(data.networkWins), Math.floor(totalWinsFromStats));

        document.getElementById('playerLevel').innerText = Math.floor(data.networkLevel || 0);
        document.getElementById('playerKarma').innerText = toNumber(data.karma).toLocaleString('en-US');
        document.getElementById('playerAchPoints').innerText = achievementPoints.toLocaleString('en-US');
        document.getElementById('playerQuests').innerText = questsCompleted.toLocaleString('en-US');
        document.getElementById('playerTotalCoins').innerText = totalCoins.toLocaleString('en-US');
        document.getElementById('playerWins').innerText = totalWins.toLocaleString('en-US');
        document.getElementById('playerKills').innerText = totalKills.toLocaleString('en-US');
        document.getElementById('playerFirstLogin').innerText = formatFullDate(data.firstLogin);
        document.getElementById('playerLatestLogin').innerText = formatFullDate(data.latestLogin);
        const playerStatus = document.getElementById('playerStatus');
        const isOnline = Boolean(data.online);
        playerStatus.innerText = isOnline ? 'Online' : 'Offline';
        playerStatus.classList.toggle('status-online', isOnline);
        playerStatus.classList.toggle('status-offline', !isOnline);

        const playerServerTypeRow = document.getElementById('playerServerTypeRow');
        const playerServerType = String(data.serverType || '').trim();

        if (isOnline && playerServerType) {
            document.getElementById('playerServerType').innerText = playerServerType;
            playerServerTypeRow.classList.remove('hidden');
        } else {
            playerServerTypeRow.classList.add('hidden');
        }

        const guildNameEl = document.getElementById('guildName');
        if (data.guild) {
            guildNameEl.innerText = data.guild.name;
            document.getElementById('guildMembers').innerText = data.guild.members;
            document.getElementById('guildRank').innerText = data.guild.playerRank;
            guildNameEl.classList.add('guild-name-link');
            guildNameEl.onclick = () => openGuildStatsByName(data.guild.name);
            document.getElementById('guildInfo').classList.remove('hidden');
            document.getElementById('noGuildText').classList.add('hidden');
        } else {
            guildNameEl.classList.remove('guild-name-link');
            guildNameEl.onclick = null;
            document.getElementById('guildInfo').classList.add('hidden');
            document.getElementById('noGuildText').innerText = 'Not in a guild.';
            document.getElementById('noGuildText').classList.remove('hidden');
        }

        const socialCard = document.getElementById('socialCard');
        const socialIconsContainer = document.getElementById('socialIconsContainer');
        socialIconsContainer.innerHTML = '';

        if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
            socialCard.classList.remove('hidden');

            const iconsMap = {
                'YOUTUBE': { class: 'fa-youtube social-youtube' },
                'TWITTER': { class: 'fa-twitter social-twitter' },
                'TWITCH': { class: 'fa-twitch social-twitch' },
                'INSTAGRAM': { class: 'fa-instagram social-instagram' },
                'DISCORD': { class: 'fa-discord social-discord' }
            };

            for (const [platform, link] of Object.entries(data.socialMedia)) {
                if (iconsMap[platform]) {
                    if (platform === 'DISCORD' && !link.startsWith('http')) {
                        socialIconsContainer.innerHTML += `
                            <a href="javascript:void(0)" title="Discord: ${link}" onclick="alert('Discord: ${link}')">
                                <i class="fa-brands ${iconsMap[platform].class}"></i>
                            </a>`;
                    } else {
                        let formattedLink = link;
                        if (!formattedLink.startsWith('http')) {
                            formattedLink = 'https://' + formattedLink;
                        }
                        
                        socialIconsContainer.innerHTML += `
                            <a href="${formattedLink}" target="_blank" title="${platform}">
                                <i class="fa-brands ${iconsMap[platform].class}"></i>
                            </a>`;
                    }
                }
            }
        } else {
            socialCard.classList.add('hidden');
        }

        generateGeneralStats(data, accordion);
        generateSpecialRating(statsData, accordion);

        if (statsData.Quake) {
            const q = statsData.Quake;
            const qFields = ['kills', 'deaths', 'headshots', 'wins', 'shots_fired', 'distance_travelled', 'kills_godlike', 'killstreaks'];
            
            qFields.forEach(f => {
                q[`${f}_overall`] = (q[f] || 0) + (q[`${f}_teams`] || 0);
            });
        }

        const gamesToRender = [];

        for (const [gameKey, config] of Object.entries(GAMES_CONFIG_DETAILED)) {
            if (statsData[gameKey]) {
                gamesToRender.push({ type: 'detailed', gameKey, config });
            } else if (gameKey === 'SkyClash' || gameKey === 'Paintball' || gameKey === 'SpeedUHC') {
                gamesToRender.push({ type: 'detailed', gameKey, config });
            }
        }

        for (const [gameKey, config] of Object.entries(GAMES_CONFIG_SIMPLE)) {
            gamesToRender.push({ type: 'simple', gameKey, config });
        }

        gamesToRender.sort((a, b) => a.config.name.localeCompare(b.config.name, 'en', { sensitivity: 'base' }));

        for (const game of gamesToRender) {
            if (game.type === 'detailed') {
                generateDetailedTableAccordion(game.gameKey, game.config, statsData[game.gameKey] || {}, accordion, data);
            } else {
                generateSimpleStatsAccordion(game.gameKey, game.config, statsData[game.gameKey] || {}, accordion);
            }
        }

        addRecentPlayerSearch(username);
        resultsPage.classList.remove('hidden');

    } catch (error) {
        errorDiv.innerText = error.message;
        errorDiv.classList.remove('hidden');
        searchPage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
