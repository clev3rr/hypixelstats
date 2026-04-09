'use strict';

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

module.exports = { calculateGuildLevelFromExp, mapWithConcurrency };
