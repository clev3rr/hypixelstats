// 1. ДЕТАЛЬНЫЙ ВИД (Твои BW и SW + новые)
const GAMES_CONFIG_DETAILED = {
    Bedwars: {
        name: 'Bedwars', icon: 'fa-bed',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills_bedwars' },
            { label: 'Deaths', key: 'deaths_bedwars' },
            { label: 'Wins', key: 'wins_bedwars' },
            { label: 'Losses', key: 'losses_bedwars' },
            { label: 'K/D', calc: s => s.deaths_bedwars ? (s.kills_bedwars / s.deaths_bedwars).toFixed(3) : s.kills_bedwars || 0 },
            { label: 'W/L', calc: s => s.losses_bedwars ? (s.wins_bedwars / s.losses_bedwars).toFixed(3) : s.wins_bedwars || 0 },
            { label: 'Bedwars level', calc: s => getBedwarsLevel(s.Experience) },
            { label: 'Beds Broken', key: 'beds_broken_bedwars' },
            { label: 'Final Kills', key: 'final_kills_bedwars' },
            { label: 'Final Deaths', key: 'final_deaths_bedwars' },
            { label: 'Final K/D', calc: s => s.final_deaths_bedwars ? (s.final_kills_bedwars / s.final_deaths_bedwars).toFixed(3) : s.final_kills_bedwars || 0 },
            { label: 'Final Kill / Normal deaths', calc: s => s.deaths_bedwars ? (s.final_kills_bedwars / s.deaths_bedwars).toFixed(3) : 0 }
        ],
        tableCols: { 'Mode': '', 'Kills': 'kills_bedwars', 'Wins': 'wins_bedwars', 'Deaths': 'deaths_bedwars', 'Losses': 'losses_bedwars', 'Final Kills': 'final_kills_bedwars', 'Final Deaths': 'final_deaths_bedwars', 'Beds': 'beds_broken_bedwars', 'K/D': 'KD', 'Final K/D': 'FinalKD', 'W/L': 'WL' },
        modes: [
            { 'Mode': 'Solo', apiPrefix: 'eight_one_' },
            { 'Mode': 'Doubles', apiPrefix: 'eight_two_' },
            { 'Mode': '3v3v3v3', apiPrefix: 'four_three_' },
            { 'Mode': '4v4v4v4', apiPrefix: 'four_four_' }
        ]
    },
    BuildBattle: {
        name: 'Build Battle', icon: 'fa-hammer',
        overall: [
            { label: 'Score', calc: s => getNumberFromStatKeys(s, ['score_build_battle','score_buildbattle','build_battle_score','score']) || 0 },
            { label: 'Total Wins', calc: s => getNumberFromStatKeys(s, ['wins_build_battle','wins_buildbattle','wins_build','build_battle_wins','wins_battle_build','wins']) || 0 }
        ],
        tableCols: { 'Mode': '', 'Wins': 'wins' },
        modes: [
            { Mode: 'Solo', apiSuffix: '_solo_normal' },
            { Mode: 'Team', apiSuffix: '_teams_normal' },
            { Mode: 'Guess the Build', apiSuffix: '_guess_the_build' },
            { Mode: 'Pro Mode', apiSuffix: '_pro_mode' }
        ]
    },
    SkyWars: {
        name: 'SkyWars', icon: 'fa-cloud',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Assists', key: 'assists' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Wins', key: 'wins' },
            { label: 'Losses', key: 'losses' },
            { label: 'K/D', calc: s => s.deaths ? (s.kills / s.deaths).toFixed(3) : s.kills || 0 },
            { label: 'W/L', calc: s => s.losses ? (s.wins / s.losses).toFixed(3) : s.wins || 0 },
            { label: 'Level', calc: s => (s.levelFormatted || '0').replace(/§./g, '') }, 
            { label: 'Total Heads', key: 'heads' },
            { label: 'Total Souls', key: 'souls' },
            { label: 'Soul Well Usages', key: 'soul_well' },
            { label: 'Time played (DD, HH:MM:SS)', calc: s => formatTime(s.time_played || 0) }
        ],
        tableCols: { 'Mode': '', 'Kills': 'kills', 'Wins': 'wins', 'Deaths': 'deaths', 'Losses': 'losses', 'K/D': 'KD', 'W/L': 'WL' },
        modes: [
            { 'Mode': 'Ranked', apiSuffix: '_ranked' },
            { 'Mode': 'Solo Normal', apiSuffix: '_solo_normal' },
            { 'Mode': 'Solo Insane', apiSuffix: '_solo_insane' },
            { 'Mode': 'Team Normal', apiSuffix: '_team_normal' },
            { 'Mode': 'Team Insane', apiSuffix: '_team_insane' }
        ]
    },
    SkyClash: {
        name: 'SkyClash', icon: 'fa-cloud-bolt',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Wins', key: 'wins' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Losses', key: 'losses' },
            { label: 'Assists', key: 'assists' },
            { label: 'K/D', calc: s => s.deaths ? parseFloat((s.kills / s.deaths).toFixed(3)) : s.kills || 0 },
            { label: 'W/L', calc: s => s.losses ? parseFloat((s.wins / s.losses).toFixed(3)) : s.wins || 0 },
            { label: 'Mobs Spawned', key: 'mobs_spawned' }
        ],
        tableCols: { 'Kit': '', 'Kills': 'kills', 'Assists': 'assists', 'Deaths': 'deaths', 'K/D': 'KD' },
        modes: [
            { Mode: 'Swordsman', apiPrefix: 'swordsman_' },
            { Mode: 'Archer', apiPrefix: 'archer_' },
            { Mode: 'Paladin', apiPrefix: 'paladin_' }
        ],
        extraGroupTitle: 'SkyClash Extra',
        extraTables: [
            {
                tableCols: { 'Kit': '', 'Kills': 'kills', 'Deaths': 'deaths', 'Wins': 'wins', 'Losses': 'losses', 'K/D': 'KD', 'W/L': 'WL' },
                modes: [
                    { Mode: 'Hit And Run', apiPrefix: 'hit_and_run_' },
                    { Mode: 'Lucky Charm', apiPrefix: 'lucky_charm_' },
                    { Mode: 'Ender Master', apiPrefix: 'ender_master_' }
                ]
            },
            {
                tableCols: {
                    'Kit': '',
                    'L.Bow': 'longest_bow_shot',
                    'B.Shots': 'bow_shots',
                    'B.Hits': 'bow_hits',
                    'B.Acc': 'BowAccuracy',
                    'GP': 'games_played',
                    'V.Kill': 'void_kills',
                    'M.Kill': 'melee_kills',
                    'Mob': 'mob_kills',
                    'Echo': 'enderchests_opened'
                },
                modes: [
                    { Mode: 'Swordsman', apiPrefix: 'swordsman_' },
                    { Mode: 'Archer', apiPrefix: 'archer_' },
                    { Mode: 'Paladin', apiPrefix: 'paladin_' }
                ]
            },
            {
                tableCols: { 'Mode': '', 'Fastest Win': 'fastest_win', 'Kills': 'kills', 'Wins': 'wins', 'Losses': 'losses', 'Deaths': 'deaths' },
                modes: [
                    { Mode: 'Solo', apiPrefix: 'solo_' },
                    { Mode: 'Doubles', apiPrefix: 'doubles_' },
                    { Mode: 'Team War', apiPrefix: 'team_war_' }
                ]
            }
        ]
    },
    Paintball: {
        name: 'Paintball', icon: 'fa-droplet',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Wins', key: 'wins' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Shots fired', key: 'shots_fired' },
            { label: 'K/D', calc: s => (s.deaths || 0) > 0 ? parseFloat((s.kills / s.deaths).toFixed(3)) : (s.kills || 0) },
            { label: 'Shot / kill', calc: s => (s.kills || 0) > 0 ? parseFloat(((s.shots_fired || 0) / s.kills).toFixed(3)) : 0 },
            { label: 'Time in forcefield (HH-MM-SS)', calc: s => formatHms(s.time_in_forcefield || s.forcefield_time || 0) }
        ],
        tableCols: {},
        modes: [],
        extraGroupTitle: 'Perks',
        extraTables: [
            {
                tableCols: { 'Perk': '', 'Lvl': 'PerkLevel' },
                modes: [
                    { Mode: 'Fortune', apiPrefix: 'fortune_' },
                    { Mode: 'Superluck', apiPrefix: 'superluck_' },
                    { Mode: 'Transfusion', apiPrefix: 'transfusion_' },
                    { Mode: 'Endurance', apiPrefix: 'endurance_' },
                    { Mode: 'Godfather', apiPrefix: 'godfather_' }
                ]
            }
        ]
    },
    SpeedUHC: {
        name: 'Speed UHC', icon: 'fa-stopwatch',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Wins', key: 'wins' },
            { label: 'Losses', key: 'losses' },
            { label: 'K/D', calc: s => (s.deaths || 0) > 0 ? parseFloat((s.kills / s.deaths).toFixed(3)) : (s.kills || 0) },
            { label: 'W/L', calc: s => (s.losses || 0) > 0 ? parseFloat((s.wins / s.losses).toFixed(3)) : (s.wins || 0) },
            { label: 'Salt', calc: s => s.salt || s.score || 0 }
        ],
        tableCols: { 'Mode': '', 'Kills': 'kills', 'Deaths': 'deaths', 'Wins': 'wins', 'Losses': 'losses', 'K/D': 'KD', 'W/L': 'WL' },
        modes: [
            { Mode: 'Solo Normal', apiPrefix: 'solo_normal_' },
            { Mode: 'Solo Insane', apiPrefix: 'solo_insane_' },
            { Mode: 'Team Normal', apiPrefix: 'team_normal_' },
            { Mode: 'Team Insane', apiPrefix: 'team_insane_' }
        ]
    },
    SuperSmash: {
        name: 'Smash Heroes', icon: 'fa-mask',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Wins', key: 'wins' },
            { label: 'Losses', key: 'losses' },
            { label: 'K/D', calc: s => (s.deaths || 0) > 0 ? parseFloat((s.kills / s.deaths).toFixed(3)) : (s.kills || 0) },
            { label: 'W/L', calc: s => {
                const wins = Number(s.wins) || 0;
                const losses = Number(s.losses) || 0;
                return losses > 0 ? parseFloat((wins / losses).toFixed(3)) : (wins > 0 ? '∞' : 0);
            }},
            {
                label: 'Smash Level',
                calc: s => {
                    const direct = Number(s.smash_level || s.smashlevel || s.level || s.smashLevel || 0);
                    if (Number.isFinite(direct) && direct > 0) return direct;

                    let best = 0;
                    const seen = new Set();
                    const walk = (node) => {
                        if (!node || typeof node !== 'object' || seen.has(node)) return;
                        seen.add(node);

                        for (const [k, v] of Object.entries(node)) {
                            const nk = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (typeof v === 'number' && Number.isFinite(v) && /smash.*level|level.*smash|smashlevel/.test(nk)) {
                                best = Math.max(best, v);
                            } else if (v && typeof v === 'object') {
                                walk(v);
                            }
                        }
                    };

                    walk(s);
                    return best > 0 ? Math.floor(best) : 0;
                }
            }
        ],
        tableCols: {
            'Class': '',
            'Prestige': 'pres',
            'Level': 'level',
            'Kills': 'kills',
            'Deaths': 'deaths',
            'Wins': 'wins',
            'Losses': 'losses',
            'K/D': 'KD',
            'W/L': 'WL'
        },
        modes: [
            { Mode: 'Bulk', apiPrefix: 'bulk_' },
            { Mode: 'Tinman', apiPrefix: 'tinman_' },
            { Mode: 'Cake Monster', apiPrefix: 'cake_monster_' },
            { Mode: 'Marauder', apiPrefix: 'marauder_' },
            { Mode: 'Void crawler', apiPrefix: 'void_crawler_' },
            { Mode: 'General Cluck', apiPrefix: 'general_cluck_' },
            { Mode: 'Skull Fire', apiPrefix: 'skull_fire_' },
            { Mode: 'Sanic', apiPrefix: 'sanic_' },
            { Mode: 'Shoop', apiPrefix: 'shoop_' },
            { Mode: 'Spooderman', apiPrefix: 'spooderman_' },
            { Mode: 'Cryomancer', apiPrefix: 'cryomancer_' },
            { Mode: 'Karakot', apiPrefix: 'karakot_' },
            { Mode: 'Botmon', apiPrefix: 'botmon_' },
            { Mode: 'Pug', apiPrefix: 'pug_' },
            { Mode: 'Sergeant Shield', apiPrefix: 'sgt_shield_' },
            { Mode: 'Green Hood', apiPrefix: 'green_hood_' }
        ]
    },
    Duels: {
        name: 'Duels', icon: 'fa-hand-fist',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Wins', key: 'wins' },
            { label: 'Losses', key: 'losses' },
            { label: 'K/D', calc: s => s.deaths ? (s.kills / s.deaths).toFixed(3) : s.kills || 0 },
            { label: 'W/L', calc: s => s.losses ? (s.wins / s.losses).toFixed(3) : s.wins || 0 },
            { label: 'Best Overall Winstreak', key: 'best_overall_winstreak' }
        ],
        // Добавляем колонки для таблицы: Mode, Kills, Deaths, Wins, Losses, K/D, W/L, Best Winstreak
        tableCols: { 
            'Mode': '', 
            'Kills': 'kills', 
            'Deaths': 'deaths', 
            'Wins': 'wins', 
            'Losses': 'losses', 
            'K/D': 'KD', 
            'W/L': 'WL', 
            'Best Winstreak': 'best_winstreak' 
        },
        // Прописываем все подрежимы с их API-префиксами
        modes: [
            { Mode: 'UHC 1v1', apiPrefix: 'uhc_duel_' },
            { Mode: 'UHC 2v2', apiPrefix: 'uhc_doubles_' },
            { Mode: 'UHC 4v4', apiPrefix: 'uhc_four_' },
            { Mode: 'UHC Tournament', apiPrefix: 'uhc_tournament_' },
            { Mode: 'SkyWars 1v1', apiPrefix: 'sw_duel_' },
            { Mode: 'SkyWars 2v2', apiPrefix: 'sw_doubles_' },
            { Mode: 'SkyWars Tournament', apiPrefix: 'sw_tournament_' },
            { Mode: 'Blitz 1v1', apiPrefix: 'blitz_duel_' },
            { Mode: 'Sumo Tournament', apiPrefix: 'sumo_tournament_' },
            { Mode: 'Bridge 1v1', apiPrefix: 'bridge_duel_' },
            { Mode: 'Bridge 2v2', apiPrefix: 'bridge_doubles_' },
            { Mode: 'Bridge 3v3', apiPrefix: 'bridge_threes_' },
            { Mode: 'Bridge 4v4', apiPrefix: 'bridge_four_' },
            { Mode: 'Classic 1v1', apiPrefix: 'classic_duel_' },
            { Mode: 'OP 1v1', apiPrefix: 'op_duel_' },
            { Mode: 'OP 2v2', apiPrefix: 'op_doubles_' },
            { Mode: 'No Debuff 1v1', apiPrefix: 'no_debuff_duel_' },
            { Mode: 'Combo 1v1', apiPrefix: 'combo_duel_' },
            { Mode: 'Bow 1v1', apiPrefix: 'bow_duel_' },
            { Mode: 'Bow Spleef 1v1', apiPrefix: 'bowspleef_duel_' },
            { Mode: 'Mega Walls 1v1', apiPrefix: 'mw_duel_' },
            { Mode: 'Mega Walls 2v2', apiPrefix: 'mw_doubles_' }
        ]
    },
    MurderMystery: {
        name: 'Murder Mystery', icon: 'fa-magnifying-glass',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: '--- Overall Stats ---', calc: () => '' },
            { label: 'Kills', key: 'kills' },
            { label: 'Wins', key: 'wins' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Bow Kills', key: 'bow_kills' },
            { label: 'Was Hero', key: 'was_hero' },
            { label: 'K/D', calc: s => s.deaths ? parseFloat((s.kills / s.deaths).toFixed(3)) : s.kills || 0 },
            { label: 'W/L', calc: s => s.deaths ? parseFloat((s.wins / s.deaths).toFixed(3)) : s.wins || 0 },
            
            { label: '--- Classic Stats ---', calc: () => '' },
            { label: 'Kills ', calc: s => s.kills_MURDER_CLASSIC || 0 },
            { label: 'Wins ', calc: s => s.wins_MURDER_CLASSIC || 0 },
            { label: 'Deaths ', calc: s => s.deaths_MURDER_CLASSIC || 0 },
            
            { label: '--- Assassins Stats ---', calc: () => '' },
            { label: 'Kills  ', calc: s => s.kills_MURDER_ASSASSINS || 0 },
            { label: 'Wins  ', calc: s => s.wins_MURDER_ASSASSINS || 0 },
            { label: 'Deaths  ', calc: s => s.deaths_MURDER_ASSASSINS || 0 }
        ],
        tableCols: { 
            'Mode': '', 'Kills': 'kills', 'Wins': 'wins', 'Deaths': 'deaths', 'Hero Kills': 'was_hero', 'Bow Kills': 'bow_kills' 
        },
        modes: [
            { Mode: 'All', apiSuffix: '' },
            { Mode: 'Classic', apiSuffix: '_MURDER_CLASSIC' },
            { Mode: 'Assassins', apiSuffix: '_MURDER_ASSASSINS' },
            { Mode: 'Hardcore', apiSuffix: '_MURDER_HARDCORE' },
            { Mode: 'Double Up', apiSuffix: '_MURDER_DOUBLE_UP' },
            { Mode: 'Infection', apiSuffix: '_MURDER_INFECTION' }
        ]
    },
    Arcade: {
        name: 'Arcade Games', icon: 'fa-gamepad',
        overall: [
            { label: 'Coins', key: 'coins' },
            // Mini Walls
            { label: '--- Mini Walls ---', calc: () => '' }, 
            { label: 'Wins', key: 'wins_mini_walls' },
            { label: 'Kills', key: 'kills_mini_walls' },
            { label: 'Final Kills', key: 'final_kills_mini_walls' },
            { label: 'Deaths', key: 'deaths_mini_walls' },
            { label: 'Wither Damage', key: 'wither_damage_mini_walls' },
            { label: 'Arrows Hit', key: 'arrows_hit_mini_walls' },
            
            // Football
            { label: '--- Football ---', calc: () => '' },
            { label: 'Wins', calc: s => getNumberFromStatKeys(s, ['wins_soccer','wins_football','football_wins','wins']) || 0 },
            { label: 'Goals', calc: s => getNumberFromStatKeys(s, ['goals_soccer','goals_football','football_goals','goals']) || 0 },
            { label: 'Power Kicks', calc: s => getNumberFromStatKeys(s, ['powerkicks_soccer','power_kicks_soccer','powerkicks_football','power_kicks_football','power_kicks','powerkicks']) || 0 },

            // Galaxy Wars
            { label: '--- Galaxy Wars ---', calc: () => '' },
            { label: 'Kills', key: 'sw_kills' },
            { label: 'Deaths', key: 'sw_deaths' },
            { label: 'Rebel Kills', key: 'sw_rebel_kills' },
            { label: 'Shots Fired', key: 'sw_shots_fired' },

            // Farm Hunt
            { label: '--- Farm Hunt ---', calc: () => '' },
            { label: 'Poop Collected', key: 'poop_collected' },
            { label: 'Farm Hunt Wins', key: 'wins_farm_hunt' },

            // Grinch Simulator
            { label: '--- Grinch Simulator ---', calc: () => '' },
            { label: 'Total Gifts Collected', calc: s => getNumberFromStatKeys(s, ['gifts_grinch_simulator_v2','total_gifts_collected','total_gifts']) || 0 },
            { label: 'Wins', calc: s => getNumberFromStatKeys(s, ['wins_grinch_simulator_v2','wins_grinch_simulator','wins_grinch','wins']) || 0 },

            // Bounty Hunters
            { label: '--- Bounty Hunters ---', calc: () => '' },
            { label: 'Wins', calc: s => getNumberFromStatKeys(s, ['wins_oneinthequiver','wins_bounty_hunters','wins_bounty','wins']) || 0 },
            { label: 'Deaths', calc: s => getNumberFromStatKeys(s, ['deaths_oneinthequiver','deaths_bounty_hunters','deaths_bounty','deaths']) || 0 },
            { label: 'Bounty Kills', calc: s => getNumberFromStatKeys(s, ['bounty_kills_oneinthequiver','bounty_kills']) || 0 },
            { label: 'Kills', calc: s => getNumberFromStatKeys(s, ['kills_oneinthequiver','kills_bounty_hunters','kills_bounty','kills']) || 0 },

            // Blocking Dead
            { label: '--- Blocking Dead ---', calc: () => '' },
            { label: 'Kills', calc: s => getNumberFromStatKeys(s, ['kills_dayone','kills_blocking_dead','kills_blockingdead','kills']) || 0 },
            { label: 'Headshots', calc: s => getNumberFromStatKeys(s, ['headshots_dayone','headshots_blocking_dead','headshots']) || 0 },
            { label: 'Wins', calc: s => getNumberFromStatKeys(s, ['wins_dayone','wins_blocking_dead','wins_blockingdead','wins']) || 0 },
            { label: 'Melee Weapon', calc: s => s.melee_weapon || s.meleeWeapon || s.last_melee_weapon || s.melee_weapon_dayone || s.meleeWeaponDayone || '' },

            // Capture the Wool
            { label: '--- Capture the Wool ---', calc: () => '' },
            { label: 'Wins', key: 'woolhunt_participated_wins' },
            { label: 'Losses', key: 'woolhunt_participated_losses' },
            { label: 'Draws', calc: s => getNumberFromStatKeys(s, ['woolhunt_participated_draws','woolhunt_draws','draws_woolhunt']) || 0 },
            { label: 'Wools Captured', key: 'woolhunt_wools_captured' },
            { label: 'Wools Stolen', key: 'woolhunt_wools_stolen' },
            { label: 'Total Kills', key: 'woolhunt_kills' },
            { label: 'Total Deaths', key: 'woolhunt_deaths' },
            { label: 'Kills to/On Wool Holder', key: 'woolhunt_kills_on_woolholder' },
            { label: 'Kills with Wool', key: 'woolhunt_kills_with_wool' },

            // Hole in the Wall / Hypixel Says / Dragonwars
            { label: '--- Hole in the Wall ---', calc: () => '' },
            { label: 'Hole in the Wall Record (Final)', calc: s => getNumberFromStatKeys(s, ['hitw_record_f','hitw_record_q','hitw_record_hole_in_the_wall']) || 0 },
            { label: 'Hole in the Wall Record (Qualifying)', key: 'hitw_record_q' },
            { label: 'Total Hole in the Wall Rounds', key: 'rounds_hole_in_the_wall' },
            { label: 'Hypixel Says Rounds', calc: s => getNumberFromStatKeys(s, ['rounds_simon_says','rounds_santa_says','rounds_hypixel_says','rounds_hole_in_the_wall']) || 0 },
            { label: 'Hypixel Says Wins', calc: s => getNumberFromStatKeys(s, ['wins_simon_says','wins_santa_says','wins_hypixel_says']) || 0 },
            { label: 'Throwout Kills', key: 'kills_throw_out' },
            { label: 'Throwout Deaths', key: 'deaths_throw_out' },
            { label: 'Dragon Wars Kills', key: 'kills_dragonwars2' },
            { label: 'Dragon Wars Wins', key: 'wins_dragonwars2' },
            { label: 'Max Creeper Attack Wave', calc: s => getNumberFromStatKeys(s, ['max_wave','max_creeper_attack_wave','max_creeper_wave']) || 0 },
            { label: 'Party Games 1 Wins', key: 'wins_party' },
            { label: 'Party Games 2 Wins', key: 'wins_party_2' },
            { label: 'Party Games 3 Wins', key: 'wins_party_3' }
        ],
        tableCols: { 'Game': '' },
        modes: [],
    },
    Arena: {
        name: 'Arena Brawl', icon: 'fa-gavel',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Keys', key: 'keys' }
        ],
        tableCols: { 
            'Mode': '', 'Kills': 'kills', 'Deaths': 'deaths', 'Wins': 'wins', 'Losses': 'losses', 'Healed': 'healed', 'K/D': 'KD', 'W/L': 'WL' 
        },
        modes: [
            { Mode: '1v1', apiSuffix: '_1v1' },
            { Mode: '2v2', apiSuffix: '_2v2' },
            { Mode: '4v4', apiSuffix: '_4v4' }
        ]
    },
    TNTGames: {
        name: 'TNT Games', icon: 'fa-bomb',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'TNT Run Wins', key: 'wins_tntrun' },
            { label: 'TNT Tag Wins', calc: s => s.wins_tnttag || s.wins_tag || 0 },
            { label: 'PVP Run Wins', key: 'wins_pvprun' },
            { label: 'Bowspleef Wins', key: 'wins_bowspleef' },
            // В Bowspleef поражение — это смерть (deaths), считаем по ней
            { label: 'Bowspleef W/L', calc: s => {
                const w = s.wins_bowspleef || 0;
                const d = s.deaths_bowspleef || 0;
                return d > 0 ? parseFloat((w / d).toFixed(3)) : w;
            }},
            { label: 'TNT Wizards Kills', calc: s =>
                s.kills_tntwizard ||
                s.kills_tntwizards ||
                s.kills_wizards ||
                s.kills_wizard ||
                s.kills_capture ||
                s.capture_kills ||
                0
            },
            // На Hypixel победы в Wizards часто записываются в ключ wins_capture
            { label: 'TNT Wizards Wins', calc: s => s.wins_capture || s.wins_tntwizard || 0 },
            { label: 'TNT Wizards K/D', calc: s => {
                const k =
                    s.kills_tntwizard ||
                    s.kills_tntwizards ||
                    s.kills_wizards ||
                    s.kills_wizard ||
                    s.kills_capture ||
                    s.capture_kills ||
                    0;
                const d =
                    s.deaths_tntwizard ||
                    s.deaths_tntwizards ||
                    s.deaths_wizards ||
                    s.deaths_wizard ||
                    s.deaths_capture ||
                    s.capture_deaths ||
                    0;
                return d > 0 ? parseFloat((k / d).toFixed(3)) : k;
            }}
        ],
        tableCols: { 'Game': '' }, // Оставляем пустым, так как таблица нам тут не нужна
        modes: [] 
    },
    Quake: {
        name: 'Quakecraft', icon: 'fa-fire-flame-curved',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Highest Killstreak', key: 'highest_killstreak' },
            { label: 'Dash Power', key: 'dash_power' },
            { label: 'Dash Cooldown', key: 'dash_cooldown' }
        ],
        // Колонки для таблицы в точности как на твоем скрине
        tableCols: {
            'Mode': '',
            'Kills': 'kills',
            'Headshots': 'headshots',
            'Wins': 'wins',
            'Shots Fired': 'shots_fired',
            'Blocks Traveled': 'distance_travelled',
            'Godlikes': 'kills_godlike',
            'Killstreaks': 'killstreaks',
            'K/D': 'KD'
        },
        // Режимы (Solo - это базовые ключи без суффикса)
        modes: [
            { Mode: 'Overall', apiSuffix: '_overall' }, // Берем то, что сами посчитали
            { Mode: 'Solo', apiSuffix: '' },            // Пустой суффикс (базовые ключи API)
            { Mode: 'Teams', apiSuffix: '_teams' }      // Командные ключи
        ]
    },
    MCGO: {
        name: 'Cops And Crims', icon: 'fa-crosshairs',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Total Kills', key: 'kills' },
            { label: 'Total Deaths', key: 'deaths' },
            { label: 'Total Cop Kills', key: 'cop_kills' },
            { label: 'Total Criminal Kills', key: 'criminal_kills' }
        ],
        tableCols: {},
        modes: [],
        extraTablesCollapsible: true,
        extraTables: [
            {
                title: 'Defuse',
                tableCols: {
                    'Mode': '',
                    'Game Plays': 'game_plays',
                    'Wins': 'game_wins',
                    'Kills': 'kills',
                    'Cop Kills': 'cop_kills',
                    'Criminal Kills': 'criminal_kills',
                    'Deaths': 'deaths',
                    'Assists': 'assists',
                    'Planted': 'bombs_planted',
                    'Defused': 'bombs_defused',
                    'Round Wins': 'round_wins'
                },
                modes: [{ Mode: 'Defuse', apiPrefix: '' }]
            },
            {
                title: 'Deathmatch',
                tableCols: {
                    'Mode': '',
                    'Game Plays': 'game_plays',
                    'Wins': 'game_wins',
                    'Kills': 'kills',
                    'Cop Kills': 'cop_kills',
                    'Criminal Kills': 'criminal_kills',
                    'Deaths': 'deaths',
                    'Assists': 'assists'
                },
                modes: [{ Mode: 'Deathmatch', apiSuffix: '_deathmatch' }]
            },
            {
                title: 'Gungame',
                tableCols: {
                    'Mode': '',
                    'Game Plays': 'game_plays',
                    'Wins': 'game_wins',
                    'Kills': 'kills',
                    'Cop Kills': 'cop_kills',
                    'Criminal Kills': 'criminal_kills',
                    'Deaths': 'deaths',
                    'Assists': 'assists',
                    'Care Packages': 'packages_called',
                    'Speed Boost': 'speed_boost_called',
                    'Armor Pack': 'armor_pack_called'
                },
                modes: [{ Mode: 'Gungame', apiSuffix: '_gungame' }]
            },
            {
                title: 'Guns',
                tableCols: {
                    'Name': '',
                    'Kills': 'kills',
                    'Headshots': 'headshots',
                    'Cost Reduction': 'cost_reduction',
                    'Damage Increase': 'damage_increase',
                    'Recoil Reduction': 'recoil_reduction',
                    'Reload Time Reduction': 'reload_time_reduction'
                },
                modes: [
                    { Mode: 'Carbine', apiPrefix: 'carbine_' },
                    { Mode: 'Magnum', apiPrefix: 'magnum_' },
                    { Mode: 'Pistol', apiPrefix: 'pistol_' },
                    { Mode: 'Rifle', apiPrefix: 'rifle_' },
                    { Mode: 'Shotgun', apiPrefix: 'shotgun_' },
                    { Mode: 'Smg', apiPrefix: 'smg_' },
                    { Mode: 'Sniper', apiPrefix: 'sniper_' }
                ]
            }
        ]
    },
    HungerGames: {
        name: 'Blitz', icon: 'fa-bolt',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Wins', key: 'wins' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'K/D', calc: s => s.deaths ? parseFloat((s.kills / s.deaths).toFixed(3)) : s.kills || 0 },
            { label: 'W/L', calc: s => {
                const wins = Number(s.wins) || 0;
                const losses = Number(s.losses ?? s.deaths) || 0;
                return losses > 0 ? parseFloat((wins / losses).toFixed(3)) : wins;
            }}
        ],
        tableCols: { 'Kit': '', 'Level': 'blitz_level' },
        // Полный список всех китов Hypixel
        modes: [
            { Mode: 'Archer', apiPrefix: 'archer_' }, { Mode: 'Armorer', apiPrefix: 'armorer_' },
            { Mode: 'Astronaut', apiPrefix: 'astronaut_' }, { Mode: 'Baker', apiPrefix: 'baker_' },
            { Mode: 'Creepertamer', apiPrefix: 'creepertamer_' }, { Mode: 'Diver', apiPrefix: 'diver_' },
            { Mode: 'Farmer', apiPrefix: 'farmer_' }, { Mode: 'Fisherman', apiPrefix: 'fisherman_' }, { Mode: 'Floriculturist', apiPrefix: 'floriculturist_' },
            { Mode: 'Golem', apiPrefix: 'golem_' }, { Mode: 'HorseTamer', apiPrefix: 'horsetamer_' },
            { Mode: 'Hunter', apiPrefix: 'hunter_' }, { Mode: 'Hype Train', apiPrefix: 'hype_train_' },
            { Mode: 'Jockey', apiPrefix: 'jockey_' }, { Mode: 'Knight', apiPrefix: 'knight_' },
            { Mode: 'Meatmaster', apiPrefix: 'meatmaster_' }, { Mode: 'Necromancer', apiPrefix: 'necromancer_' },
            { Mode: 'Paladin', apiPrefix: 'paladin_' }, { Mode: 'Pigman', apiPrefix: 'pigman_' },
            { Mode: 'Ranger', apiPrefix: 'ranger_' }, { Mode: 'Reaper', apiPrefix: 'reaper_' },
            { Mode: 'Reddragon', apiPrefix: 'reddragon_' }, { Mode: 'Rogue', apiPrefix: 'rogue_' },
            { Mode: 'Scout', apiPrefix: 'scout_' }, { Mode: 'Shadow Knight', apiPrefix: 'shadow_knight_' },
            { Mode: 'Slimeyslime', apiPrefix: 'slimeyslime_' }, { Mode: 'Snowman', apiPrefix: 'snowman_' },
            { Mode: 'Speleologist', apiPrefix: 'speleologist_' }, { Mode: 'Tim', apiPrefix: 'tim_' },
            { Mode: 'Toxicologist', apiPrefix: 'toxicologist_' }, { Mode: 'Troll', apiPrefix: 'troll_' },
            { Mode: 'Viper', apiPrefix: 'viper_' }, { Mode: 'Warlock', apiPrefix: 'warlock_' },
            { Mode: 'Wolftamer', apiPrefix: 'wolftamer_' }
        ]
    },
    Walls3: {
        name: 'Mega Walls', icon: 'fa-border-all',
        overall: [
            { label: 'Coins', key: 'coins' },
            { label: 'Kills', key: 'kills' },
            { label: 'Deaths', key: 'deaths' },
            { label: 'Wins', key: 'wins' },
            { label: 'Losses', key: 'losses' },
            { label: 'Assists', key: 'assists' },
            { label: 'Final Kills', key: 'final_kills' },
            { label: 'Final Assists', key: 'final_assists' },
            { label: 'Wither Damage', key: 'wither_damage' },
            // Используем уже готовую функцию formatTime из твоего кода
            { label: 'Time played (DD, HH:MM:SS)', calc: s => formatTime(s.time_played || 0) }
        ],
        tableCols: {}, // Пусто, так как таблица не нужна
        modes: [] 
    }
};

// 2. ПРОСТОЙ ВИД (Оставшиеся мини-режимы)
const GAMES_CONFIG_SIMPLE = {
    TrueCombat: {
        name: 'Crazy Walls', icon: 'fa-shield-heart', fields: {
            'Coins': { keys: ['coins'] },
            'Kills': { keys: ['kills'] },
            'Deaths': { keys: ['deaths'] },
            'Wins': { keys: ['wins'] },
            'Losses': { keys: ['losses'] },
            'K/D': { calc: s => {
                const kills = Number(s.kills) || 0;
                const deaths = Number(s.deaths) || 0;
                return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
            }},
            'W/L': { calc: s => {
                const wins = Number(s.wins) || 0;
                const losses = Number(s.losses) || 0;
                return losses > 0 ? parseFloat((wins / losses).toFixed(3)) : wins;
            }}
        }
    },
    GingerBread: {
        name: 'Turbo Kart Racers', icon: 'fa-flag-checkered', fields: {
            'Coins': { keys: ['coins'] },
            'Gold Trophies': { keys: ['gold_trophy', 'gold_trophies'] },
            'Silver Trophies': { keys: ['silver_trophy', 'silver_trophies'] },
            'Bronze Trophies': { keys: ['bronze_trophy', 'bronze_trophies'] },
            'Laps Completed': { keys: ['laps_completed', 'lapscomplete', 'laps'] },
            'Coins Picked Up': { keys: ['coins_picked_up', 'coin_pickups', 'coinspickedup'] },
            'Power Ups Picked Up': {
                calc: s => {
                    const directKeys = [
                        'powerups_picked_up',
                        'power_ups_picked_up',
                        'powerup_pickups',
                        'powerupspickedup',
                        'powerup_picked_up',
                        'powerups_pickups',
                        'box_pickups',
                        'boxes_picked_up',
                        'boxes_pickedup'
                    ];

                    for (const directKey of directKeys) {
                        const value = Number(s[directKey]);
                        if (Number.isFinite(value) && value > 0) return Math.floor(value);
                    }

                    let best = 0;
                    for (const [key, value] of Object.entries(s || {})) {
                        const raw = Number(value);
                        if (!Number.isFinite(raw) || raw <= 0) continue;

                        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                        const hasPickup = /pickup|picked/.test(normalized);
                        const hasPowerOrBox = /power|box/.test(normalized);
                        if (!hasPickup || !hasPowerOrBox) continue;

                        best = Math.max(best, raw);
                    }

                    return Math.floor(best || 0);
                }
            }
        }
    },
    UHC: {
        name: 'UHC', icon: 'fa-apple-whole', fields: [
            { label: 'Coins', keys: ['coins'] },
            { label: 'Score', keys: ['score'] },
            { label: '--- Teams ---', calc: () => '' },
            { label: 'Kills', calc: s => getUhcModeStat(s, 'teams', 'kills') },
            { label: 'Deaths', calc: s => getUhcModeStat(s, 'teams', 'deaths') },
            { label: 'Wins', calc: s => getUhcModeStat(s, 'teams', 'wins') },
            {
                label: 'K/D',
                calc: s => {
                    const kills = getUhcModeStat(s, 'teams', 'kills');
                    const deaths = getUhcModeStat(s, 'teams', 'deaths');
                    return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                }
            },
            { label: '--- Solo ---', calc: () => '' },
            { label: 'Kills', calc: s => getUhcModeStat(s, 'solo', 'kills') },
            { label: 'Deaths', calc: s => getUhcModeStat(s, 'solo', 'deaths') },
            { label: 'Wins', calc: s => getUhcModeStat(s, 'solo', 'wins') },
            {
                label: 'K/D',
                calc: s => {
                    const kills = getUhcModeStat(s, 'solo', 'kills');
                    const deaths = getUhcModeStat(s, 'solo', 'deaths');
                    return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                }
            }
        ]
    },
    VampireZ: {
        name: 'VampireZ', icon: 'fa-ghost', fields: {
            'Coins': { keys: ['coins'] },
            'Human Wins': { keys: ['human_wins', 'wins_human', 'humanwins'] },
            'Human Kills': { keys: ['human_kills', 'kills_human', 'humankills'] },
            'Human Deaths': { keys: ['human_deaths', 'deaths_human', 'humandeaths'] },
            'Zombie Kills': { keys: ['zombie_kills', 'kills_zombie', 'zombiekills'] },
            'Vampire Kills': { keys: ['vampire_kills', 'kills_vampire', 'vampirekills'] },
            'Vampire Wins': { keys: ['vampire_wins', 'wins_vampire', 'vampirewins'] },
            'Vampire Deaths': { keys: ['vampire_deaths', 'deaths_vampire', 'vampiredeaths'] }
        }
    },
    Walls: {
        name: 'Walls', icon: 'fa-cubes', fields: {
            'Coins': { keys: ['coins'] },
            'Kills': { keys: ['kills'] },
            'Deaths': { keys: ['deaths', 'death'] },
            'Wins': { keys: ['wins'] },
            'Losses': { keys: ['losses', 'loss'] },
            'K/D': {
                calc: s => {
                    const kills = Number(getNumberFromStatKeys(s, ['kills']) || 0);
                    const deaths = Number(getNumberFromStatKeys(s, ['deaths', 'death']) || 0);
                    return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                }
            },
            'W/L': {
                calc: s => {
                    const wins = Number(getNumberFromStatKeys(s, ['wins']) || 0);
                    const losses = Number(getNumberFromStatKeys(s, ['losses', 'loss']) || 0);
                    return losses > 0 ? parseFloat((wins / losses).toFixed(3)) : wins;
                }
            }
        }
    },
    Battleground: {
        name: 'Warlords', icon: 'fa-khanda', fields: {
            'Coins': { keys: ['coins'] },
            'Kills': { keys: ['kills'] },
            'Assists': { keys: ['assists'] },
            'Deaths': { keys: ['deaths', 'death'] },
            'Wins': { keys: ['wins'] },
            'Losses': {
                calc: s => {
                    const direct = Number(getNumberFromStatKeys(s, ['losses', 'loss']));
                    if (Number.isFinite(direct) && direct >= 0) return direct;

                    const gamesPlayed = Number(getNumberFromStatKeys(s, ['games_played', 'gamesplayed', 'matches_played', 'matchesplayed']));
                    const wins = Number(getNumberFromStatKeys(s, ['wins']) || 0);
                    if (Number.isFinite(gamesPlayed) && gamesPlayed >= wins) return Math.max(0, gamesPlayed - wins);

                    return 0;
                }
            },
            'K/D': {
                calc: s => {
                    const kills = Number(getNumberFromStatKeys(s, ['kills']) || 0);
                    const deaths = Number(getNumberFromStatKeys(s, ['deaths', 'death']) || 0);
                    return deaths > 0 ? parseFloat((kills / deaths).toFixed(3)) : kills;
                }
            },
            'W/L': {
                calc: s => {
                    const wins = Number(getNumberFromStatKeys(s, ['wins']) || 0);
                    const lossesDirect = Number(getNumberFromStatKeys(s, ['losses', 'loss']));
                    const losses = Number.isFinite(lossesDirect) && lossesDirect >= 0
                        ? lossesDirect
                        : Math.max(0, Number(getNumberFromStatKeys(s, ['games_played', 'gamesplayed']) || 0) - wins);
                    return losses > 0 ? parseFloat((wins / losses).toFixed(3)) : wins;
                }
            },
            'Damage': {
                calc: s => {
                    const direct = Number(getNumberFromStatKeys(s, ['damage', 'damage_dealt', 'damage_done', 'total_damage', 'damageinflicted']));
                    if (Number.isFinite(direct) && direct > 0) return direct;

                    let best = 0;
                    for (const [key, value] of Object.entries(s || {})) {
                        const raw = Number(value);
                        if (!Number.isFinite(raw) || raw <= 0) continue;
                        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!/damage/.test(normalized)) continue;
                        if (/taken|received|self/.test(normalized)) continue;
                        best = Math.max(best, raw);
                    }
                    return best;
                }
            },
            'Healing': {
                calc: s => {
                    const direct = Number(getNumberFromStatKeys(s, [
                        'healing',
                        'healed',
                        'healing_done',
                        'total_healing',
                        'healingprovided',
                        'healingshammynum'
                    ]));
                    if (Number.isFinite(direct) && direct > 0) return direct;

                    let best = 0;
                    for (const [key, value] of Object.entries(s || {})) {
                        const raw = Number(value);
                        if (!Number.isFinite(raw) || raw <= 0) continue;
                        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                        const isHealing = /heal|healing/.test(normalized);
                        if (!isHealing) continue;
                        if (/received|taken|self|regen/.test(normalized)) continue;
                        best = Math.max(best, raw);
                    }
                    return best;
                }
            },
            'Flag Captures': {
                calc: s => {
                    const direct = Number(getNumberFromStatKeys(s, [
                        'flag_captures',
                        'flags_captured',
                        'captures',
                        'capture_flag',
                        'flagcaptured',
                        'captures_ctf'
                    ]));
                    if (Number.isFinite(direct) && direct > 0) return direct;

                    let best = 0;
                    for (const [key, value] of Object.entries(s || {})) {
                        const raw = Number(value);
                        if (!Number.isFinite(raw) || raw <= 0) continue;
                        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                        const hasFlag = /flag/.test(normalized);
                        const hasCapture = /capt|capture/.test(normalized);
                        if (!(hasFlag && hasCapture)) continue;
                        if (/return|stolen|carrier|time/.test(normalized)) continue;
                        best = Math.max(best, raw);
                    }
                    return best;
                }
            }
        }
    },
    Legacy: {
        name: 'Classic Games', icon: 'fa-hourglass-half', fields: {
            'Current tokens': { keys: ['current_tokens', 'tokens'] },
            'Total tokens': { keys: ['total_tokens'] },
            'Arena tokens': { keys: ['arena_tokens', 'tokens_arena'] },
            'Paintball tokens': { keys: ['paintball_tokens', 'tokens_paintball'] },
            'Quakecraft tokens': { keys: ['quakecraft_tokens', 'tokens_quakecraft', 'tokens_quake'] },
            'TKR tokens': { keys: ['tkr_tokens', 'gingerbread_tokens', 'tokens_tkr', 'tokens_gingerbread'] },
            'VampireZ tokens': { keys: ['vampirez_tokens', 'tokens_vampirez'] },
            'Walls tokens': { keys: ['walls_tokens', 'tokens_walls'] }
        }
    }
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ГЕНЕРАЦИИ ===

function generateDetailedTableAccordion(gameKey, config, stats, container, fullData = null) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item';

    const header = document.createElement('button');
    header.className = 'game-header';
    header.innerHTML = `<span><i class="fa-solid ${config.icon}"></i> ${config.name}</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

    const panel = document.createElement('div');
    panel.className = 'game-panel';

    const recalcOpenPanels = (fromElement) => {
        let currentPanel = fromElement.closest('.game-panel');

        while (currentPanel) {
            if (currentPanel.classList.contains('active')) {
                currentPanel.style.maxHeight = (currentPanel.scrollHeight + 300) + 'px';
            }
            currentPanel = currentPanel.parentElement ? currentPanel.parentElement.closest('.game-panel') : null;
        }
    };

    // 1. Общие статы (тут мы ПРИНИМАЕМ общие ключи типа coins)
    const overallContainer = document.createElement('div');
    overallContainer.className = 'overall-stats-list';
    
    // Специальная логика для Murder Mystery
    if (gameKey === 'MurderMystery') {
        let overallHtml = '';
        
        // General section
        const coins = stats.coins || 0;
        overallHtml += `<div class="overall-stats-section">
            <div class="section-title">General</div>
            <div class="overall-stats-row"><strong>Coins:</strong> <span>${coins.toLocaleString()}</span></div>
        </div>`;
        
        // Overall Stats section
        const kills = stats.kills || 0;
        const wins = stats.wins || 0;
        const deaths = stats.deaths || 0;
        const bowKills = stats.bow_kills || 0;
        const heroKills = stats.was_hero || 0;
        const kd = deaths ? parseFloat((kills / deaths).toFixed(3)) : kills || 0;
        const wl = deaths ? parseFloat((wins / deaths).toFixed(3)) : wins || 0;
        
        overallHtml += `<div class="overall-stats-section">
            <div class="section-title">Overall Stats</div>
            <div class="overall-stats-row"><strong>Kills:</strong> <span>${kills.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Wins:</strong> <span>${wins.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Deaths:</strong> <span>${deaths.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Bow Kills:</strong> <span>${bowKills.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Hero Kills:</strong> <span>${heroKills.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>K/D:</strong> <span>${kd.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>W/L:</strong> <span>${wl.toLocaleString()}</span></div>
        </div>`;
        
        // Classic Stats section
        const classicKills = stats.kills_MURDER_CLASSIC || 0;
        const classicWins = stats.wins_MURDER_CLASSIC || 0;
        const classicDeaths = stats.deaths_MURDER_CLASSIC || 0;
        
        overallHtml += `<div class="overall-stats-section">
            <div class="section-title">Classic Stats</div>
            <div class="overall-stats-row"><strong>Kills:</strong> <span>${classicKills.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Wins:</strong> <span>${classicWins.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Deaths:</strong> <span>${classicDeaths.toLocaleString()}</span></div>
        </div>`;
        
        // Assassins Stats section
        const assassinsKills = stats.kills_MURDER_ASSASSINS || 0;
        const assassinsWins = stats.wins_MURDER_ASSASSINS || 0;
        const assassinsDeaths = stats.deaths_MURDER_ASSASSINS || 0;
        
        overallHtml += `<div class="overall-stats-section">
            <div class="section-title">Assassins Stats</div>
            <div class="overall-stats-row"><strong>Kills:</strong> <span>${assassinsKills.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Wins:</strong> <span>${assassinsWins.toLocaleString()}</span></div>
            <div class="overall-stats-row"><strong>Deaths:</strong> <span>${assassinsDeaths.toLocaleString()}</span></div>
        </div>`;
        
        overallContainer.innerHTML = overallHtml;
    } else {
        // Нормальная логика для остальных игр
        let overallHtml = '';
        for (const item of config.overall) {
            const sectionMatch = String(item.label || '').match(/^---\s*(.+?)\s*---$/);
            if (sectionMatch) {
                overallHtml += `<div class="overall-stats-section"><div class="section-title">${sectionMatch[1]}</div></div>`;

                if (sectionMatch[1].toLowerCase().includes('capture the wool')) {
                    overallHtml += getCaptureTheWoolTableHtml();
                }

                continue;
            }

            let val = item.calc ? item.calc(stats) : (stats[item.key] || 0);
            overallHtml += `<div class="overall-stats-row"><strong>${item.label}:</strong> <span>${typeof val === 'number' ? val.toLocaleString() : val}</span></div>`;
        }
        overallContainer.innerHTML = overallHtml;
    }
    
    panel.appendChild(overallContainer);

    function getCaptureTheWoolTableHtml() {
        const rows = [
            { mode: 'Total', kills: getNumberFromStatKeys(stats, ['kills_capture_the_wool', 'woolhunt_kills']) || 0, deaths: getNumberFromStatKeys(stats, ['deaths_capture_the_wool', 'woolhunt_deaths']) || 0 },
            { mode: 'To/On Wool Holder', kills: getNumberFromStatKeys(stats, ['kills_to_on_wool_holder', 'woolhunt_kills_on_woolholder']) || 0, deaths: getNumberFromStatKeys(stats, ['deaths_to_on_wool_holder', 'woolhunt_deaths_to_woolholder']) || 0 },
            { mode: 'With Wool', kills: getNumberFromStatKeys(stats, ['kills_with_wool', 'woolhunt_kills_with_wool']) || 0, deaths: getNumberFromStatKeys(stats, ['deaths_with_wool', 'woolhunt_deaths_with_wool']) || 0 }
        ];

        const findWoolStat = (terms) => {
            let best = null;
            for (const [key, value] of Object.entries(stats)) {
                const lower = String(key).toLowerCase();
                if (!terms.every(term => lower.includes(term))) continue;
                const parsed = Number(value);
                if (!Number.isFinite(parsed)) continue;
                best = best === null ? parsed : Math.max(best, parsed);
            }
            return best;
        };

        const captureWinsRaw = getNumberFromStatKeys(stats, ['wins_capture_the_wool', 'woolhunt_wins', 'wins_capture', 'wins_woolhunt', 'wins_wool_hunt', 'woolhunt_wins', 'wool_hunt_wins', 'woolhunt_win']);
        const captureLossesRaw = getNumberFromStatKeys(stats, ['losses_capture_the_wool', 'woolhunt_losses', 'losses_capture', 'losses_woolhunt', 'losses_wool_hunt', 'woolhunt_loss', 'wool_hunt_losses']);
        const captureDrawsRaw = getNumberFromStatKeys(stats, ['draws_capture_the_wool', 'woolhunt_draws', 'ties_capture_the_wool', 'draws_woolhunt', 'woolhunt_ties', 'tie_woolhunt']);
        const woolsCapturedRaw = getNumberFromStatKeys(stats, ['wools_captured', 'wools_capture', 'captured_wools', 'wool_captured', 'woolhunt_wools_captured', 'woolhunt_wool_captured', 'captured_wool', 'wool_captures']);
        const woolsStolenRaw = getNumberFromStatKeys(stats, ['wools_stolen', 'stolen_wools', 'wool_stolen', 'woolhunt_wools_stolen', 'woolhunt_wool_stolen', 'stolen_wool']);

        const captureWins = captureWinsRaw !== undefined ? captureWinsRaw : (findWoolStat(['wool', 'win']) || 0);
        const captureLosses = captureLossesRaw !== undefined ? captureLossesRaw : (findWoolStat(['wool', 'loss']) || 0);
        const captureDraws = captureDrawsRaw !== undefined ? captureDrawsRaw : (findWoolStat(['wool', 'draw']) || findWoolStat(['wool', 'tie']) || 0);
        const woolsCaptured = woolsCapturedRaw !== undefined ? woolsCapturedRaw : (findWoolStat(['wool', 'captur']) || 0);
        const woolsStolen = woolsStolenRaw !== undefined ? woolsStolenRaw : (findWoolStat(['wool', 'stolen']) || 0);

        let html = '<div class="capture-the-wool-container"><div class="overall-stats-section" style="margin-bottom:6px;">';
        html += `<div class="overall-stats-row"><strong>Wins:</strong> <span>${captureWins.toLocaleString()}</span></div>`;
        html += `<div class="overall-stats-row"><strong>Losses:</strong> <span>${captureLosses.toLocaleString()}</span></div>`;
        html += `<div class="overall-stats-row"><strong>Draws:</strong> <span>${captureDraws.toLocaleString()}</span></div>`;
        html += `<div class="overall-stats-row"><strong>Wools Captured:</strong> <span>${woolsCaptured.toLocaleString()}</span></div>`;
        html += `<div class="overall-stats-row"><strong>Wools Stolen:</strong> <span>${woolsStolen.toLocaleString()}</span></div>`;
        html += '</div>';

        html += '<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>Mode</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>';
        for (const row of rows) {
            html += `<tr><td class="highlight">${row.mode}</td><td>${row.kills.toLocaleString()}</td><td>${row.deaths.toLocaleString()}</td></tr>`;
        }
        html += '</tbody></table></div>';

        html += '</div>'; // закрываем capture-the-wool-container

        return html;
    }

    const extractSkyWarsRankedSeasons = () => {
        if (gameKey !== 'SkyWars') return [];

        const candidates = [
            fullData?.skywarsRankedSeasons,
            fullData?.rankedSeasons,
            fullData?.ranked_seasons,
            fullData?.stats?.SkyWars?.rankedSeasons,
            fullData?.stats?.SkyWars?.ranked_seasons,
            fullData?.stats?.SkyWars?.rankedSeasonHistory,
            fullData?.stats?.SkyWars?.ranked_season_history
        ];

        for (const candidate of candidates) {
            if (!Array.isArray(candidate) || candidate.length === 0) continue;

            return candidate.map(entry => {
                if (!entry || typeof entry !== 'object') return null;

                const season = entry.season ?? entry.seasonNumber ?? entry.season_id ?? entry.seasonId ?? entry.id ?? '';
                const date = entry.date ?? entry.month ?? entry.monthYear ?? entry.label ?? entry.period ?? '—';
                const rating = Number(entry.rating ?? entry.points ?? entry.score ?? entry.value ?? 0);
                const position = Number(entry.position ?? entry.place ?? entry.rank ?? entry.placement ?? 0);

                if (season === '' && !date && !Number.isFinite(rating) && !Number.isFinite(position)) return null;

                return {
                    season,
                    date,
                    rating: Number.isFinite(rating) ? rating : 0,
                    position: Number.isFinite(position) ? position : 0
                };
            }).filter(Boolean);
        }

        return [];
    };

    const rankedSeasons = extractSkyWarsRankedSeasons();
    if (gameKey === 'SkyWars' && rankedSeasons.length > 0) {
        const rankedSection = document.createElement('div');
        rankedSection.className = 'overall-stats-section';
        rankedSection.innerHTML = `
            <div class="section-title">Ranked Seasons</div>
            <div class="stats-table-wrapper">
                <table class="stats-table skywars-ranked-seasons-table" style="min-width: 0; width: 100%;">
                    <thead>
                        <tr>
                            <th>Season</th>
                            <th>Date</th>
                            <th>Rating</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankedSeasons.map(entry => `
                            <tr>
                                <td>${entry.season || '—'}</td>
                                <td>${entry.date || '—'}</td>
                                <td>${Number(entry.rating || 0).toLocaleString('en-US')}</td>
                                <td>${Number(entry.position || 0).toLocaleString('en-US')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        panel.appendChild(rankedSection);
    }

    function renderModeTable(tableConfig, panelContainer, titleText = '') {
        if (!tableConfig?.modes || tableConfig.modes.length === 0) return;

        if (titleText) {
            const sectionTitle = document.createElement('button');
            sectionTitle.className = 'game-header active';
            sectionTitle.style.marginTop = '8px';
            sectionTitle.innerHTML = `<span>${titleText}</span>`;
            panelContainer.appendChild(sectionTitle);
        }

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'stats-table-wrapper';
        const table = document.createElement('table');
        table.className = 'stats-table';
        if (gameKey === 'HungerGames') table.classList.add('blitz-table');

        let headerRow = '<thead><tr>';
        for (const label of Object.keys(tableConfig.tableCols)) headerRow += `<th>${label}</th>`;
        table.innerHTML = headerRow + '</tr></thead>';

        const tbody = document.createElement('tbody');
        const firstColumnName = (Object.keys(tableConfig.tableCols)[0] || '').toLowerCase();
        const isPerkTable = firstColumnName === 'perk';

        let modesToRender = [...tableConfig.modes];
        if (gameKey === 'Paintball' && isPerkTable) {
            const knownPrefixes = new Set(
                modesToRender
                    .map(m => (m.apiPrefix || '').toLowerCase().replace(/_+$/, ''))
                    .filter(Boolean)
            );

            for (const [statKey, statValue] of Object.entries(stats)) {
                const raw = Number(statValue);
                if (Number.isNaN(raw) || raw < 0 || raw > 10) continue;

                const match = statKey.toLowerCase().match(/^([a-z0-9_]+?)_(?:level|lvl|perk|upgrade)$/);
                if (!match) continue;

                const perkPrefix = match[1];
                if (!perkPrefix || knownPrefixes.has(perkPrefix)) continue;

                const prettyName = perkPrefix
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());

                modesToRender.push({ Mode: prettyName, apiPrefix: `${perkPrefix}_` });
                knownPrefixes.add(perkPrefix);
            }
        }
        
        for (const mode of modesToRender) {
            const prefix = (mode.apiPrefix || '').toLowerCase();
            const suffix = (mode.apiSuffix || '').toLowerCase();
            const isKitTable = firstColumnName === 'kit';

            const findExactStatEntry = (candidates) => {
                for (const candidate of candidates) {
                    const lookup = candidate.toLowerCase();
                    for (const [statKey, statValue] of Object.entries(stats)) {
                        if (statKey.toLowerCase() === lookup) {
                            const parsed = Number(statValue);
                            if (!Number.isNaN(parsed)) return { found: true, value: parsed };
                        }
                    }
                }
                return { found: false, value: 0 };
            };

            const findExactStatValue = (candidates) => {
                const entry = findExactStatEntry(candidates);
                return entry.found ? entry.value : 0;
            };

            const toRoman = (value) => {
                const romanMap = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                return romanMap[value] || String(value);
            };

            const resolvePaintballPerkLevel = () => {
                const cleanPrefix = prefix.endsWith('_') ? prefix.slice(0, -1) : prefix;

                let entry = findExactStatEntry([
                    `${cleanPrefix}_level`,
                    `${cleanPrefix}level`,
                    `${cleanPrefix}_lvl`,
                    `${cleanPrefix}lvl`,
                    `${cleanPrefix}_perk`,
                    `${cleanPrefix}_upgrade`,
                    `perk_${cleanPrefix}`,
                    `perk_level_${cleanPrefix}`,
                    cleanPrefix
                ]);

                if (!entry.found) {
                    const normalizedPrefix = cleanPrefix.replace(/[^a-z0-9]/g, '');
                    const looksLikeLevelKey = /level|lvl|perk|upgrade/;

                    for (const [statKey, statValue] of Object.entries(stats)) {
                        const normalizedKey = statKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!normalizedKey.includes(normalizedPrefix)) continue;
                        if (!looksLikeLevelKey.test(normalizedKey)) continue;

                        const parsed = Number(statValue);
                        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 10) {
                            entry = { found: true, value: parsed };
                            break;
                        }
                    }
                }

                if (!entry.found) return 0;

                const zeroBased = Math.max(0, Math.floor(entry.value));
                return Math.max(1, Math.min(10, zeroBased + 1));
            };

            // ЭТА ФУНКЦИЯ ИЩЕТ ТОЛЬКО ВНУТРИ РЕЖИМА
            // УМНАЯ ИСКАЛКА (исправлено для Quake Solo и Arena Brawl)
            const getModeStat = (field) => {
                const f = field.toLowerCase();
                const p = prefix;
                const s = suffix;

                // 1. Если это Quakecraft и мы ищем Solo (префикс и суффикс пустые)
                // то нам НУЖНЫ чистые ключи (kills, wins и т.д.)
                if (gameKey === 'Quake' && p === '' && s === '') {
                    return stats[f] || 0;
                }

                // 1b. Если это Murder Mystery и мы ищем All (суффикс пустой)
                // то нам НУЖНЫ чистые ключи (kills, wins, deaths, was_hero, bow_kills)
                if (gameKey === 'MurderMystery' && s === '') {
                    return stats[f] || 0;
                }

                // 2. Для остальных случаев ищем ключи С ПРИСТАВКАМИ
                const variations = [p + f + s, f + s, p + f];
                // Убираем из поиска "чистое" поле, чтобы не хватать общие статы (для Arena Brawl)
                const specificVariations = variations.filter(v => v !== f && v !== '');

                for (let key in stats) {
                    if (specificVariations.includes(key.toLowerCase())) return stats[key];
                }

                if (gameKey === 'Duels') {
                    const duelMode = String(mode.Mode || '').toLowerCase();
                    const isNoDebuffMode = duelMode === 'no debuff 1v1' || duelMode === 'nodebuff 1x1' || duelMode === 'nodebuff 1v1';

                    if (isNoDebuffMode) {
                        const exactNoDebuffPrefixes = ['potion_duel_', 'no_debuff_duel_', 'nodebuff_duel_'];
                        const fieldAliases = {
                            kills: ['kills', 'kill'],
                            deaths: ['deaths', 'death'],
                            wins: ['wins', 'win'],
                            losses: ['losses', 'loss']
                        };

                        const aliases = fieldAliases[f] || [f];
                        const exactCandidates = [];
                        for (const ap of exactNoDebuffPrefixes) {
                            for (const alias of aliases) {
                                exactCandidates.push(`${ap}${alias}`);
                            }
                        }

                        for (const candidate of exactCandidates) {
                            const lookup = candidate.toLowerCase();
                            for (const [key, val] of Object.entries(stats)) {
                                if (String(key).toLowerCase() !== lookup) continue;
                                const parsed = Number(val);
                                if (Number.isFinite(parsed) && parsed >= 0) return parsed;
                            }
                        }

                        if (f === 'losses' || f === 'deaths') {
                            let roundsPlayed = null;
                            let wins = null;

                            for (const ap of exactNoDebuffPrefixes) {
                                const roundsKey = `${ap}rounds_played`.toLowerCase();
                                const winsKey = `${ap}wins`.toLowerCase();

                                for (const [key, val] of Object.entries(stats)) {
                                    const keyLower = String(key).toLowerCase();
                                    if (roundsPlayed === null && keyLower === roundsKey) {
                                        const parsedRounds = Number(val);
                                        if (Number.isFinite(parsedRounds) && parsedRounds >= 0) roundsPlayed = parsedRounds;
                                    }
                                    if (wins === null && keyLower === winsKey) {
                                        const parsedWins = Number(val);
                                        if (Number.isFinite(parsedWins) && parsedWins >= 0) wins = parsedWins;
                                    }
                                }
                            }

                            if (Number.isFinite(roundsPlayed) && Number.isFinite(wins)) {
                                const derivedLosses = Math.max(0, Math.floor(roundsPlayed - wins));
                                return derivedLosses;
                            }
                        }

                        return 0;
                    }

                    let altPrefixes = [];

                    if (duelMode === 'uhc tournament') {
                        altPrefixes = ['uhc_tournament_', 'uhc_meetup_'];
                    } else if (duelMode === 'skywars tournament') {
                        altPrefixes = ['sw_tournament_', 'skywars_tournament_'];
                    } else if (duelMode === 'sumo tournament') {
                        altPrefixes = ['sumo_tournament_', 'sumo_tourney_'];
                    } else if (duelMode === 'bridge 1v1') {
                        altPrefixes = ['bridge_duel_', 'bridge_1v1_'];
                    } else if (duelMode === 'bridge 2v2') {
                        altPrefixes = ['bridge_doubles_', 'bridge_2v2_', 'bridge_double_'];
                    } else if (duelMode === 'bridge 3v3') {
                        altPrefixes = ['bridge_threes_', 'bridge_3v3_', 'bridge_three_'];
                    } else if (duelMode === 'bridge 4v4') {
                        altPrefixes = ['bridge_four_', 'bridge_4v4_'];
                    } else if (duelMode === 'no debuff 1v1' || duelMode === 'nodebuff 1x1' || duelMode === 'nodebuff 1v1') {
                        altPrefixes = ['no_debuff_duel_', 'potion_duel_', 'nodebuff_duel_'];
                    }

                    if (altPrefixes.length > 0) {
                        const duelCandidates = [];
                        const allPrefixes = Array.from(new Set([p, ...altPrefixes].filter(Boolean)));

                        for (const ap of allPrefixes) {
                            const cleanAp = ap.replace(/_+$/g, '');
                            duelCandidates.push(
                                `${ap}${f}${s}`,
                                `${ap}${f}`,
                                `${f}_${cleanAp}`,
                                `${cleanAp}_${f}`,
                                `${f}${cleanAp}`,
                                `${cleanAp}${f}`
                            );
                        }

                        for (const candidate of duelCandidates) {
                            const lookup = candidate.toLowerCase();
                            for (const [key, val] of Object.entries(stats)) {
                                if (key.toLowerCase() === lookup) return val;
                            }
                        }

                        const trackedFields = {
                            kills: ['kills', 'kill'],
                            deaths: ['deaths', 'death'],
                            wins: ['wins', 'win'],
                            losses: ['losses', 'loss']
                        };

                        if (trackedFields[f]) {
                            const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
                            const modeAliases = allPrefixes
                                .map(ap => ap.replace(/_+$/g, ''))
                                .filter(Boolean)
                                .map(normalize);
                            const fieldAliases = trackedFields[f].map(alias => String(alias).toLowerCase());
                            const noisyKeyPattern = /(streak|ratio|kdr|wlr|kd|wl|highest|best|record|current)/i;

                            const tokenize = (text) => String(text)
                                .toLowerCase()
                                .split(/[^a-z0-9]+/g)
                                .filter(Boolean);

                            let best = null;
                            for (const [key, val] of Object.entries(stats)) {
                                const normalizedKey = normalize(key);
                                if (noisyKeyPattern.test(String(key))) continue;

                                const hasMode = modeAliases.some(alias => alias && normalizedKey.includes(alias));
                                if (!hasMode) continue;

                                const keyTokens = tokenize(key);
                                const hasField = fieldAliases.some(alias => keyTokens.includes(alias));
                                if (!hasField) continue;

                                const parsed = Number(val);
                                if (!Number.isFinite(parsed) || parsed < 0) continue;

                                best = best === null ? parsed : Math.max(best, parsed);
                            }

                            if (best !== null) return best;
                        }
                    }
                }

                if (gameKey === 'SkyClash') {
                    const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPrefix = p.replace(/_/g, '');
                    const cleanField = f.replace(/_/g, '');
                    const cleanSuffix = s.replace(/_/g, '');
                    const hasModePrefix = Boolean(cleanPrefix);

                    const skyCandidates = hasModePrefix
                        ? [
                            `${p}${f}${s}`,
                            `${p}${f}`,
                            `${f}_${cleanPrefix}`,
                            `${cleanPrefix}_${f}`,
                            `${cleanPrefix}${cleanField}`,
                            `${cleanField}${cleanPrefix}`,
                            `${cleanPrefix}_${cleanField}_${cleanSuffix}`,
                            `${cleanField}_${cleanPrefix}_${cleanSuffix}`
                        ]
                        : [
                            `${f}${s}`,
                            `${p}${f}${s}`,
                            `${p}${f}`
                        ];

                    const normalizedCandidates = new Set(skyCandidates.filter(Boolean).map(normalize));

                    for (const [key, val] of Object.entries(stats)) {
                        if (normalizedCandidates.has(normalize(key))) return val;
                    }

                    if (hasModePrefix) {
                        for (const [key, val] of Object.entries(stats)) {
                            const normalizedKey = normalize(key);
                            const hasMode = normalizedKey.includes(cleanPrefix);
                            const hasField = cleanField ? normalizedKey.includes(cleanField) : true;
                            if (hasMode && hasField) return val;
                        }
                    }

                    // Не возвращаем overall-ключи для mode-specific строк SkyClash.
                    if (hasModePrefix) return 0;
                }

                if (gameKey === 'SpeedUHC') {
                    const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPrefix = p.replace(/_/g, '');
                    
                    // 1. ТОЧНЫЙ поиск: сначала пробуем найти ТОЧНОЕ совпадение
                    const exactCandidates = [`${p}${f}${s}`, `${p}${f}`];
                    for (const cand of exactCandidates) {
                        const candLower = cand.toLowerCase();
                        for (const [key, val] of Object.entries(stats)) {
                            if (key.toLowerCase() === candLower) {
                                return val;
                            }
                        }
                    }
                    
                    // 2. Если префикс есть, ищем более специфичный key
                    if (cleanPrefix) {
                        const cleanField = f.replace(/_/g, '');
                        
                        // Сначала пробуем варианты вида "kill_solo", "death_solo_insane"
                        const candidates = [
                            `${f}_${cleanPrefix}`,           // kills_solo
                            `${cleanPrefix}_${f}`,           // solo_kills
                            `${f}${cleanPrefix}`,            // killssolo
                        ];
                        
                        for (const cand of candidates) {
                            for (const [key, val] of Object.entries(stats)) {
                                if (key.toLowerCase() === cand.toLowerCase()) {
                                    return val;
                                }
                            }
                        }
                        
                        // 3. УМНЫЙ нормализованный поиск - но избегаем false positives!
                        const normalizedField = normalize(cleanField);
                        const normalizedPrefix = normalize(cleanPrefix);
                        
                        // Собираем все ключи которые могут подойти
                        const possibleMatches = [];
                        for (const [key, val] of Object.entries(stats)) {
                            const normalizedKey = normalize(key);
                            const hasPrefix = normalizedKey.includes(normalizedPrefix);
                            const hasField = normalizedKey.includes(normalizedField);
                            
                            // Ищем только ключи которые содержат ОБА компонента
                            if (hasPrefix && hasField) {
                                possibleMatches.push({ key, val, len: normalizedKey.length });
                            }
                        }
                        
                        // Берём самый КОРОТКИЙ key (это часто самый специфичный)
                        if (possibleMatches.length > 0) {
                            possibleMatches.sort((a, b) => a.len - b.len);
                            const match = possibleMatches[0];
                            const parsed = Number(match.val);
                            if (!Number.isNaN(parsed)) {
                                return parsed;
                            }
                        }
                    }
                    
                    // Не возвращаем overall для режимов
                    if (cleanPrefix) return 0;
                }

                if (gameKey === 'UHC') {
                    const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPrefix = p.replace(/_+$/g, '');
                    const cleanField = f.replace(/_+$/g, '');

                    if (cleanPrefix) {
                        const exactCandidates = [
                            `${p}${f}${s}`,
                            `${p}${f}`,
                            `${f}_${cleanPrefix}`,
                            `${cleanPrefix}_${f}`,
                            `${cleanPrefix}${cleanField}`,
                            `${cleanField}${cleanPrefix}`,
                            `${cleanPrefix}${f}`,
                            `${f}${cleanPrefix}`
                        ];

                        for (const cand of exactCandidates) {
                            const candLower = cand.toLowerCase();
                            for (const [key, val] of Object.entries(stats)) {
                                if (key.toLowerCase() === candLower) {
                                    const parsed = Number(val);
                                    if (!Number.isNaN(parsed)) return parsed;
                                }
                            }
                        }

                        const fieldAliases = cleanField === 'deaths' ? ['deaths', 'death'] : [cleanField];
                        const prefixAliases = cleanPrefix === 'teams' ? ['teams', 'team'] : [cleanPrefix];

                        const matches = [];
                        for (const [key, val] of Object.entries(stats)) {
                            const nKey = normalize(key);
                            const hasPrefix = prefixAliases.some(prefixAlias => nKey.includes(normalize(prefixAlias)));
                            const hasField = fieldAliases.some(fieldAlias => nKey.includes(normalize(fieldAlias)));
                            if (!hasPrefix || !hasField) continue;

                            const parsed = Number(val);
                            if (!Number.isNaN(parsed)) {
                                matches.push(parsed);
                            }
                        }

                        if (matches.length > 0) {
                            return Math.max(...matches);
                        }

                        return 0;
                    }
                }

                if (gameKey === 'SuperSmash') {
                    const cleanField = f.replace(/_+$/g, '');
                    const modeName = String(mode.Mode || '').toLowerCase();
                    const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');

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
                    const smashClassKey = smashClassKeyMap[modeName];
                    const classStats = smashClassKey && stats && typeof stats === 'object' && stats.class_stats && typeof stats.class_stats === 'object'
                        ? stats.class_stats[smashClassKey]
                        : null;

                    const getNumeric = (value) => {
                        const parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : null;
                    };

                    if (classStats && typeof classStats === 'object') {
                        if (cleanField === 'pres') {
                            const pgValue = getNumeric(stats[`pg_${smashClassKey}`]);
                            if (pgValue !== null) return Math.floor(pgValue);

                            const nestedValue = getNumeric(classStats.pres) ?? getNumeric(classStats.prestige) ?? getNumeric(classStats.prestiges);
                            if (nestedValue !== null) return Math.floor(nestedValue);

                            const encodedLevel = getNumeric(classStats.level) ?? getNumeric(classStats.smash_level) ?? getNumeric(classStats.smashlevel) ?? getNumeric(classStats.hero_level);
                            if (encodedLevel !== null && encodedLevel >= 100) {
                                return Math.floor(encodedLevel / 100);
                            }

                            return 0;
                        }

                        if (cleanField === 'level') {
                            const topLevel = getNumeric(stats[`lastLevel_${smashClassKey}`]);
                            if (topLevel !== null) return Math.floor(topLevel);

                            const nestedLevel = getNumeric(classStats.level) ?? getNumeric(classStats.smash_level) ?? getNumeric(classStats.smashlevel) ?? getNumeric(classStats.hero_level) ?? getNumeric(classStats.lvl);
                            if (nestedLevel !== null) {
                                return nestedLevel >= 100 ? Math.floor(nestedLevel % 100) : Math.floor(nestedLevel);
                            }

                            return 0;
                        }

                        if (['kills', 'deaths', 'wins', 'losses'].includes(cleanField)) {
                            const value = getNumeric(classStats[cleanField]);
                            if (value !== null) return Math.floor(value);

                            if (cleanField === 'losses') {
                                const wins = getNumeric(classStats.wins) ?? 0;
                                const games = getNumeric(classStats.games) ?? 0;
                                if (games >= wins) {
                                    return Math.max(0, Math.floor(games - wins));
                                }
                            }

                            return 0;
                        }
                    }

                    const flattenedStats = [];
                    const visited = new Set();
                    const flatten = (node, path = []) => {
                        if (!node || typeof node !== 'object' || visited.has(node)) return;
                        visited.add(node);
                        for (const [k, v] of Object.entries(node)) {
                            const nextPath = [...path, String(k)];
                            if (v && typeof v === 'object') {
                                flatten(v, nextPath);
                            } else {
                                flattenedStats.push({ key: String(k), path: nextPath.join('.'), value: v });
                            }
                        }
                    };

                    const superSources = [stats];
                    if (fullData && fullData.stats && typeof fullData.stats === 'object') {
                        for (const [statsKey, statsVal] of Object.entries(fullData.stats)) {
                            if (!statsVal || typeof statsVal !== 'object' || statsVal === stats) continue;
                            const keyNorm = normalize(statsKey);
                            if (/(smash|hero)/.test(keyNorm)) {
                                superSources.push(statsVal);
                            }
                        }
                    }
                    if (fullData && fullData.achievements && typeof fullData.achievements === 'object') {
                        superSources.push(fullData.achievements);
                    }

                    for (const source of superSources) {
                        flatten(source);
                    }

                    const classAliasesByMode = {
                        'bulk': ['bulk', 'hulk'],
                        'tinman': ['tinman', 'ironman'],
                        'cake monster': ['cake_monster', 'cakemonster', 'cake'],
                        'marauder': ['marauder'],
                        'void crawler': ['void_crawler', 'voidcrawler', 'void'],
                        'general cluck': ['general_cluck', 'generalcluck', 'cluck'],
                        'skull fire': ['skull_fire', 'skullfire', 'skull'],
                        'sanic': ['sanic'],
                        'shoop': ['shoop', 'shoopdawhoop', 'shoop_da_whoop'],
                        'spooderman': ['spooderman', 'spooder', 'spider'],
                        'cryomancer': ['cryomancer', 'frost', 'frosty'],
                        'karakot': ['karakot'],
                        'botmon': ['botmon', 'botmobile', 'batman'],
                        'pug': ['pug'],
                        'sergeant shield': ['sgt_shield', 'sgtshield', 'sergeant_shield', 'sergeantshield'],
                        'green hood': ['green_hood', 'greenhood']
                    };

                    const classAliases = classAliasesByMode[modeName] || [];
                    if (classAliases.length === 0) return 0;
                    const classAliasNorms = classAliases.map(normalize);

                    const entryMatchesClass = (entry) => {
                        const keyLower = String(entry.key).toLowerCase();
                        const pathLower = String(entry.path).toLowerCase();
                        const keyNorm = normalize(entry.key);
                        const pathNorm = normalize(entry.path);

                        return classAliases.some(alias => {
                            const aliasLower = alias.toLowerCase();
                            const aliasNorm = normalize(alias);

                            if (keyLower === aliasLower) return true;
                            if (keyLower.startsWith(`${aliasLower}_`) || keyLower.endsWith(`_${aliasLower}`)) return true;
                            if (pathLower.includes(`.${aliasLower}.`) || pathLower.endsWith(`.${aliasLower}`)) return true;
                            if (keyNorm === aliasNorm) return true;
                            if (keyNorm.startsWith(aliasNorm) || keyNorm.endsWith(aliasNorm)) return true;
                            if (pathNorm.includes(aliasNorm)) return true;
                            return false;
                        });
                    };

                    const classEntries = flattenedStats.filter(entryMatchesClass);
                    if (classEntries.length === 0) return 0;

                    const getExactValue = (candidates) => {
                        const normalizedCandidates = new Set(candidates.map(c => normalize(c)).filter(Boolean));
                        const values = [];
                        for (const entry of flattenedStats) {
                            const keyNorm = normalize(entry.key);
                            const pathNorm = normalize(entry.path);
                            const keyPathNorm = normalize(`${entry.path}.${entry.key}`);
                            const matched = Array.from(normalizedCandidates).some(candidateNorm => {
                                if (!candidateNorm) return false;
                                return (
                                    keyNorm === candidateNorm ||
                                    pathNorm === candidateNorm ||
                                    keyPathNorm === candidateNorm ||
                                    keyNorm.endsWith(candidateNorm) ||
                                    pathNorm.endsWith(candidateNorm) ||
                                    keyPathNorm.endsWith(candidateNorm)
                                );
                            });
                            if (matched) {
                                const num = Number(entry.value);
                                if (Number.isFinite(num)) values.push(num);
                            }
                        }
                        return values.length > 0 ? Math.max(...values) : null;
                    };

                    const baseClassValues = classEntries
                        .filter(e => {
                            const keyNorm = normalize(e.key);
                            const pathParts = String(e.path).split('.').map(normalize);
                            const directKey = classAliasNorms.includes(keyNorm);
                            const inPathLeaf = pathParts.length > 0 && classAliasNorms.includes(pathParts[pathParts.length - 1]);
                            return directKey || inPathLeaf;
                        })
                        .map(e => Number(e.value))
                        .filter(v => Number.isFinite(v) && v >= 0);

                    if (cleanField === 'pres') {
                        const presCandidates = [];
                        for (const alias of classAliases) {
                            presCandidates.push(
                                `${alias}_pres`,
                                `${alias}_prestige`,
                                `${alias}_prestiges`,
                                `pres_${alias}`,
                                `prestige_${alias}`
                            );
                        }
                        const exactPres = getExactValue(presCandidates);
                        if (exactPres !== null && exactPres >= 0 && exactPres < 100) return Math.floor(exactPres);

                        const explicitPres = classEntries
                            .filter(e => /(pres|prestige|prestiges)$/i.test(String(e.key)))
                            .map(e => Number(e.value))
                            .filter(v => Number.isFinite(v) && v >= 0 && v < 100);
                        if (explicitPres.length > 0) return Math.floor(Math.max(...explicitPres));

                        const encodedLevelCandidates = [];
                        for (const alias of classAliases) {
                            encodedLevelCandidates.push(
                                `${alias}_level`,
                                `${alias}_lvl`,
                                `${alias}_smash_level`,
                                `${alias}_smashlevel`,
                                `${alias}_hero_level`,
                                `level_${alias}`,
                                `lvl_${alias}`,
                                `smash_level_${alias}`,
                                `smashlevel_${alias}`
                            );
                        }
                        const encodedFromLevel = getExactValue(encodedLevelCandidates);
                        if (encodedFromLevel !== null && encodedFromLevel >= 100) {
                            return Math.floor(encodedFromLevel / 100);
                        }

                        const encoded = baseClassValues.filter(v => v >= 100);
                        if (encoded.length > 0) return Math.floor(Math.max(...encoded) / 100);

                        const inferredFromClassLevels = classEntries
                            .filter(e => /(level|lvl|smash_level|smashlevel|hero_level)/i.test(String(e.key)))
                            .map(e => Number(e.value))
                            .filter(v => Number.isFinite(v) && v >= 100 && v < 10000);
                        if (inferredFromClassLevels.length > 0) {
                            return Math.floor(Math.max(...inferredFromClassLevels) / 100);
                        }

                        return 0;
                    }

                    if (cleanField === 'level') {
                        const levelCandidates = [];
                        for (const alias of classAliases) {
                            levelCandidates.push(
                                `${alias}_level`,
                                `${alias}_lvl`,
                                `${alias}_smash_level`,
                                `${alias}_smashlevel`,
                                `${alias}_hero_level`,
                                `level_${alias}`,
                                `lvl_${alias}`,
                                `smash_level_${alias}`,
                                `smashlevel_${alias}`
                            );
                        }
                        const exactLevel = getExactValue(levelCandidates);
                        if (exactLevel !== null && exactLevel >= 0 && exactLevel < 10000) {
                            return exactLevel >= 100 ? Math.floor(exactLevel % 100) : Math.floor(exactLevel);
                        }

                        const explicitLevel = classEntries
                            .filter(e => /(level|lvl|tier|mastery|smash_level|smashlevel|hero_level)/i.test(String(e.key)))
                            .map(e => Number(e.value))
                            .filter(v => Number.isFinite(v) && v >= 0 && v < 10000);
                        if (explicitLevel.length > 0) {
                            const raw = Math.max(...explicitLevel);
                            return raw >= 100 ? raw % 100 : Math.floor(raw);
                        }

                        const encoded = baseClassValues.filter(v => v >= 100);
                        if (encoded.length > 0) return Math.floor(Math.max(...encoded) % 100);

                        const directLevel = baseClassValues.filter(v => v > 0 && v < 100);
                        if (directLevel.length > 0) return Math.floor(Math.max(...directLevel));

                        return 0;
                    }

                    if (['kills', 'deaths', 'wins', 'losses'].includes(cleanField)) {
                        const fieldAliases = {
                            kills: ['kills', 'kill'],
                            deaths: ['deaths', 'death'],
                            wins: ['wins', 'win'],
                            losses: ['losses', 'loss']
                        };
                        const wantedFields = fieldAliases[cleanField] || [cleanField];

                        const exactFieldCandidates = [];
                        for (const alias of classAliases) {
                            for (const fld of wantedFields) {
                                exactFieldCandidates.push(
                                    `${alias}_${fld}`,
                                    `${fld}_${alias}`,
                                    `${alias}${fld}`,
                                    `${fld}${alias}`
                                );
                            }
                        }
                        const exactField = getExactValue(exactFieldCandidates);
                        const fallbackValues = classEntries
                            .filter(e => {
                                const key = String(e.key).toLowerCase();
                                const path = String(e.path).toLowerCase();
                                const hasWanted = wantedFields.some(fieldName => key.includes(fieldName) || path.includes(fieldName));
                                if (!hasWanted) return false;
                                if (/(streak|highest|max|best|record|ratio|kd|wl)/i.test(key)) return false;
                                if (/(streak|highest|max|best|record|ratio|kd|wl)/i.test(path)) return false;
                                return true;
                            })
                            .map(e => Number(e.value))
                            .filter(v => Number.isFinite(v) && v >= 0);

                        if (exactField !== null && exactField >= 0) {
                            if (fallbackValues.length > 0) {
                                const sumFallback = fallbackValues.reduce((acc, value) => acc + value, 0);
                                if (exactField < 10 && sumFallback > exactField) {
                                    return Math.floor(sumFallback);
                                }
                            }
                            return Math.floor(exactField);
                        }

                        if (fallbackValues.length > 0) {
                            const sumFallback = fallbackValues.reduce((acc, value) => acc + value, 0);
                            return Math.floor(sumFallback);
                        }

                        return 0;
                    }

                    return 0;
                }

                if (gameKey === 'MCGO') {
                    const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPrefix = p.replace(/_+$/g, '');
                    const cleanField = f.replace(/_+$/g, '');
                    const modeName = String(mode.Mode || '').toLowerCase();
                    const strictMode = modeName.includes('deathmatch') || modeName.includes('gungame');

                    const fieldAliases = {
                        game_plays: ['game_plays', 'games_played', 'gamesplayed'],
                        game_wins: ['game_wins', 'wins_played', 'winsplayed'],
                        kills: ['kills'],
                        cop_kills: ['cop_kills', 'copkills'],
                        criminal_kills: ['criminal_kills', 'criminalkills'],
                        deaths: ['deaths'],
                        assists: ['assists'],
                        bombs_planted: ['bombs_planted', 'bombplanted', 'plants'],
                        bombs_defused: ['bombs_defused', 'bombdefused', 'defuses'],
                        round_wins: ['round_wins', 'roundwins'],
                        packages_called: ['packages_called', 'care_packages', 'carepackage', 'carepackages'],
                        speed_boost_called: ['speed_boost_called', 'speed_boosts_called', 'speed_boosts', 'speedboosts'],
                        armor_pack_called: ['armor_pack_called', 'armor_packs_called', 'armor_packs', 'armorpacks'],
                        headshots: ['headshots'],
                        cost_reduction: ['cost_reduction', 'costreduction'],
                        damage_increase: ['damage_increase', 'damageincrease'],
                        recoil_reduction: ['recoil_reduction', 'recoilreduction'],
                        reload_time_reduction: [
                            'reload_time_reduction',
                            'reload_reduction',
                            'reloadtimereduction',
                            'reload_time_decrease',
                            'reload_decrease',
                            'reload_speed',
                            'reloadspeed',
                            'faster_reload'
                        ]
                    };

                    const modeAliases = modeName.includes('deathmatch')
                        ? ['deathmatch', 'death_match', 'tdm', 'teamdeathmatch']
                        : modeName.includes('gungame')
                            ? ['gungame', 'gun_game', 'gungame2']
                            : ['defuse', 'defusal'];

                    const aliases = fieldAliases[cleanField] || [cleanField];
                    const extendedAliases = [...aliases];

                    if (strictMode && cleanField === 'game_plays') {
                        extendedAliases.push('games', 'gameplays', 'matches', 'match_played', 'matches_played');
                    }

                    // Guns: у строки есть префикс оружия (carbine_, pistol_ и т.д.)
                    if (cleanPrefix) {
                        const gunCandidates = [];
                        for (const alias of extendedAliases) {
                            gunCandidates.push(
                                `${p}${alias}${s}`,
                                `${p}${alias}`,
                                `${cleanPrefix}_${alias}`,
                                `${alias}_${cleanPrefix}`,
                                `${cleanPrefix}${alias}`,
                                `${alias}${cleanPrefix}`
                            );
                        }

                        const uniqGunCandidates = Array.from(new Set(gunCandidates.filter(Boolean).map(v => v.toLowerCase())));
                        for (const candidate of uniqGunCandidates) {
                            for (const [key, val] of Object.entries(stats)) {
                                if (key.toLowerCase() === candidate) return val;
                            }
                        }

                        const normalizedPrefix = normalize(cleanPrefix);
                        const normalizedAliases = extendedAliases.map(normalize);
                        for (const [key, val] of Object.entries(stats)) {
                            const normalizedKey = normalize(key);
                            const hasPrefix = normalizedKey.includes(normalizedPrefix);
                            const hasField = normalizedAliases.some(a => a && normalizedKey.includes(a));
                            if (hasPrefix && hasField) return val;
                        }

                        if (cleanField === 'reload_time_reduction') {
                            for (const [key, val] of Object.entries(stats)) {
                                const normalizedKey = normalize(key);
                                const hasPrefix = normalizedKey.includes(normalizedPrefix);
                                const hasReload = normalizedKey.includes('reload');
                                const hasUpgradeHint =
                                    normalizedKey.includes('reduction') ||
                                    normalizedKey.includes('decrease') ||
                                    normalizedKey.includes('speed') ||
                                    normalizedKey.includes('upgrade') ||
                                    normalizedKey.includes('time');

                                if (!hasPrefix || !hasReload || !hasUpgradeHint) continue;

                                const parsed = Number(val);
                                if (Number.isFinite(parsed)) return parsed;
                            }
                        }

                        return 0;
                    }

                    const exactCandidates = [];
                    for (const alias of extendedAliases) {
                        if (strictMode) {
                            exactCandidates.push(`${p}${alias}${s}`, `${alias}${s}`);
                        } else {
                            exactCandidates.push(`${p}${alias}${s}`, `${p}${alias}`, `${alias}${s}`);
                        }

                        if (modeAliases.length > 0) {
                            for (const modeAlias of modeAliases) {
                                exactCandidates.push(
                                    `${alias}_${modeAlias}`,
                                    `${modeAlias}_${alias}`,
                                    `${alias}${modeAlias}`,
                                    `${modeAlias}${alias}`
                                );
                            }
                        }
                    }

                    const uniqExact = Array.from(new Set(exactCandidates.filter(Boolean).map(v => v.toLowerCase())));
                    for (const candidate of uniqExact) {
                        for (const [key, val] of Object.entries(stats)) {
                            if (key.toLowerCase() === candidate) return val;
                        }
                    }

                    const normalizedAliases = extendedAliases.map(normalize);
                    const normalizedModeAliases = modeAliases.map(normalize);

                    for (const [key, val] of Object.entries(stats)) {
                        const normalizedKey = normalize(key);
                        const hasField = normalizedAliases.some(a => a && normalizedKey.includes(a));
                        if (!hasField) continue;

                        const hasMode = normalizedModeAliases.some(m => m && normalizedKey.includes(m));
                        if (strictMode && !hasMode) continue;

                        if (!strictMode && hasMode) continue;
                        return val;
                    }

                    if (strictMode) return 0;
                }

                // 3. Fallback для Bedwars
                if (gameKey === 'Bedwars') {
                    const bwVars = [p + f + '_bedwars', p + f];
                    for (let key in stats) {
                        if (bwVars.includes(key.toLowerCase())) return stats[key];
                    }
                }

                // 4. Если мы ищем Overall (который мы сами посчитали в getStats)
                if (s === '_overall') {
                    return stats[f + '_overall'] || 0;
                }

                return 0;
            };

            let modeLabel = mode.Mode;

            if (gameKey === 'SkyClash' && isKitTable && !/\([IVXLCDM]+\)$/.test(modeLabel)) {
                const cleanPrefix = prefix.endsWith('_') ? prefix.slice(0, -1) : prefix;
                let kitLevel = findExactStatValue([
                    `${cleanPrefix}_kit_level`,
                    `${cleanPrefix}_level`,
                    `${cleanPrefix}level`,
                    `kit_level_${cleanPrefix}`,
                    `kit_${cleanPrefix}`,
                    `${cleanPrefix}_lvl`,
                    `${cleanPrefix}lvl`,
                    `lvl_${cleanPrefix}`,
                    `${cleanPrefix}_tier`,
                    cleanPrefix
                ]);

                if (!(kitLevel > 0)) {
                    const normalizedMode = cleanPrefix.replace(/[^a-z0-9]/g, '');
                    const looksLikeLevelKey = /kit|level|lvl|tier|upgrade/;

                    for (const [statKey, statValue] of Object.entries(stats)) {
                        const normalizedKey = statKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!normalizedKey.includes(normalizedMode)) continue;
                        if (!looksLikeLevelKey.test(normalizedKey)) continue;

                        const parsed = Number(statValue);
                        if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 10) {
                            kitLevel = Math.max(kitLevel, parsed);
                        }
                    }
                }

                const normalizedLevel = Math.max(0, Math.min(10, Math.floor(kitLevel)));
                if (normalizedLevel > 0) {
                    modeLabel = `${modeLabel} (${toRoman(normalizedLevel)})`;
                }
            }

            let row = `<tr><td class="highlight">${modeLabel}</td>`;
            let skipModeRow = false;
            let paintballPerkDisplayLevel = 0;

            for (const [, fieldName] of Object.entries(tableConfig.tableCols).slice(1)) {
                let value = 0;

                if (fieldName === 'KD') {
                    const k = getModeStat('kills');
                    const d = getModeStat('deaths');
                    value = d > 0 ? parseFloat((k / d).toFixed(3)) : k;
                } 
                else if (fieldName === 'FinalKD') {
                    const fk = getModeStat('final_kills_bedwars');
                    const fd = getModeStat('final_deaths_bedwars');
                    value = fd > 0 ? parseFloat((fk / fd).toFixed(3)) : fk;
                }
                else if (fieldName === 'BowAccuracy') {
                    const shots = getModeStat('bow_shots');
                    const hits = getModeStat('bow_hits');
                    value = hits > 0 ? parseFloat((shots / hits).toFixed(3)) : shots;
                }
                else if (fieldName === 'PerkLevel') {
                    paintballPerkDisplayLevel = resolvePaintballPerkLevel();
                    value = paintballPerkDisplayLevel > 0 ? `${paintballPerkDisplayLevel} (${toRoman(paintballPerkDisplayLevel)})` : 0;
                }
                else if (fieldName === 'WL') {
                    const w = Number(getModeStat('wins')) || 0;
                    const l = Number(getModeStat('losses')) || 0;
                    value = l > 0 ? parseFloat((w / l).toFixed(3)) : (w > 0 ? '∞' : 0);
                }
                else if (fieldName === 'best_winstreak') {
                    const clean = prefix.endsWith('_') ? prefix.slice(0, -1) : prefix;
                    const duelMode = String(mode.Mode || '').toLowerCase();
                    const isNoDebuffMode = duelMode === 'no debuff 1v1' || duelMode === 'nodebuff 1x1' || duelMode === 'nodebuff 1v1';
                    const wsKeys = isNoDebuffMode
                        ? [
                            'potion_duel_winstreak',
                            'potion_duel_best_winstreak',
                            'no_debuff_duel_winstreak',
                            'no_debuff_duel_best_winstreak',
                            'nodebuff_duel_winstreak',
                            'nodebuff_duel_best_winstreak',
                            'best_no_debuff_winstreak',
                            'best_winstreak_mode_potion_duel',
                            'current_no_debuff_winstreak',
                            'current_winstreak_mode_potion_duel'
                        ]
                        : [prefix + 'winstreak', prefix + 'best_winstreak', `best_winstreak_mode_${clean}`, `win_streaks${suffix}`, 'best_winstreak', 'leaderboardPage_win_streak'];
                    let maxWs = 0;
                    for (let vk of wsKeys) {
                        for (let sk in stats) {
                            if (sk.toLowerCase() === vk.toLowerCase()) maxWs = Math.max(maxWs, Number.parseInt(stats[sk], 10) || 0);
                        }
                    }
                    value = maxWs;
                }
                else if (gameKey === 'MCGO' && fieldName === 'game_plays') {
                    const modeName = String(mode.Mode || '').toLowerCase();
                    const normalize = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const modeAliases = modeName.includes('deathmatch')
                        ? ['deathmatch', 'death_match', 'tdm', 'teamdeathmatch']
                        : modeName.includes('gungame')
                            ? ['gungame', 'gun_game', 'gungame2']
                            : ['defuse', 'defusal'];

                    const gameAliases = ['game_plays', 'games_played', 'games', 'gameplays', 'matches_played', 'matches'];

                    const exactCandidates = [];
                    for (const g of gameAliases) {
                        exactCandidates.push(g);
                        for (const m of modeAliases) {
                            exactCandidates.push(`${g}_${m}`, `${m}_${g}`, `${g}${m}`, `${m}${g}`);
                        }
                    }

                    let gamesPlayed = 0;
                    const uniqExact = Array.from(new Set(exactCandidates.map(v => String(v).toLowerCase())));
                    for (const candidate of uniqExact) {
                        for (const [key, val] of Object.entries(stats)) {
                            if (String(key).toLowerCase() === candidate) {
                                const parsed = Number(val);
                                if (Number.isFinite(parsed) && parsed >= 0) {
                                    gamesPlayed = parsed;
                                    break;
                                }
                            }
                        }
                        if (gamesPlayed > 0) break;
                    }

                    if (gamesPlayed <= 0) {
                        const normalizedModeAliases = modeAliases.map(normalize);
                        const normalizedGameAliases = gameAliases.map(normalize);
                        const strictMode = modeName.includes('deathmatch') || modeName.includes('gungame');

                        for (const [key, val] of Object.entries(stats)) {
                            const normalizedKey = normalize(key);
                            const hasGamePart = normalizedGameAliases.some(a => a && normalizedKey.includes(a));
                            if (!hasGamePart) continue;

                            const hasModePart = normalizedModeAliases.some(a => a && normalizedKey.includes(a));
                            if (strictMode && !hasModePart) continue;
                            if (!strictMode && hasModePart) continue;

                            const parsed = Number(val);
                            if (Number.isFinite(parsed) && parsed >= 0) {
                                gamesPlayed = parsed;
                                break;
                            }
                        }
                    }

                    if (gamesPlayed <= 0) {
                        const wins = Number(getModeStat('game_wins')) || Number(getModeStat('wins')) || 0;
                        const losses = Number(getModeStat('losses')) || 0;
                        if (losses > 0) {
                            gamesPlayed = wins + losses;
                        }
                    }

                    value = gamesPlayed;
                }
                else if (gameKey === 'HungerGames' && fieldName === 'blitz_level') {
                    const cleanPrefix = prefix.endsWith('_') ? prefix.slice(0, -1) : prefix;

                    const findStatValue = (candidates) => {
                        for (const candidate of candidates) {
                            const lookup = candidate.toLowerCase();
                            for (const [statKey, statValue] of Object.entries(stats)) {
                                if (statKey.toLowerCase() === lookup) {
                                    const parsed = Number(statValue);
                                    if (!Number.isNaN(parsed)) return parsed;
                                }
                            }
                        }
                        return 0;
                    };

                    const level = findStatValue([
                        `${cleanPrefix}_blitz_level`,
                        `${cleanPrefix}blitz_level`,
                        cleanPrefix,
                        `${cleanPrefix}_level`,
                        `kit_${cleanPrefix}`,
                        `kit_level_${cleanPrefix}`
                    ]) || Number(getModeStat('blitz_level')) || 0;

                    if (level <= 0) {
                        skipModeRow = true;
                        break;
                    }

                    const normalizedLevel = Math.max(0, Math.min(10, Math.floor(level)));
                    const filledSquares = '■'.repeat(normalizedLevel);
                    const emptySquares = '■'.repeat(10 - normalizedLevel);
                    const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][normalizedLevel] || normalizedLevel;

                    value = `<span style="color:#f5a623; letter-spacing:1px;">${filledSquares}</span><span style="color:#b7c0cc; letter-spacing:1px;">${emptySquares}</span> <span>(${roman})</span>`;
                }
                else {
                    value = getModeStat(fieldName);
                }
                
                row += `<td>${typeof value === 'number' ? value.toLocaleString('en-US') : value}</td>`;
            }

            if (gameKey === 'SkyClash' && !skipModeRow) {
                const numeric = (v) => Number(v) || 0;

                const activityScore =
                    numeric(getModeStat('games_played')) +
                    numeric(getModeStat('kills')) +
                    numeric(getModeStat('wins')) +
                    numeric(getModeStat('deaths')) +
                    numeric(getModeStat('losses')) +
                    numeric(getModeStat('assists')) +
                    numeric(getModeStat('bow_shots')) +
                    numeric(getModeStat('bow_hits')) +
                    numeric(getModeStat('void_kills')) +
                    numeric(getModeStat('melee_kills')) +
                    numeric(getModeStat('mob_kills')) +
                    numeric(getModeStat('enderchests_opened'));

                if (isKitTable) {
                    if (activityScore <= 0) {
                        skipModeRow = true;
                    }
                } else if (activityScore <= 0) {
                    skipModeRow = true;
                }
            }

            if (gameKey === 'Paintball' && !skipModeRow) {
                if (firstColumnName === 'perk') {
                    if (!(paintballPerkDisplayLevel > 0)) {
                        skipModeRow = true;
                    }
                }
            }

            if (gameKey === 'SuperSmash' && !skipModeRow) {
                const playedScore =
                    (Number(getModeStat('wins')) || 0) +
                    (Number(getModeStat('losses')) || 0) +
                    (Number(getModeStat('kills')) || 0) +
                    (Number(getModeStat('deaths')) || 0);

                const progressionScore =
                    (Number(getModeStat('level')) || 0) +
                    (Number(getModeStat('pres')) || 0);

                if (playedScore <= 0 && progressionScore <= 0) {
                    skipModeRow = true;
                }
            }

            if (skipModeRow) continue;
            tbody.innerHTML += row + '</tr>';
        }

        if (!tbody.children.length) return;

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        panelContainer.appendChild(tableWrapper);
    };

    // 2. Основная таблица
    renderModeTable({ tableCols: config.tableCols, modes: config.modes }, panel);

    // 3. Дополнительные таблицы (если есть)
    if (Array.isArray(config.extraTables) && config.extraTables.length > 0) {
        if (config.extraGroupTitle) {
            const extraItem = document.createElement('div');
            extraItem.className = 'game-item';
            extraItem.style.marginTop = '14px';

            const extraHeader = document.createElement('button');
            extraHeader.className = 'game-header';
            extraHeader.innerHTML = `<span>${config.extraGroupTitle}</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

            const extraPanel = document.createElement('div');
            extraPanel.className = 'game-panel';

            for (const extra of config.extraTables) {
                renderModeTable(extra, extraPanel, extra.title || '');
            }

            extraHeader.addEventListener('click', () => {
                extraHeader.classList.toggle('active');
                extraPanel.classList.toggle('active');
                extraPanel.style.maxHeight = extraPanel.classList.contains('active')
                    ? (extraPanel.scrollHeight + 140) + 'px'
                    : null;
                recalcOpenPanels(extraHeader);
            });

            extraItem.appendChild(extraHeader);
            extraItem.appendChild(extraPanel);
            panel.appendChild(extraItem);
        } else if (config.extraTablesCollapsible) {
            for (const extra of config.extraTables) {
                const tableItem = document.createElement('div');
                tableItem.className = 'game-item';
                tableItem.style.marginTop = '12px';

                const tableHeader = document.createElement('button');
                tableHeader.className = 'game-header';
                tableHeader.innerHTML = `<span>${extra.title || 'Details'}</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

                const tablePanel = document.createElement('div');
                tablePanel.className = 'game-panel';

                renderModeTable(extra, tablePanel, '');

                tableHeader.addEventListener('click', () => {
                    tableHeader.classList.toggle('active');
                    tablePanel.classList.toggle('active');
                    tablePanel.style.maxHeight = tablePanel.classList.contains('active')
                        ? (tablePanel.scrollHeight + 140) + 'px'
                        : null;
                    recalcOpenPanels(tableHeader);
                });

                tableItem.appendChild(tableHeader);
                tableItem.appendChild(tablePanel);
                panel.appendChild(tableItem);
            }
        } else {
            for (const extra of config.extraTables) {
                renderModeTable(extra, panel, extra.title || '');
            }
        }
    }

    header.onclick = () => {
        header.classList.toggle('active');
        panel.classList.toggle('active');
        panel.style.maxHeight = panel.classList.contains('active')
            ? (panel.scrollHeight + 140) + 'px'
            : null;
        recalcOpenPanels(header);
    };

    gameItem.appendChild(header);
    gameItem.appendChild(panel);
    container.appendChild(gameItem);
}

function generateSimpleStatsAccordion(gameKey, config, stats, container) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item';

    const header = document.createElement('button');
    header.className = 'game-header';
    header.innerHTML = `<span><i class="fa-solid ${config.icon}"></i> ${config.name}</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

    const panel = document.createElement('div');
    panel.className = 'game-panel';

    const getValueByKeys = (keys) => {
        if (!Array.isArray(keys) || keys.length === 0) return 0;

        for (const targetKey of keys) {
            const lookup = targetKey.toLowerCase();
            for (const [statKey, statValue] of Object.entries(stats)) {
                if (statKey.toLowerCase() === lookup) {
                    return statValue || 0;
                }
            }
        }

        return 0;
    };

    const fieldEntries = Array.isArray(config.fields)
        ? config.fields.map(item => [item.label, item])
        : Object.entries(config.fields || {});

    let statsHtml = '<div class="overall-stats-list">';
    for (const [label, fieldConfig] of fieldEntries) {
        const isSectionLabel = /^---.*---$/.test(String(label || ''));
        if (isSectionLabel) {
            const sectionText = String(label).replace(/^---\s*/, '').replace(/\s*---$/, '');
            statsHtml += `<div class="overall-stats-row" style="margin-top: 10px; border-bottom: none;"><strong style="font-size: 18px; color: #111827; font-weight: 600;">${sectionText}</strong></div>`;
            continue;
        }

        let value = 0;

        if (typeof fieldConfig === 'string') {
            value = stats[fieldConfig] || 0;
        } else if (fieldConfig && typeof fieldConfig.calc === 'function') {
            value = fieldConfig.calc(stats);
        } else if (fieldConfig && Array.isArray(fieldConfig.keys)) {
            value = getValueByKeys(fieldConfig.keys);
        }

        const renderedValue = typeof value === 'number'
            ? (gameKey === 'UHC' ? value.toLocaleString('en-US') : value.toLocaleString())
            : value;

        statsHtml += `<div class="overall-stats-row"><strong>${label}:</strong> <span>${renderedValue}</span></div>`;
    }
    statsHtml += '</div>';
    panel.innerHTML = statsHtml;

    header.addEventListener('click', function() {
        this.classList.toggle('active');
        panel.classList.toggle('active');

        if (panel.classList.contains('active')) {
            panel.style.maxHeight = (panel.scrollHeight + 140) + 'px';
        } else {
            panel.style.maxHeight = null;
        }
    });

    gameItem.appendChild(header);
    gameItem.appendChild(panel);
    container.appendChild(gameItem);
}

function generateGeneralStats(data, container) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item';

    const header = document.createElement('button');
    header.className = 'game-header';
    header.innerHTML = `<span><i class="fa-solid fa-star"></i> General Stats</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

    const panel = document.createElement('div');
    panel.className = 'game-panel';

    // Логика отображения питомца с fallback
    const normalizePetDisplay = (value) => String(value || '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

    const hasPet = Boolean(data.pet && data.pet.type && data.pet.type !== 'None');
    const petNameDisplay = hasPet
        ? normalizePetDisplay(data.pet?.name || data.pet.type)
        : 'None';
    const petTypeDisplay = hasPet ? data.pet.type : 'None';
    const petLevel = Number(data.pet?.level) > 0
        ? Number(data.pet.level)
        : (Number(data.pet?.exp) > 0 ? Math.max(1, Math.floor(Math.sqrt(Number(data.pet.exp) / 100))) : (hasPet ? 'N/A' : 0));

    const fmt = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed.toLocaleString('en-US') : value;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const activePetName = data.pet?.name || 'None';
    const allPets = Array.isArray(data.pet?.list) ? data.pet.list : [];

    panel.innerHTML = `
        <div class="overall-stats-list general-stats-list" style="padding: 15px 25px 20px;">
            <div class="overall-stats-row"><strong>Gifts given:</strong> <span>${fmt(data.giftsGiven)}</span></div>
            <div class="overall-stats-row"><strong>Gifts received:</strong> <span>${fmt(data.giftsReceived)}</span></div>
            <div class="overall-stats-row"><strong>Quests completed:</strong> <span>${fmt(data.questsCompleted || 0)}</span></div>
            <div class="overall-stats-row"><strong>Rewards claimed:</strong> <span>${fmt(data.rewardsClaimed)}</span></div>
            <div class="overall-stats-row"><strong>Daily rewards claimed:</strong> <span>${fmt(data.dailyRewards)}</span></div>
            <div class="overall-stats-row"><strong>Best reward streak:</strong> <span>${fmt(data.rewardStreak)}</span></div>
            <div class="overall-stats-row"><strong>Current reward streak:</strong> <span>${fmt(data.rewardCurrentStreak)}</span></div>
            <div class="overall-stats-row"><strong>Times voted:</strong> <span>${Number(data.votes) || 0}</span></div>
            <div class="overall-stats-row"><strong>Active Pet:</strong> <span>${escapeHtml(activePetName)}</span></div>
        </div>
    `;

    const petItem = document.createElement('div');
    petItem.className = 'game-item general-stats-pet-item';

    const petHeader = document.createElement('button');
    petHeader.className = 'game-header';
    petHeader.innerHTML = `<span>Pet</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

    const petPanel = document.createElement('div');
    petPanel.className = 'game-panel';

    const rows = allPets.map(p => {
        const petName = escapeHtml(p?.customName || p?.name || p?.type || 'Unknown');
        const petLevel = Number.isFinite(Number(p?.level)) ? Number(p.level) : 0;
        return `<tr><td>${petName}</td><td>${petLevel}</td></tr>`;
    }).join('');

    petPanel.innerHTML = `
        <div class="stats-table-wrapper general-stats-pet-table-wrap">
            <table class="stats-table pet-stats-table" style="min-width: 0; width: 100%;">
                <thead>
                    <tr><th>Name</th><th>Level</th></tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="2" class="pet-table-empty">No pets found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    petHeader.addEventListener('click', () => {
        petHeader.classList.toggle('active');
        petPanel.classList.toggle('active');
        petPanel.style.maxHeight = petPanel.classList.contains('active')
            ? 'none'
            : null;

        if (panel.classList.contains('active')) {
            panel.style.maxHeight = 'none';
        }
    });

    petItem.appendChild(petHeader);
    petItem.appendChild(petPanel);
    panel.appendChild(petItem);

    header.onclick = () => {
        header.classList.toggle('active');
        panel.classList.toggle('active');
        panel.style.maxHeight = panel.classList.contains('active')
            ? (panel.scrollHeight + 140) + 'px'
            : null;

        if (!panel.classList.contains('active')) {
            petHeader.classList.remove('active');
            petPanel.classList.remove('active');
            petPanel.style.maxHeight = null;
        }
    };

    gameItem.appendChild(header);
    gameItem.appendChild(panel);
    container.appendChild(gameItem);
}

function generateSpecialRating(stats, container) {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item';

    const header = document.createElement('button');
    header.className = 'game-header';
    header.innerHTML = `<span><i class="fa-solid fa-chart-line"></i> Special Rating</span> <i class="fa-solid fa-chevron-down arrow"></i>`;

    const panel = document.createElement('div');
    panel.className = 'game-panel';

    const pickNum = (source, keys) => {
        if (!source || !Array.isArray(keys)) return 0;
        for (const targetKey of keys) {
            const lookup = String(targetKey || '').toLowerCase();
            for (const [key, value] of Object.entries(source)) {
                if (String(key).toLowerCase() !== lookup) continue;
                const parsed = Number(value);
                if (Number.isFinite(parsed)) return parsed;
            }
        }
        return 0;
    };

    const getR = (g, kFields = ['kills'], dFields = ['deaths'], wFields = ['wins']) => {
        const s = stats[g];
        if (!s) return 0;

        const kills = pickNum(s, kFields);
        const deaths = pickNum(s, dFields);
        const wins = pickNum(s, wFields);

        if (!deaths || deaths <= 0) return 0;
        return Math.floor((kills / deaths) * wins);
    };

    const ratings = [
        { n: 'Quakecraft', v: getR('Quake') },
        { n: 'Walls', v: getR('Walls') },
        { n: 'Paintball', v: getR('Paintball') },
        { n: 'Blitz Survival Games', v: getR('HungerGames') },
        { n: 'Mega Walls', v: getR('Walls3', ['final_kills', 'kills'], ['final_deaths', 'deaths'], ['wins']) },
        { n: 'Cops and Crims', v: getR('MCGO', ['kills'], ['deaths'], ['game_wins', 'wins']) },
        { n: 'UHC Champions', v: getR('UHC') },
        { n: 'Warlords', v: getR('Battleground') },
        { n: 'Smash Heroes', v: getR('SuperSmash') },
        { n: 'SkyWars', v: getR('SkyWars') },
        { n: 'Crazy Walls', v: getR('TrueCombat') },
        { n: 'SkyClash', v: getR('SkyClash') },
        { n: 'Speed UHC', v: getR('SpeedUHC') },
        { n: 'Bedwars', v: getR('Bedwars', ['final_kills_bedwars', 'kills_bedwars'], ['final_deaths_bedwars', 'deaths_bedwars'], ['wins_bedwars', 'wins']) },
        { n: 'Murder Mystery', v: getR('MurderMystery') }
    ];

    // Копируем структуру General Stats: заголовок-описание и список с линиями
    let html = `
        <p style="font-size: 13px; color: var(--text-muted); padding: 20px 25px 10px;">
            Custom rating is calculate by taking a player's Kill / Death ratio and multiplying it by their wins
        </p>
        <div class="overall-stats-list" style="padding: 0 25px 20px;">
    `;
    
    ratings.forEach(r => {
        html += `
            <div class="overall-stats-row">
                <strong>${r.n}:</strong> 
                <span>${r.v.toLocaleString('en-US')}</span>
            </div>`;
    });
    
    panel.innerHTML = html + `</div>`;

    header.onclick = () => {
        header.classList.toggle('active');
        panel.classList.toggle('active');
        panel.style.maxHeight = panel.classList.contains('active') ? panel.scrollHeight + "px" : null;
    };

    gameItem.appendChild(header);
    gameItem.appendChild(panel);
    container.appendChild(gameItem);
}

