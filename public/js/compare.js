async function comparePlayers() {
    const firstInput = document.getElementById('compareFirstInput');
    const secondInput = document.getElementById('compareSecondInput');
    const errorEl = document.getElementById('comparatorError');
    const resultEl = document.getElementById('comparatorResult');
    const modesEl = document.getElementById('comparatorModes');
    const comparatorPage = document.getElementById('comparatorPage');
    const comparatorResultsPage = document.getElementById('comparatorResultsPage');
    const loading = document.getElementById('loading');

    const firstName = String(firstInput?.value || '').trim();
    const secondName = String(secondInput?.value || '').trim();

    if (!firstName || !secondName) {
        errorEl.innerText = 'Please enter both player names';
        errorEl.classList.remove('hidden');
        resultEl.classList.add('hidden');
        if (modesEl) modesEl.innerHTML = '';
        return;
    }

    errorEl.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const [firstData, secondData] = await Promise.all([
            fetchApiJson(`/api/stats/${encodeURIComponent(firstName)}`, `Игрок не найден: ${firstName}`),
            fetchApiJson(`/api/stats/${encodeURIComponent(secondName)}`, `Игрок не найден: ${secondName}`)
        ]);

        const toNum = (value) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        const getTotals = (data) => {
            const statsData = data.stats || {};
            const achievements = data.achievements || {};

            const sumExistingKeys = (source, keys) => keys.reduce((sum, key) => sum + toNum(source[key]), 0);
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

            let totalKillsFromStats = 0;
            let totalWinsFromStats = 0;

            for (const [gameKey, game] of Object.entries(statsData)) {
                if (!game || typeof game !== 'object') continue;
                totalKillsFromStats += pickBestAggregate(game, killPrimaryKeys, killFallbackKeys);
                totalWinsFromStats += pickBestAggregate(game, winPrimaryKeys, winFallbackKeys);

                if (gameKey === 'Pit' && game.pit_stats_pt && typeof game.pit_stats_pt === 'object') {
                    totalKillsFromStats += toNum(game.pit_stats_pt.kills);
                    totalWinsFromStats += toNum(game.pit_stats_pt.wins);
                }
            }

            const totalKills = toNum(achievements.general_kills) > 0
                ? toNum(achievements.general_kills)
                : Math.floor(totalKillsFromStats);

            const totalWins = Math.max(
                toNum(data.networkWins),
                toNum(achievements.general_wins),
                Math.floor(totalWinsFromStats)
            );

            return { totalWins, totalKills };
        };

        const getModeStatForComparator = (source, gameKey, mode, field) => {
            const gameStats = source && typeof source === 'object' ? source : {};
            const prefix = String(mode?.apiPrefix || '').toLowerCase();
            const suffix = String(mode?.apiSuffix || '').toLowerCase();
            const hasModeScope = Boolean(prefix || suffix);
            const cleanPrefix = prefix.endsWith('_') ? prefix.slice(0, -1) : prefix;
            const cleanSuffix = suffix.startsWith('_') ? suffix.slice(1) : suffix;

            if (gameKey === 'SuperSmash') {
                const smashClassKeyMap = {
                    'bulk': 'THE_BULK',
                    'tinman': 'TINMAN',
                    'cake monster': 'CAKE_MONSTER',
                    'marauder': 'MARAUDER',
                    'void crawler': 'DUSK_CRAWLER',
                    'general cluck': 'GENERAL_CLUCK',
                    'skull fire': 'SKULLFIRE',
                    'sanic': 'SANIC',
                    'shoop': 'SHOOP_DA_WHOOP',
                    'spooderman': 'SPODERMAN',
                    'cryomancer': 'FROSTY',
                    'karakot': 'GOKU',
                    'botmon': 'BOTMUN',
                    'pug': 'PUG',
                    'sergeant shield': 'SGT_SHIELD',
                    'green hood': 'GREEN_HOOD'
                };
                const smashClassKey = smashClassKeyMap[String(mode.Mode || '').toLowerCase()];
                const classStats = smashClassKey && gameStats && typeof gameStats === 'object' && gameStats.class_stats && typeof gameStats.class_stats === 'object'
                    ? gameStats.class_stats[smashClassKey]
                    : null;
                const parse = (value) => {
                    const parsed = Number(value);
                    return Number.isFinite(parsed) ? parsed : null;
                };

                if (classStats && typeof classStats === 'object') {
                    if (['kills', 'deaths', 'wins', 'losses'].includes(field)) {
                        const exact = parse(classStats[field]);
                        if (exact !== null) return exact;

                        if (field === 'losses') {
                            const wins = parse(classStats.wins) || 0;
                            const games = parse(classStats.games);
                            if (games !== null) return Math.max(0, Math.floor(games - wins));
                        }

                        return 0;
                    }
                }

            }

            const aliases = field === 'deaths'
                ? ['deaths', 'death']
                : field === 'losses'
                    ? ['losses', 'loss']
                    : field === 'final_deaths'
                        ? ['final_deaths', 'final_death']
                        : field === 'final_kills'
                            ? ['final_kills', 'final_kill']
                            : field === 'beds'
                                ? ['beds_broken', 'beds', 'bed_break', 'bed_breaks']
                                : field === 'blitz_level'
                                    ? ['blitz_level', 'level']
                                : [field];

            const candidates = [];
            for (const alias of aliases) {
                if (hasModeScope) {
                    if (prefix && suffix) {
                        candidates.push(`${prefix}${alias}${suffix}`, `${prefix}${alias}`, `${alias}${suffix}`);
                    } else if (prefix) {
                        candidates.push(`${prefix}${alias}`);
                    } else if (suffix) {
                        candidates.push(`${alias}${suffix}`);
                    }
                } else {
                    candidates.push(alias);
                }

                if (gameKey === 'Bedwars') {
                    if (hasModeScope) {
                        candidates.push(
                            `${prefix}${alias}_bedwars${suffix}`,
                            `${prefix}${alias}_bedwars`,
                            `${prefix}${alias}${suffix}_bedwars`,
                            cleanSuffix ? `${prefix}${alias}_bedwars_${cleanSuffix}` : '',
                            `${alias}_${cleanPrefix}_bedwars`,
                            `${cleanPrefix}_${alias}_bedwars`
                        );
                    } else {
                        candidates.push(`${alias}_bedwars${suffix}`, `${alias}_bedwars`);
                    }
                }

                if (gameKey === 'HungerGames' && hasModeScope) {
                    candidates.push(
                        `${cleanPrefix}_blitz_level`,
                        `${cleanPrefix}blitz_level`,
                        `${cleanPrefix}_level`,
                        `${cleanPrefix}level`
                    );

                    if (cleanSuffix) {
                        candidates.push(
                            `${cleanPrefix}_blitz_level_${cleanSuffix}`,
                            `${cleanPrefix}_level_${cleanSuffix}`
                        );
                    }
                }
            }

            if (gameKey === 'Duels') {
                const duelMode = String(mode?.Mode || '').toLowerCase();
                const duelAliasPrefixes = {
                    'uhc tournament': ['uhc_tournament_', 'uhc_meetup_'],
                    'skywars tournament': ['sw_tournament_', 'skywars_tournament_'],
                    'sumo tournament': ['sumo_tournament_', 'sumo_tourney_'],
                    'bridge 1v1': ['bridge_duel_', 'bridge_1v1_'],
                    'bridge 2v2': ['bridge_doubles_', 'bridge_2v2_', 'bridge_double_'],
                    'bridge 3v3': ['bridge_threes_', 'bridge_3v3_', 'bridge_three_'],
                    'bridge 4v4': ['bridge_four_', 'bridge_4v4_'],
                    'no debuff 1v1': ['no_debuff_duel_', 'potion_duel_', 'nodebuff_duel_'],
                    'nodebuff 1x1': ['no_debuff_duel_', 'potion_duel_', 'nodebuff_duel_'],
                    'nodebuff 1v1': ['no_debuff_duel_', 'potion_duel_', 'nodebuff_duel_']
                };

                const extraPrefixes = duelAliasPrefixes[duelMode] || [];
                const allPrefixes = Array.from(new Set([prefix, ...extraPrefixes].filter(Boolean)));
                const cleanAliasPrefix = (value) => String(value).replace(/_+$/g, '');

                for (const alias of aliases) {
                    for (const ap of allPrefixes) {
                        const cleanAp = cleanAliasPrefix(ap);
                        candidates.push(
                            `${ap}${alias}`,
                            `${alias}_${cleanAp}`,
                            `${cleanAp}_${alias}`,
                            `${alias}${cleanAp}`,
                            `${cleanAp}${alias}`
                        );
                    }
                }
            }

            const found = getNumberFromStatKeys(gameStats, candidates.filter(Boolean));
            if (Number.isFinite(found)) return found;

            if (gameKey === 'Arena' && suffix) {
                const modeToken = cleanSuffix;
                const otherModes = ['1v1', '2v2', '4v4'].filter(token => token !== modeToken);

                const arenaExactCandidates = [];
                for (const alias of aliases) {
                    arenaExactCandidates.push(
                        `${alias}${suffix}`,
                        `${alias}_${modeToken}`,
                        `${modeToken}_${alias}`,
                        `arena_${alias}${suffix}`,
                        `arena_${alias}_${modeToken}`,
                        `${alias}_${modeToken}_arena`
                    );
                }

                const arenaExact = getNumberFromStatKeys(gameStats, arenaExactCandidates.filter(Boolean));
                if (Number.isFinite(arenaExact)) return arenaExact;

                for (const [statKey, statValue] of Object.entries(gameStats)) {
                    const key = String(statKey || '').toLowerCase();
                    if (!key.includes(modeToken)) continue;
                    if (otherModes.some(token => key.includes(token))) continue;

                    const hasAlias = aliases.some(alias => key.includes(String(alias).toLowerCase()));
                    if (!hasAlias) continue;

                    const parsed = Number(statValue);
                    if (Number.isFinite(parsed)) return parsed;
                }
            }

            return 0;
        };

        const getClassForPair = (leftValue, rightValue, preferHigher, side) => {
            if (leftValue === rightValue) return '';
            const leftWins = preferHigher ? leftValue > rightValue : leftValue < rightValue;
            const rightWins = preferHigher ? rightValue > leftValue : rightValue < leftValue;

            if (side === 'left') return leftWins ? 'cmp-better' : rightWins ? 'cmp-worse' : '';
            return rightWins ? 'cmp-better' : leftWins ? 'cmp-worse' : '';
        };

        const renderModeComparisons = (firstData, secondData) => {
            if (!modesEl) return;

            const firstStats = firstData.stats || {};
            const secondStats = secondData.stats || {};

            const gameCards = [];
            const comparatorGames = [
                'Arcade',
                'Arena',
                'Battleground',
                'Bedwars',
                'Duels',
                'GingerBread',
                'HungerGames',
                'Legacy',
                'MCGO',
                'MurderMystery',
                'Paintball',
                'Quake',
                'SkyClash',
                'SkyWars',
                'SpeedUHC',
                'SuperSmash',
                'TNTGames',
                'TrueCombat',
                'UHC',
                'VampireZ',
                'Walls3'
            ];
            const getComparatorConfig = (gameKey) => {
                return GAMES_CONFIG_DETAILED[gameKey]
                    || (typeof GAMES_CONFIG_SIMPLE === 'object' ? GAMES_CONFIG_SIMPLE[gameKey] : null)
                    || null;
            };

            const sortedComparatorGames = comparatorGames
                .filter(gameKey => Boolean(getComparatorConfig(gameKey)))
                .sort((leftKey, rightKey) => {
                    const leftName = String(getComparatorConfig(leftKey)?.name || leftKey);
                    const rightName = String(getComparatorConfig(rightKey)?.name || rightKey);
                    return leftName.localeCompare(rightName, 'en', { sensitivity: 'base' });
                });

            const getComparatorOverallFields = (gameKey, config) => {
                if (gameKey === 'MurderMystery') {
                    const mmModeValue = (stats, suffix, key) => {
                        if (!suffix) return Number(stats?.[key] || 0);
                        return Number(stats?.[`${key}${suffix}`] || 0);
                    };

                    const mmModeKd = (stats, suffix) => {
                        const kills = mmModeValue(stats, suffix, 'kills');
                        const deaths = mmModeValue(stats, suffix, 'deaths');
                        return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                    };

                    const mmModeWl = (stats, suffix) => {
                        const wins = mmModeValue(stats, suffix, 'wins');
                        const deaths = mmModeValue(stats, suffix, 'deaths');
                        if (deaths > 0) return parseFloat((wins / deaths).toFixed(3));
                        return wins > 0 ? '∞' : 0;
                    };

                    return [
                        { label: 'Coins', key: 'coins' },
                        { label: 'Kills', key: 'kills' },
                        { label: 'Wins', key: 'wins' },
                        { label: 'Deaths', key: 'deaths' },
                        { label: 'Bow Kills', key: 'bow_kills' },
                        { label: 'Hero Kills', key: 'was_hero' },
                        { label: 'K/D', calc: s => s.deaths ? parseFloat((Number(s.kills || 0) / Number(s.deaths || 1)).toFixed(3)) : Number(s.kills || 0) },
                        { label: 'W/L', calc: s => Number(s.deaths || 0) > 0 ? parseFloat((Number(s.wins || 0) / Number(s.deaths || 1)).toFixed(3)) : (Number(s.wins || 0) > 0 ? '∞' : 0) },

                        { section: 'Classic Stats' },
                        { label: 'Kills', calc: s => mmModeValue(s, '_MURDER_CLASSIC', 'kills') },
                        { label: 'Wins', calc: s => mmModeValue(s, '_MURDER_CLASSIC', 'wins') },
                        { label: 'Deaths', calc: s => mmModeValue(s, '_MURDER_CLASSIC', 'deaths') },
                        { label: 'Bow Kills', calc: s => mmModeValue(s, '_MURDER_CLASSIC', 'bow_kills') },
                        { label: 'K/D', calc: s => mmModeKd(s, '_MURDER_CLASSIC') },
                        { label: 'W/L', calc: s => mmModeWl(s, '_MURDER_CLASSIC') },

                        { section: 'Hardcore Stats' },
                        { label: 'Kills', calc: s => mmModeValue(s, '_MURDER_HARDCORE', 'kills') },
                        { label: 'Wins', calc: s => mmModeValue(s, '_MURDER_HARDCORE', 'wins') },
                        { label: 'Deaths', calc: s => mmModeValue(s, '_MURDER_HARDCORE', 'deaths') },
                        { label: 'Bow Kills', calc: s => mmModeValue(s, '_MURDER_HARDCORE', 'bow_kills') },
                        { label: 'K/D', calc: s => mmModeKd(s, '_MURDER_HARDCORE') },
                        { label: 'W/L', calc: s => mmModeWl(s, '_MURDER_HARDCORE') },

                        { section: 'Assassins Stats' },
                        { label: 'Kills', calc: s => mmModeValue(s, '_MURDER_ASSASSINS', 'kills') },
                        { label: 'Wins', calc: s => mmModeValue(s, '_MURDER_ASSASSINS', 'wins') },
                        { label: 'Deaths', calc: s => mmModeValue(s, '_MURDER_ASSASSINS', 'deaths') },
                        { label: 'Bow Kills', calc: s => mmModeValue(s, '_MURDER_ASSASSINS', 'bow_kills') },
                        { label: 'K/D', calc: s => mmModeKd(s, '_MURDER_ASSASSINS') },
                        { label: 'W/L', calc: s => mmModeWl(s, '_MURDER_ASSASSINS') }
                    ];
                }

                if (gameKey === 'UHC') {
                    return [
                        { label: 'Coins', key: 'coins' },
                        { label: 'Score', key: 'score' },
                        { section: 'Teams' },
                        { label: 'Teams Kills', calc: s => getUhcModeStat(s, 'teams', 'kills') },
                        { label: 'Teams Deaths', calc: s => getUhcModeStat(s, 'teams', 'deaths') },
                        { label: 'Teams Wins', calc: s => getUhcModeStat(s, 'teams', 'wins') },
                        { label: 'Teams K/D', calc: s => {
                            const kills = Number(getUhcModeStat(s, 'teams', 'kills')) || 0;
                            const deaths = Number(getUhcModeStat(s, 'teams', 'deaths')) || 0;
                            return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                        }},
                        { section: 'Solo' },
                        { label: 'Solo Kills', calc: s => getUhcModeStat(s, 'solo', 'kills') },
                        { label: 'Solo Deaths', calc: s => getUhcModeStat(s, 'solo', 'deaths') },
                        { label: 'Solo Wins', calc: s => getUhcModeStat(s, 'solo', 'wins') },
                        { label: 'Solo K/D', calc: s => {
                            const kills = Number(getUhcModeStat(s, 'solo', 'kills')) || 0;
                            const deaths = Number(getUhcModeStat(s, 'solo', 'deaths')) || 0;
                            return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                        }}
                    ];
                }

                if (gameKey === 'Paintball') {
                    return (config.overall || []).filter(field => {
                        const label = String(field?.label || '').toLowerCase();
                        return !label.includes('time in forcefield');
                    });
                }

                if (gameKey === 'Quake') {
                    return [
                        { label: 'Coins', key: 'coins' },
                        { label: 'Highest Killstreak', key: 'highest_killstreak' },
                        { label: 'Dash Power', key: 'dash_power' },
                        { label: 'Dash Cooldown', key: 'dash_cooldown' }
                    ];
                }

                // Для простых конфигов (из GAMES_CONFIG_SIMPLE) преобразуем fields в overall формат
                if (config.fields && !config.overall) {
                    if (Array.isArray(config.fields)) {
                        return config.fields;
                    }
                    if (typeof config.fields === 'object') {
                        return Object.entries(config.fields).map(([label, fieldConfig]) => ({
                            label,
                            calc: typeof fieldConfig.calc === 'function'
                                ? fieldConfig.calc
                                : (s) => {
                                    if (Array.isArray(fieldConfig.keys)) {
                                        for (const key of fieldConfig.keys) {
                                            if (s[key] !== undefined && s[key] !== null) {
                                                return s[key];
                                            }
                                        }
                                    }
                                    return 0;
                                }
                        }));
                    }
                }

                return config.overall || [];
            };

            const getComparatorMetricConfig = (gameKey) => {
                if (gameKey === 'Bedwars') {
                    return [
                        { label: 'Kills', field: 'kills', preferHigher: true, type: 'number' },
                        { label: 'Wins', field: 'wins', preferHigher: true, type: 'number' },
                        { label: 'Deaths', field: 'deaths', preferHigher: false, type: 'number' },
                        { label: 'Losses', field: 'losses', preferHigher: false, type: 'number' },
                        { label: 'Final Kills', field: 'final_kills', preferHigher: true, type: 'number' },
                        { label: 'Final Deaths', field: 'final_deaths', preferHigher: false, type: 'number' },
                        { label: 'Beds', field: 'beds', preferHigher: true, type: 'number' },
                        { label: 'K/D', field: 'kd', preferHigher: true, type: 'ratio' },
                        { label: 'Final K/D', field: 'final_kd', preferHigher: true, type: 'ratio' },
                        { label: 'W/L', field: 'wl', preferHigher: true, type: 'ratio' }
                    ];
                }

                if (gameKey === 'SkyWars') {
                    return [
                        { label: 'Kills', field: 'kills', preferHigher: true, type: 'number' },
                        { label: 'Wins', field: 'wins', preferHigher: true, type: 'number' },
                        { label: 'Deaths', field: 'deaths', preferHigher: false, type: 'number' },
                        { label: 'Losses', field: 'losses', preferHigher: false, type: 'number' },
                        { label: 'K/D', field: 'kd', preferHigher: true, type: 'ratio' },
                        { label: 'W/L', field: 'wl', preferHigher: true, type: 'ratio' }
                    ];
                }

                if (gameKey === 'HungerGames') {
                    return [
                        { label: 'Level', field: 'blitz_level', preferHigher: true, type: 'number' }
                    ];
                }

                if (gameKey === 'MurderMystery') {
                    return [
                        { label: 'Kills', field: 'kills', preferHigher: true, type: 'number' },
                        { label: 'Wins', field: 'wins', preferHigher: true, type: 'number' },
                        { label: 'Deaths', field: 'deaths', preferHigher: false, type: 'number' },
                        { label: 'Hero', field: 'was_hero', preferHigher: true, type: 'number' },
                        { label: 'Bow Kills', field: 'bow_kills', preferHigher: true, type: 'number' }
                    ];
                }

                return [
                    { label: 'Kills', field: 'kills', preferHigher: true, type: 'number' },
                    { label: 'Wins', field: 'wins', preferHigher: true, type: 'number' },
                    { label: 'Deaths', field: 'deaths', preferHigher: false, type: 'number' },
                    { label: 'Losses', field: 'losses', preferHigher: false, type: 'number' }
                ];
            };

            const getRatioValue = (num, den) => den > 0 ? parseFloat((num / den).toFixed(3)) : num;
            const formatMetricValue = (value, type) => {
                if (!Number.isFinite(value)) return '0';
                return type === 'ratio' ? value.toFixed(3) : value.toLocaleString('en-US');
            };

            const normalizeValue = (value) => {
                if (typeof value === 'number' && Number.isFinite(value)) return value;
                if (typeof value === 'string') {
                    const cleaned = value.replace(/,/g, '').trim();
                    const numeric = Number(cleaned);
                    if (Number.isFinite(numeric)) return numeric;
                }
                const numeric = Number(value);
                return Number.isFinite(numeric) ? numeric : 0;
            };

            const resolveOverallValue = (stats, field) => {
                if (!field || typeof field !== 'object') return 0;
                if (typeof field.calc === 'function') return field.calc(stats || {});
                if (typeof field.key === 'string') return (stats || {})[field.key] ?? 0;
                return 0;
            };

            const formatOverallValue = (value) => {
                if (typeof value === 'number' && Number.isNaN(value)) return '0';
                if (typeof value === 'number' && Number.isFinite(value)) {
                    if (!Number.isInteger(value)) return value.toFixed(3);
                    return value.toLocaleString('en-US');
                }

                const normalized = normalizeValue(value);
                if (String(value).includes(':')) return String(value);
                if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value.replace(/,/g, '').trim()))) {
                    if (!Number.isInteger(normalized)) return normalized.toFixed(3);
                    return normalized.toLocaleString('en-US');
                }

                return String(value ?? 0);
            };

            const isLowerBetter = (label) => /deaths?|loss(es)?/i.test(String(label || ''));

            for (const gameKey of sortedComparatorGames) {
                const config = getComparatorConfig(gameKey);
                if (!config) continue;
                const hasModes = Array.isArray(config.modes) && config.modes.length > 0;

                const firstGameStats = firstStats[gameKey] || {};
                const secondGameStats = secondStats[gameKey] || {};
                const metrics = getComparatorMetricConfig(gameKey);

                const overallRows = getComparatorOverallFields(gameKey, config)
                .filter(field => {
                    if (field && typeof field === 'object' && field.section) return true;
                    if (gameKey !== 'Duels') return true;
                    const label = String(field?.label || '').toLowerCase();
                    return !label.includes('winstreak');
                })
                .map(field => {
                    if (field && typeof field === 'object' && field.section) {
                        return `
                        <tr class="comparator-overall-section-row">
                            <td colspan="3" class="comparator-overall-section-title">${String(field.section)}</td>
                        </tr>
                    `;
                    }

                    const label = field?.label || 'Stat';
                    const leftRaw = resolveOverallValue(firstGameStats, field);
                    const rightRaw = resolveOverallValue(secondGameStats, field);

                    const leftNum = normalizeValue(leftRaw);
                    const rightNum = normalizeValue(rightRaw);
                    const comparable = Number.isFinite(leftNum) && Number.isFinite(rightNum) && !String(leftRaw).includes(':') && !String(rightRaw).includes(':');

                    let leftClass = '';
                    let rightClass = '';

                    if (comparable && leftNum !== rightNum) {
                        const preferHigher = !isLowerBetter(label);
                        leftClass = getClassForPair(leftNum, rightNum, preferHigher, 'left');
                        rightClass = getClassForPair(leftNum, rightNum, preferHigher, 'right');
                    }

                    return `
                        <tr>
                            <td>${label}</td>
                            <td class="${leftClass}">${formatOverallValue(leftRaw)}</td>
                            <td class="${rightClass}">${formatOverallValue(rightRaw)}</td>
                        </tr>
                    `;
                }).join('');

                const modesToRender = gameKey === 'MurderMystery'
                    ? config.modes.filter(mode => ['All', 'Classic', 'Assassins', 'Hardcore'].includes(String(mode.Mode || '')))
                    : config.modes;

                const rows = hasModes ? modesToRender.map(mode => {
                    const base = {
                        left: {
                            kills: getModeStatForComparator(firstGameStats, gameKey, mode, 'kills'),
                            wins: getModeStatForComparator(firstGameStats, gameKey, mode, 'wins'),
                            deaths: getModeStatForComparator(firstGameStats, gameKey, mode, 'deaths'),
                            was_hero: getModeStatForComparator(firstGameStats, gameKey, mode, 'was_hero'),
                            bow_kills: getModeStatForComparator(firstGameStats, gameKey, mode, 'bow_kills'),
                            losses: getModeStatForComparator(firstGameStats, gameKey, mode, 'losses'),
                            final_kills: getModeStatForComparator(firstGameStats, gameKey, mode, 'final_kills'),
                            final_deaths: getModeStatForComparator(firstGameStats, gameKey, mode, 'final_deaths'),
                            beds: getModeStatForComparator(firstGameStats, gameKey, mode, 'beds'),
                            blitz_level: getModeStatForComparator(firstGameStats, gameKey, mode, 'blitz_level')
                        },
                        right: {
                            kills: getModeStatForComparator(secondGameStats, gameKey, mode, 'kills'),
                            wins: getModeStatForComparator(secondGameStats, gameKey, mode, 'wins'),
                            deaths: getModeStatForComparator(secondGameStats, gameKey, mode, 'deaths'),
                            was_hero: getModeStatForComparator(secondGameStats, gameKey, mode, 'was_hero'),
                            bow_kills: getModeStatForComparator(secondGameStats, gameKey, mode, 'bow_kills'),
                            losses: getModeStatForComparator(secondGameStats, gameKey, mode, 'losses'),
                            final_kills: getModeStatForComparator(secondGameStats, gameKey, mode, 'final_kills'),
                            final_deaths: getModeStatForComparator(secondGameStats, gameKey, mode, 'final_deaths'),
                            beds: getModeStatForComparator(secondGameStats, gameKey, mode, 'beds'),
                            blitz_level: getModeStatForComparator(secondGameStats, gameKey, mode, 'blitz_level')
                        }
                    };

                    const valueByField = {
                        left: {
                            ...base.left,
                            kd: getRatioValue(base.left.kills, base.left.deaths),
                            final_kd: getRatioValue(base.left.final_kills, base.left.final_deaths),
                            wl: getRatioValue(base.left.wins, base.left.losses)
                        },
                        right: {
                            ...base.right,
                            kd: getRatioValue(base.right.kills, base.right.deaths),
                            final_kd: getRatioValue(base.right.final_kills, base.right.final_deaths),
                            wl: getRatioValue(base.right.wins, base.right.losses)
                        }
                    };

                    const hasMetricData = metrics.some(metric => {
                        const leftValue = Number(valueByField.left[metric.field] || 0);
                        const rightValue = Number(valueByField.right[metric.field] || 0);
                        return leftValue > 0 || rightValue > 0;
                    });

                    const keepZeroModeRow = gameKey === 'Arena' || gameKey === 'MurderMystery';

                    if (!hasMetricData && !keepZeroModeRow) return '';

                    const metricCells = metrics.map(metric => {
                        const leftValue = valueByField.left[metric.field] || 0;
                        const rightValue = valueByField.right[metric.field] || 0;
                        const leftClass = getClassForPair(leftValue, rightValue, metric.preferHigher, 'left');
                        const rightClass = getClassForPair(leftValue, rightValue, metric.preferHigher, 'right');

                        return `
                            <td class="${leftClass}">${formatMetricValue(leftValue, metric.type)}</td>
                            <td class="${rightClass} cmp-pair-end">${formatMetricValue(rightValue, metric.type)}</td>
                        `;
                    }).join('');

                    return `
                        <tr>
                            <td>${mode.Mode}</td>
                            ${metricCells}
                        </tr>
                    `;
                }).filter(Boolean).join('') : '';

                const showModes = hasModes && ['Arena', 'Bedwars', 'MurderMystery', 'Quake', 'SkyClash', 'SkyWars', 'SpeedUHC'].includes(gameKey) && rows.length > 0;

                if (!overallRows && !showModes) continue;

                const metricHeaders = metrics.map(metric => `
                    <th><span class="cmp-head-name">${firstData.name}</span><span class="cmp-head-metric">${metric.label}</span></th>
                    <th class="cmp-pair-end"><span class="cmp-head-name">${secondData.name}</span><span class="cmp-head-metric">${metric.label}</span></th>
                `).join('');

                gameCards.push(`
                    <div class="comparator-mode-card">
                        <div class="comparator-mode-title">${config.name}</div>
                        <div class="comparator-section-label">Overall</div>
                        <div class="stats-table-wrapper">
                            <table class="comparator-mode-table comparator-overall-table">
                                <thead>
                                    <tr>
                                        <th>Stat</th>
                                        <th>${firstData.name}</th>
                                        <th>${secondData.name}</th>
                                    </tr>
                                </thead>
                                <tbody>${overallRows}</tbody>
                            </table>
                        </div>

                        ${showModes ? `
                        <div class="comparator-section-label">Modes</div>
                        <div class="stats-table-wrapper">
                            <table class="comparator-mode-table">
                                <thead>
                                    <tr>
                                        <th>Mode</th>
                                        ${metricHeaders}
                                    </tr>
                                </thead>
                                <tbody>${rows}</tbody>
                            </table>
                        </div>` : ''}
                    </div>
                `);
            }

            modesEl.innerHTML = gameCards.length > 0
                ? gameCards.join('')
                : '<div class="comparator-mode-card"><div class="comparator-mode-title">Mini-mode comparison</div><div>No detailed mode stats found for these players.</div></div>';
        };

        const fill = (prefix, data) => {
            const totals = getTotals(data);
            const nameEl = document.getElementById(`${prefix}Name`);
            const safeName = String(data.name || 'Unknown')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            const rankPrefix = String(data.rankHtml || '').trim();
            const rankColor = String(data.rankColor || '').trim();
            const prefixStyle = rankColor ? ` style="color:${rankColor};"` : '';
            const nameStyle = rankColor ? ` style="color:${rankColor};"` : '';

            nameEl.innerHTML = rankPrefix
                ? `<span class="cmp-rank-prefix"${prefixStyle}>${rankPrefix}</span> <span${nameStyle}>${safeName}</span>`
                : safeName;

            document.getElementById(`${prefix}Level`).innerText = Math.floor(toNum(data.networkLevel)).toLocaleString('en-US');
            document.getElementById(`${prefix}Karma`).innerText = toNum(data.karma).toLocaleString('en-US');
            document.getElementById(`${prefix}Ach`).innerText = toNum(data.achievementPoints).toLocaleString('en-US');
            document.getElementById(`${prefix}Quests`).innerText = toNum(data.questsCompleted).toLocaleString('en-US');
            document.getElementById(`${prefix}Wins`).innerText = totals.totalWins.toLocaleString('en-US');
            document.getElementById(`${prefix}Kills`).innerText = totals.totalKills.toLocaleString('en-US');

            return {
                level: Math.floor(toNum(data.networkLevel)),
                karma: toNum(data.karma),
                ach: toNum(data.achievementPoints),
                quests: toNum(data.questsCompleted),
                wins: totals.totalWins,
                kills: totals.totalKills
            };
        };

        const applyMainCompareClass = (aValue, bValue, aId, bId, preferHigher = true) => {
            const aEl = document.getElementById(aId);
            const bEl = document.getElementById(bId);
            if (!aEl || !bEl) return;

            aEl.classList.remove('cmp-better', 'cmp-worse');
            bEl.classList.remove('cmp-better', 'cmp-worse');

            if (aValue === bValue) return;

            const aBetter = preferHigher ? aValue > bValue : aValue < bValue;
            if (aBetter) {
                aEl.classList.add('cmp-better');
                bEl.classList.add('cmp-worse');
            } else {
                aEl.classList.add('cmp-worse');
                bEl.classList.add('cmp-better');
            }
        };

        const mainA = fill('cmpPlayerA', firstData);
        const mainB = fill('cmpPlayerB', secondData);

        applyMainCompareClass(mainA.level, mainB.level, 'cmpPlayerALevel', 'cmpPlayerBLevel');
        applyMainCompareClass(mainA.karma, mainB.karma, 'cmpPlayerAKarma', 'cmpPlayerBKarma');
        applyMainCompareClass(mainA.ach, mainB.ach, 'cmpPlayerAAch', 'cmpPlayerBAch');
        applyMainCompareClass(mainA.quests, mainB.quests, 'cmpPlayerAQuests', 'cmpPlayerBQuests');
        applyMainCompareClass(mainA.wins, mainB.wins, 'cmpPlayerAWins', 'cmpPlayerBWins');
        applyMainCompareClass(mainA.kills, mainB.kills, 'cmpPlayerAKills', 'cmpPlayerBKills');

        renderModeComparisons(firstData, secondData);
        resultEl.classList.remove('hidden');

        if (comparatorPage) comparatorPage.classList.add('hidden');
        if (comparatorResultsPage) {
            comparatorResultsPage.classList.remove('hidden');
            comparatorResultsPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        errorEl.innerText = error.message || 'Unable to compare players';
        errorEl.classList.remove('hidden');
        resultEl.classList.add('hidden');
        if (modesEl) modesEl.innerHTML = '';

        if (comparatorResultsPage) comparatorResultsPage.classList.add('hidden');
        if (comparatorPage) comparatorPage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
